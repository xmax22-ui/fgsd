/* ============================================================
   «Поехали» — сервер сайта, API и база данных
   Запуск: node server.cjs  (Node.js 22.5+)
   ============================================================ */

'use strict';

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const crypto = require('crypto');

const store = require('./db/db.cjs');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '1.0.0';

function readLocalConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'config.local.json'), 'utf8'));
  } catch (e) {
    return {};
  }
}

const LOCAL_CONFIG = readLocalConfig();
const SITE_URL = String(process.env.SITE_URL || LOCAL_CONFIG.siteUrl || '').replace(/\/+$/, '');
const FORCE_HTTPS = /^https:/i.test(SITE_URL) || process.env.FORCE_HTTPS === '1';
let TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || LOCAL_CONFIG.travelpayoutsToken || '';

/* ------------------------------------------------------------ утилиты */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function escapeXml(value) {
  return escapeHtml(value);
}

function sendBuffer(req, res, status, body, headers) {
  const outHeaders = Object.assign({
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Accept-Encoding'
  }, headers || {});

  let payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  const contentType = String(outHeaders['Content-Type'] || '');
  const compressible = /^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/svg\+xml)/i.test(contentType);
  const acceptsGzip = /\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''));

  if (compressible && acceptsGzip && payload.length > 1024) {
    payload = zlib.gzipSync(payload, { level: 9 });
    outHeaders['Content-Encoding'] = 'gzip';
  }
  outHeaders['Content-Length'] = payload.length;

  res.writeHead(status, outHeaders);
  if (req.method === 'HEAD') res.end();
  else res.end(payload);
}

function sendJson(req, res, status, data, extraHeaders) {
  const headers = Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Language': 'ru'
  }, extraHeaders || {});
  sendBuffer(req, res, status, JSON.stringify(data), headers);
}

function jsonEtag(data) {
  return '"' + crypto.createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 20) + '"';
}

function sendJsonCached(req, res, data, maxAge, extraHeaders) {
  const etag = jsonEtag(data);
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, {
      'ETag': etag,
      'Cache-Control': 'public, max-age=' + maxAge,
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end();
  }
  sendJson(req, res, 200, data, Object.assign({
    'ETag': etag,
    'Cache-Control': 'public, max-age=' + maxAge + ', stale-while-revalidate=300'
  }, extraHeaders || {}));
}

function readBody(req, limit) {
  const max = limit || 64 * 1024;
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > max) {
        const err = new Error('Слишком большой запрос');
        err.status = 413;
        reject(err);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) return resolve({});
      const type = String(req.headers['content-type'] || '');
      try {
        if (type.indexOf('application/json') !== -1 || raw.trim().startsWith('{')) {
          const parsed = JSON.parse(raw);
          return resolve(parsed && typeof parsed === 'object' ? parsed : {});
        }
        return resolve(Object.fromEntries(new URLSearchParams(raw)));
      } catch (e) {
        const err = new Error('Некорректный JSON в запросе');
        err.status = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function cleanText(value, maxLength) {
  return String(value === undefined || value === null ? '' : value).trim().slice(0, maxLength || 300);
}

function clientIdFrom(value) {
  const id = cleanText(value, 80);
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id) ? id : '';
}

function adminTokenFrom(req) {
  const auth = String(req.headers['authorization'] || '');
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  return cleanText(req.headers['x-admin-token'], 200);
}

function requireAdmin(req, res) {
  const token = adminTokenFrom(req);
  if (!store.checkAdminSession(token)) {
    sendJson(req, res, 401, { error: 'Нужен вход администратора: сессия не найдена или истекла' });
    return null;
  }
  return token;
}

/* простой ограничитель частоты запросов */
const buckets = new Map();
function rateLimit(req, name, max, windowMs) {
  const ip = req.socket.remoteAddress || 'local';
  const key = name + '|' + ip;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  if (bucket.count > max) return false;
  return true;
}
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.reset < now) buckets.delete(key);
  });
}, 5 * 60 * 1000).unref();

/* ----------------------------------------------------------- безопасность */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.wikipedia.org https://*.wikimedia.org https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://ru.wikipedia.org https://nominatim.openstreetmap.org https://router.project-osrm.org",
  "manifest-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'"
].join('; ');

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');
  res.setHeader('Content-Security-Policy', CSP + (FORCE_HTTPS ? "; upgrade-insecure-requests" : ''));
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  if (FORCE_HTTPS) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

/* --------------------------------------------------------- внешние API */
const cache = new Map();
function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.until < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
}
function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, until: Date.now() + ttlMs });
  if (cache.size > 400) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
}

async function flightsHandler(req, res, params) {
  if (!TRAVELPAYOUTS_TOKEN) {
    return sendJson(req, res, 503, { error: 'Токен Travelpayouts не задан на сервере' });
  }

  const origin = String(params.origin || '').toUpperCase();
  const destination = String(params.destination || '').toUpperCase();
  const departureAt = String(params.departure_at || '');

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || !/^\d{4}-\d{2}-\d{2}$/.test(departureAt)) {
    return sendJson(req, res, 400, { error: 'Неверные параметры: нужны IATA-коды и дата YYYY-MM-DD' });
  }

  const key = 'flights|' + origin + destination + departureAt;
  const cached = cacheGet(key);
  if (cached) return sendJsonCached(req, res, cached, 300);

  const api = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
  api.searchParams.set('origin', origin);
  api.searchParams.set('destination', destination);
  api.searchParams.set('departure_at', departureAt);
  api.searchParams.set('currency', 'rub');
  api.searchParams.set('sorting', 'price');
  api.searchParams.set('direct', 'false');
  api.searchParams.set('limit', '20');
  api.searchParams.set('token', TRAVELPAYOUTS_TOKEN);

  try {
    const upstream = await fetch(api, { signal: AbortSignal.timeout(10000) });
    const data = await upstream.json();
    if (!upstream.ok || data.success === false) {
      return sendJson(req, res, upstream.ok ? 502 : upstream.status, {
        error: data.error || 'Aviasales не вернул данные'
      });
    }
    cacheSet(key, data, 5 * 60 * 1000);
    return sendJsonCached(req, res, data, 300);
  } catch (err) {
    return sendJson(req, res, 502, { error: 'Не удалось получить цены Aviasales: ' + err.message });
  }
}

function parseCoord(value) {
  const parts = String(value || '').split(',').map((x) => Number(x));
  if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  const lat = parts[0];
  const lon = parts[1];
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

async function roadRouteHandler(req, res, params) {
  const from = parseCoord(params.from);
  const to = parseCoord(params.to);
  if (!from || !to) {
    return sendJson(req, res, 400, { error: 'Нужны координаты from=широта,долгота и to=широта,долгота' });
  }

  const key = 'route|' +
    from.lat.toFixed(4) + ',' + from.lon.toFixed(4) + '|' +
    to.lat.toFixed(4) + ',' + to.lon.toFixed(4);
  const cached = cacheGet(key);
  if (cached) return sendJsonCached(req, res, cached, 600);

  const url = 'https://router.project-osrm.org/route/v1/driving/' +
    from.lon.toFixed(6) + ',' + from.lat.toFixed(6) + ';' +
    to.lon.toFixed(6) + ',' + to.lat.toFixed(6) +
    '?overview=full&geometries=geojson&alternatives=false&steps=false';

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Poehali/1.0 (travel planning demo)' },
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) {
      return sendJson(req, res, 502, { error: 'Сервис маршрутов временно недоступен' });
    }
    const data = await upstream.json();
    const route = data && Array.isArray(data.routes) ? data.routes[0] : null;
    if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) {
      return sendJson(req, res, 404, { error: 'Маршрут по дорогам не найден' });
    }

    const result = {
      ok: true,
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
      geometry: route.geometry.coordinates.map((pair) => [
        Math.round(pair[1] * 100000) / 100000,
        Math.round(pair[0] * 100000) / 100000
      ])
    };
    cacheSet(key, result, 10 * 60 * 1000);
    return sendJsonCached(req, res, result, 600);
  } catch (err) {
    return sendJson(req, res, 502, { error: 'Не удалось построить дорожный маршрут: ' + err.message });
  }
}

async function geocodeHandler(req, res, params) {
  const query = cleanText(params.q, 160);
  if (query.length < 3) {
    return sendJson(req, res, 400, { error: 'Введите хотя бы 3 символа' });
  }
  if (!rateLimit(req, 'geocode', 30, 60 * 1000)) {
    return sendJson(req, res, 429, { error: 'Слишком много запросов поиска. Подождите минуту.' });
  }

  const key = 'geo|' + query.toLowerCase();
  const cached = cacheGet(key);
  if (cached) return sendJsonCached(req, res, cached, 3600);

  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&accept-language=ru&limit=5&q=' +
    encodeURIComponent(query);

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Poehali/1.0 (' + (SITE_URL || 'http://localhost:' + PORT) + ')',
        'Accept-Language': 'ru'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!upstream.ok) {
      return sendJson(req, res, 502, { error: 'Поиск мест временно недоступен' });
    }
    const data = await upstream.json();
    cacheSet(key, data, 60 * 60 * 1000);
    return sendJsonCached(req, res, data, 3600);
  } catch (err) {
    return sendJson(req, res, 502, { error: 'Не удалось найти место: ' + err.message });
  }
}

/* ---------------------------------------------------------------- API */
async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const params = Object.fromEntries(url.searchParams);

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(req, res, 200, {
      ok: true,
      database: true,
      uptime: Math.round(process.uptime()),
      version: VERSION
    });
  }

  if (pathname === '/api/config' && req.method === 'GET') {
    return sendJson(req, res, 200, {
      livePrices: !!TRAVELPAYOUTS_TOKEN,
      database: true,
      priceK: store.getPriceK(),
      version: VERSION,
      siteUrl: SITE_URL || null,
      serverTime: new Date().toISOString()
    });
  }

  if (pathname === '/api/flights' && req.method === 'GET') {
    return flightsHandler(req, res, params);
  }

  if (pathname === '/api/route' && req.method === 'GET') {
    return roadRouteHandler(req, res, params);
  }

  if (pathname === '/api/geocode' && req.method === 'GET') {
    return geocodeHandler(req, res, params);
  }

  if (pathname === '/api/destinations' && req.method === 'GET') {
    return sendJsonCached(req, res, store.getDestinations(), 60);
  }

  const destMatch = pathname.match(/^\/api\/destinations\/([^/]+)$/);
  if (destMatch && req.method === 'GET') {
    const destination = store.getDestination(decodeURIComponent(destMatch[1]));
    if (!destination) return sendJson(req, res, 404, { error: 'Направление не найдено' });
    return sendJsonCached(req, res, destination, 60);
  }

  /* ---------- избранное ---------- */
  if (pathname === '/api/favorites') {
    if (req.method === 'GET') {
      const clientId = clientIdFrom(params.client);
      if (!clientId) return sendJson(req, res, 400, { error: 'Некорректный идентификатор клиента' });
      return sendJson(req, res, 200, store.listFavorites(clientId));
    }

    if (req.method === 'POST') {
      if (!rateLimit(req, 'fav-write', 120, 60 * 1000)) {
        return sendJson(req, res, 429, { error: 'Слишком много запросов. Попробуйте позже.' });
      }
      const body = await readBody(req);
      const clientId = clientIdFrom(body.clientId);
      const destinationId = cleanText(body.destinationId, 80);
      const hotelName = cleanText(body.hotelName, 160);
      if (!clientId || !destinationId || !hotelName) {
        return sendJson(req, res, 400, { error: 'Нужны clientId, destinationId и hotelName' });
      }
      const favorite = store.addFavorite({ clientId, destinationId, hotelName });
      return sendJson(req, res, 201, favorite);
    }

    if (req.method === 'DELETE') {
      const clientId = clientIdFrom(params.client);
      if (!clientId) return sendJson(req, res, 400, { error: 'Некорректный идентификатор клиента' });
      const destinationId = cleanText(params.destinationId, 80);
      const hotelName = cleanText(params.hotelName, 160);
      if (destinationId && hotelName) {
        return sendJson(req, res, 200, {
          removed: store.removeFavorite({ clientId, destinationId, hotelName })
        });
      }
      return sendJson(req, res, 200, { removed: store.clearFavorites(clientId) });
    }
  }

  /* ---------- заявки ---------- */
  if (pathname === '/api/requests') {
    if (req.method === 'GET') {
      const clientId = clientIdFrom(params.client);
      if (!clientId) return sendJson(req, res, 400, { error: 'Некорректный идентификатор клиента' });
      return sendJson(req, res, 200, store.listRequests(clientId, params.limit));
    }

    if (req.method === 'POST') {
      if (!rateLimit(req, 'req-write', 120, 60 * 1000)) {
        return sendJson(req, res, 429, { error: 'Слишком много запросов. Попробуйте позже.' });
      }
      const body = await readBody(req);
      const clientId = clientIdFrom(body.clientId);
      const service = cleanText(body.service, 80);
      const route = cleanText(body.route, 500);
      const userName = cleanText(body.user, 80);
      if (!clientId || !service || !route) {
        return sendJson(req, res, 400, { error: 'Нужны clientId, service и route' });
      }
      return sendJson(req, res, 201, store.addRequest({ clientId, service, route, userName }));
    }

    if (req.method === 'DELETE') {
      const clientId = clientIdFrom(params.client);
      if (!clientId) return sendJson(req, res, 400, { error: 'Некорректный идентификатор клиента' });
      return sendJson(req, res, 200, { removed: store.clearRequests(clientId) });
    }
  }

  /* ---------- вход администратора ---------- */
  if (pathname === '/api/auth' && req.method === 'POST') {
    if (!rateLimit(req, 'auth', 10, 60 * 1000)) {
      return sendJson(req, res, 429, { error: 'Слишком много попыток входа. Подождите минуту.' });
    }
    const body = await readBody(req);
    const login = cleanText(body.login, 80);
    const password = String(body.password === undefined || body.password === null ? '' : body.password).slice(0, 200);
    if (!store.verifyAdmin(login, password)) {
      return sendJson(req, res, 401, { error: 'Неверный логин или пароль' });
    }
    const session = store.createAdminSession();
    return sendJson(req, res, 200, {
      token: session.token,
      expiresAt: session.expiresAt,
      user: { name: 'Администратор', role: 'admin' }
    });
  }

  if (pathname === '/api/admin/session' && req.method === 'GET') {
    const token = requireAdmin(req, res);
    if (!token) return;
    return sendJson(req, res, 200, { ok: true });
  }

  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const token = requireAdmin(req, res);
    if (!token) return;
    return sendJson(req, res, 200, store.adminStats());
  }

  if (pathname === '/api/admin/requests') {
    const token = requireAdmin(req, res);
    if (!token) return;
    if (req.method === 'GET') {
      return sendJson(req, res, 200, store.listAllRequests(params.limit));
    }
    if (req.method === 'DELETE') {
      return sendJson(req, res, 200, { removed: store.adminClearRequests() });
    }
  }

  if (pathname === '/api/admin/favorites' && req.method === 'DELETE') {
    const token = requireAdmin(req, res);
    if (!token) return;
    return sendJson(req, res, 200, { removed: store.adminClearFavorites() });
  }

  if (pathname === '/api/admin/settings' && (req.method === 'PATCH' || req.method === 'POST')) {
    const token = requireAdmin(req, res);
    if (!token) return;
    const body = await readBody(req);
    const priceK = store.setPriceK(body.priceK);
    return sendJson(req, res, 200, { priceK });
  }

  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const token = adminTokenFrom(req);
    store.revokeAdminSession(token);
    return sendJson(req, res, 200, { ok: true });
  }

  return sendJson(req, res, 404, { error: 'API: запрос не найден' });
}

/* --------------------------------------------------------- статика */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const ROOT_FILES = new Set([
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/offline.html'
]);
const STATIC_DIRS = ['/css/', '/js/', '/vendor/', '/preview/', '/icons/'];

function resolveStatic(pathname) {
  if (pathname === '/') pathname = '/index.html';
  if (!ROOT_FILES.has(pathname) && !STATIC_DIRS.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }
  const file = path.normalize(path.join(ROOT, pathname));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return null;
  return { file, pathname };
}

const gzipCache = new Map();

async function serveStatic(req, res, pathname) {
  const resolved = resolveStatic(pathname);
  if (!resolved) return false;

  let stat;
  try {
    stat = await fsp.stat(resolved.file);
  } catch (e) {
    return false;
  }
  if (!stat.isFile()) return false;

  const etag = 'W/"' + stat.size.toString(16) + '-' + Math.floor(stat.mtimeMs).toString(16) + '"';
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, {
      'ETag': etag,
      'Cache-Control': resolved.pathname === '/index.html' ? 'no-cache' : 'public, max-age=3600'
    });
    return res.end();
  }

  let body;
  try {
    body = await fsp.readFile(resolved.file);
  } catch (e) {
    return false;
  }

  const ext = path.extname(resolved.file).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const compressible = /^(text\/|application\/(json|javascript|manifest\+json|xml)|image\/svg\+xml)/i.test(contentType);
  const acceptsGzip = /\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''));

  const headers = {
    'Content-Type': contentType,
    'ETag': etag,
    'Content-Language': 'ru',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Accept-Encoding'
  };

  if (resolved.pathname === '/index.html') {
    headers['Cache-Control'] = 'no-cache';
  } else if (resolved.pathname.startsWith('/vendor/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (resolved.pathname.startsWith('/preview/') || resolved.pathname.startsWith('/icons/')) {
    headers['Cache-Control'] = 'public, max-age=604800';
  } else if (resolved.pathname === '/manifest.webmanifest') {
    headers['Cache-Control'] = 'public, max-age=3600';
  } else {
    headers['Cache-Control'] = 'public, max-age=3600';
  }

  if (compressible && acceptsGzip && body.length > 1024) {
    const cacheKey = resolved.file + '|' + etag;
    let compressed = gzipCache.get(cacheKey);
    if (!compressed) {
      compressed = zlib.gzipSync(body, { level: 9 });
      gzipCache.set(cacheKey, compressed);
      if (gzipCache.size > 80) {
        const first = gzipCache.keys().next().value;
        gzipCache.delete(first);
      }
    }
    body = compressed;
    headers['Content-Encoding'] = 'gzip';
  }

  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') res.end();
  else res.end(body);
  return true;
}

/* ------------------------------------------------------ robots/sitemap */
function publicBase(req) {
  if (SITE_URL) return SITE_URL;
  const host = String(req.headers.host || ('localhost:' + PORT));
  return 'http://' + host;
}

function sendRobots(req, res) {
  const base = publicBase(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    'Sitemap: ' + base + '/sitemap.xml',
    ''
  ].join('\n');
  sendBuffer(req, res, 200, body, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
}

function sendSitemap(req, res) {
  const base = publicBase(req);
  const destinations = store.getDestinations();
  const urls = [base + '/', base + '/#/planner', base + '/#/'];
  destinations.forEach((d) => urls.push(base + '/#/dest/' + encodeURIComponent(d.id)));

  const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => '  <url><loc>' + escapeXml(url) + '</loc></url>').join('\n') +
    '\n</urlset>\n';

  sendBuffer(req, res, 200, body, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
}

/* ---------------------------------------------------------- HTTP-сервер */
const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  let url;
  try {
    url = new URL(req.url, 'http://localhost');
  } catch (e) {
    return sendJson(req, res, 400, { error: 'Некорректный адрес' });
  }

  const method = String(req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'POST' && method !== 'PATCH' && method !== 'DELETE') {
    return sendJson(req, res, 405, { error: 'Метод не поддерживается' });
  }

  try {
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }

    if (url.pathname === '/robots.txt') return sendRobots(req, res);
    if (url.pathname === '/sitemap.xml') return sendSitemap(req, res);

    /* Красивые ссылки без решётки тоже работают: они ведут в SPA. */
    const destMatch = url.pathname.match(/^\/dest\/([a-zA-Z0-9_-]+)\/?$/);
    if (destMatch) {
      res.writeHead(302, { Location: '/#/dest/' + encodeURIComponent(destMatch[1]) });
      return res.end();
    }
    if (url.pathname === '/planner' || url.pathname === '/planner/') {
      res.writeHead(302, { Location: '/#/planner' });
      return res.end();
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch (e) {
      return sendJson(req, res, 400, { error: 'Некорректный путь' });
    }

    if (method === 'GET' || method === 'HEAD') {
      const served = await serveStatic(req, res, pathname);
      if (served) return;
    }

    if (method === 'GET' || method === 'HEAD') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end('Страница не найдена: ' + pathname);
    }

    return sendJson(req, res, 405, { error: 'Метод не поддерживается' });
  } catch (err) {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    if (status >= 500) console.error('[API]', err);
    if (!res.headersSent) {
      return sendJson(req, res, status, {
        error: status >= 500 ? 'Внутренняя ошибка сервера' : err.message
      });
    }
    try { res.end(); } catch (e) { /* ignore */ }
  }
});

server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

function networkAddresses() {
  const result = [];
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach((name) => {
    (interfaces[name] || []).forEach((item) => {
      if (item.family === 'IPv4' && !item.internal) result.push(item.address);
    });
  });
  return result;
}

server.listen(PORT, HOST, () => {
  const addresses = networkAddresses();
  console.log('');
  console.log('  Поехали! запущен');
  console.log('  Компьютер:  http://localhost:' + PORT);
  addresses.forEach((ip) => {
    console.log('  Телефон:    http://' + ip + ':' + PORT + '  (в той же Wi-Fi сети)');
  });
  console.log('  База:       ' + store.DB_FILE);
  console.log('  Цены:       ' + (TRAVELPAYOUTS_TOKEN ? 'онлайн Aviasales' : 'демо (нет токена Travelpayouts)'));
  if (store.usesDefaultAdminCredentials()) {
    console.log('  Админ:      admin / admin — СМЕНИТЕ пароль через ADMIN_PASSWORD перед публикацией!');
  }
  console.log('  Покупка билетов и туров — на сайтах партнёров.');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Порт ' + PORT + ' уже занят. Запустите с другим портом: PORT=5174 node server.cjs');
  } else {
    console.error('Ошибка сервера:', err);
  }
  process.exit(1);
});

let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  console.log('\nОстанавливаю сервер…');
  server.close(() => {
    try { store.close(); } catch (e) { /* ignore */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
