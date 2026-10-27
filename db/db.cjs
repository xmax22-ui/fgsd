/* ============================================================
   «Поехали» — работа с базой данных SQLite (Node.js 22.5+)
   Используется встроенный модуль node:sqlite, внешние пакеты не нужны.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');

function readLocalConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'config.local.json'), 'utf8'));
  } catch (e) {
    return {};
  }
}

const LOCAL_CONFIG = readLocalConfig();
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(ROOT, 'data', 'poehali.db');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

/* Встроенный SQLite в Node 22–25 помечает себя экспериментальным.
   Это предупреждение не влияет на работу, поэтому убираем только его. */
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning, ...args) {
  if (String(warning).indexOf('SQLite is an experimental feature') !== -1) return;
  return originalEmitWarning.call(process, warning, ...args);
};
const { DatabaseSync } = require('node:sqlite');
process.emitWarning = originalEmitWarning;

const db = new DatabaseSync(DB_FILE);

db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

/* --------------------------------------------------------- настройки */
const ADMIN_LOGIN = String(process.env.ADMIN_LOGIN || LOCAL_CONFIG.adminLogin || 'admin');
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || LOCAL_CONFIG.adminPassword || 'admin');
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function safeEqual(a, b) {
  const left = crypto.createHash('sha256').update(String(a)).digest();
  const right = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}

/* ------------------------------------------------------------ импорт */
function loadSourceData() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext(
    source + '\n;({ DESTINATIONS: DESTINATIONS, PARTNER_AGENCIES: PARTNER_AGENCIES, DEST_GEO: DEST_GEO })',
    sandbox,
    { filename: 'js/data.js', timeout: 3000 }
  );
}

const insertDestination = db.prepare(`
  INSERT INTO destinations
    (id, name, country, region, tagline, description, gradient, tags, stats,
     lat, lon, iata, hotel_query, wiki, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertRoute = db.prepare(`
  INSERT INTO routes
    (destination_id, icon, title, from_city, duration, distance, price, note, recommended, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertHotel = db.prepare(`
  INSERT INTO hotels
    (destination_id, name, stars, rating, price, district, features, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAgency = db.prepare(`
  INSERT INTO agencies
    (destination_id, name, rating, tours_from, phone, spec, site, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertFlight = db.prepare(`
  INSERT INTO flights
    (destination_id, from_city, airline, number, dep, arr, econ, biz, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertTrain = db.prepare(`
  INSERT INTO trains
    (destination_id, number, from_city, dep, arr, classes, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertAttraction = db.prepare(`
  INSERT INTO attractions (destination_id, name, sort_order) VALUES (?, ?, ?)
`);
const insertTip = db.prepare(`
  INSERT INTO tips (destination_id, text, sort_order) VALUES (?, ?, ?)
`);

function seedDestinations(force) {
  const existing = Number(db.prepare('SELECT COUNT(*) AS c FROM destinations').get().c);
  if (existing > 0 && !force) return { seeded: false, count: existing };

  const { DESTINATIONS } = loadSourceData();
  if (!Array.isArray(DESTINATIONS) || !DESTINATIONS.length) {
    throw new Error('В js/data.js не найдены направления DESTINATIONS');
  }

  db.exec('BEGIN');
  try {
    if (force) db.exec('DELETE FROM destinations');

    DESTINATIONS.forEach((d, index) => {
      insertDestination.run(
        d.id, d.name, d.country || '', d.region || '', d.tagline || '', d.description || '',
        JSON.stringify(d.gradient || []), JSON.stringify(d.tags || []), JSON.stringify(d.stats || {}),
        Number.isFinite(Number(d.lat)) ? Number(d.lat) : null,
        Number.isFinite(Number(d.lon)) ? Number(d.lon) : null,
        d.iata || '', d.hotelQuery || '', d.wiki || '', index
      );

      (d.routes || []).forEach((r, i) => {
        insertRoute.run(
          d.id, r.icon || '', r.title || '', r.from || '', r.dur || '', r.dist || '',
          r.price || '', r.note || '', r.rec ? 1 : 0, i
        );
      });

      (d.hotels || []).forEach((h, i) => {
        insertHotel.run(
          d.id, h.name || '', Number(h.stars) || 0, Number(h.rating) || 0,
          Number(h.price) || 0, h.district || '', JSON.stringify(h.features || []), i
        );
      });

      (d.agencies || []).forEach((a, i) => {
        insertAgency.run(
          d.id, a.name || '', Number(a.rating) || 0, Number(a.toursFrom) || 0,
          a.phone || '', a.spec || '', a.site || '', i
        );
      });

      (d.flights || []).forEach((f, i) => {
        insertFlight.run(
          d.id, f.from || '', f.airline || '', f.num || '', f.dep || '', f.arr || '',
          Number(f.econ) || 0,
          f.biz === null || f.biz === undefined ? null : Number(f.biz) || 0,
          i
        );
      });

      (d.trains || []).forEach((t, i) => {
        insertTrain.run(
          d.id, t.num || '', t.from || '', t.dep || '', t.arr || '',
          JSON.stringify(t.classes || {}), i
        );
      });

      (d.attractions || []).forEach((a, i) => {
        insertAttraction.run(d.id, typeof a === 'string' ? a : (a.name || ''), i);
      });

      (d.tips || []).forEach((t, i) => {
        insertTip.run(d.id, String(t), i);
      });
    });

    db.exec('COMMIT');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (e) { /* ignore */ }
    throw err;
  }

  return { seeded: true, count: DESTINATIONS.length };
}

seedDestinations(false);

/* ------------------------------------------------------- направления */
function getDestinations() {
  const destinations = db.prepare(`
    SELECT * FROM destinations ORDER BY sort_order ASC, name ASC
  `).all();

  const routes = db.prepare('SELECT * FROM routes ORDER BY destination_id, sort_order, id').all();
  const hotels = db.prepare('SELECT * FROM hotels ORDER BY destination_id, sort_order, id').all();
  const agencies = db.prepare('SELECT * FROM agencies ORDER BY destination_id, sort_order, id').all();
  const flights = db.prepare('SELECT * FROM flights ORDER BY destination_id, sort_order, id').all();
  const trains = db.prepare('SELECT * FROM trains ORDER BY destination_id, sort_order, id').all();
  const attractions = db.prepare('SELECT * FROM attractions ORDER BY destination_id, sort_order, id').all();
  const tips = db.prepare('SELECT * FROM tips ORDER BY destination_id, sort_order, id').all();

  const byId = new Map();
  destinations.forEach((row, index) => {
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      country: row.country,
      region: row.region,
      gradient: parseJson(row.gradient, []),
      tags: parseJson(row.tags, []),
      tagline: row.tagline,
      description: row.description,
      stats: parseJson(row.stats, {}),
      routes: [],
      hotels: [],
      agencies: [],
      flights: [],
      trains: [],
      attractions: [],
      tips: [],
      lat: row.lat,
      lon: row.lon,
      iata: row.iata,
      hotelQuery: row.hotel_query,
      wiki: row.wiki,
      sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index
    });
  });

  const push = (rows, mapper) => rows.forEach((row) => {
    const d = byId.get(row.destination_id);
    if (d) d[mapper.target].push(mapper.make(row));
  });

  push(routes, { target: 'routes', make: (r) => ({
    icon: r.icon, title: r.title, from: r.from_city, dur: r.duration,
    dist: r.distance, price: r.price, note: r.note, rec: !!r.recommended
  }) });
  push(hotels, { target: 'hotels', make: (h) => ({
    name: h.name, stars: h.stars, rating: h.rating, price: h.price,
    district: h.district, features: parseJson(h.features, [])
  }) });
  push(agencies, { target: 'agencies', make: (a) => ({
    name: a.name, rating: a.rating, toursFrom: a.tours_from, phone: a.phone,
    spec: a.spec, site: a.site
  }) });
  push(flights, { target: 'flights', make: (f) => ({
    from: f.from_city, airline: f.airline, num: f.number, dep: f.dep,
    arr: f.arr, econ: f.econ, biz: f.biz
  }) });
  push(trains, { target: 'trains', make: (t) => ({
    num: t.number, from: t.from_city, dep: t.dep, arr: t.arr,
    classes: parseJson(t.classes, {})
  }) });
  push(attractions, { target: 'attractions', make: (a) => ({ name: a.name }) });
  push(tips, { target: 'tips', make: (t) => t.text });

  return Array.from(byId.values());
}

function getDestination(id) {
  return getDestinations().find((d) => d.id === id) || null;
}

function destinationExists(id) {
  return !!db.prepare('SELECT 1 AS ok FROM destinations WHERE id = ?').get(String(id));
}

function hotelExists(destinationId, hotelName) {
  return !!db.prepare(
    'SELECT 1 AS ok FROM hotels WHERE destination_id = ? AND name = ? COLLATE NOCASE'
  ).get(String(destinationId), String(hotelName));
}

function hotelPrice(destinationId, hotelName) {
  const row = db.prepare(
    'SELECT price FROM hotels WHERE destination_id = ? AND name = ? COLLATE NOCASE'
  ).get(String(destinationId), String(hotelName));
  return row ? Number(row.price) || 0 : 0;
}

/* ----------------------------------------------------------- клиенты */
function touchClient(clientId, name) {
  db.prepare(`
    INSERT INTO clients (id, name) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = CASE WHEN excluded.name <> '' THEN excluded.name ELSE clients.name END,
      last_seen = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `).run(String(clientId), String(name || ''));
}

/* --------------------------------------------------------- избранное */
function favoriteRow(row) {
  return {
    id: row.id,
    key: row.destination_id + '::' + row.hotel_name,
    name: row.hotel_name,
    price: row.hotel_price,
    destId: row.destination_id,
    destName: row.dest_name || row.destination_id,
    createdAt: row.created_at
  };
}

function listFavorites(clientId) {
  return db.prepare(`
    SELECT f.*, d.name AS dest_name
    FROM favorites f
    LEFT JOIN destinations d ON d.id = f.destination_id
    WHERE f.client_id = ?
    ORDER BY f.created_at DESC, f.id DESC
  `).all(String(clientId)).map(favoriteRow);
}

function addFavorite({ clientId, destinationId, hotelName }) {
  if (!destinationExists(destinationId)) {
    const err = new Error('Направление не найдено');
    err.status = 404;
    throw err;
  }
  if (!hotelExists(destinationId, hotelName)) {
    const err = new Error('Отель не найден в этом направлении');
    err.status = 404;
    throw err;
  }

  const price = hotelPrice(destinationId, hotelName);
  touchClient(clientId, '');

  db.prepare(`
    INSERT INTO favorites (client_id, destination_id, hotel_name, hotel_price)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(client_id, destination_id, hotel_name)
    DO UPDATE SET hotel_price = excluded.hotel_price
  `).run(String(clientId), String(destinationId), String(hotelName), price);

  const row = db.prepare(`
    SELECT f.*, d.name AS dest_name
    FROM favorites f
    LEFT JOIN destinations d ON d.id = f.destination_id
    WHERE f.client_id = ? AND f.destination_id = ? AND f.hotel_name = ?
  `).get(String(clientId), String(destinationId), String(hotelName));

  return favoriteRow(row);
}

function removeFavorite({ clientId, destinationId, hotelName }) {
  const result = db.prepare(`
    DELETE FROM favorites
    WHERE client_id = ? AND destination_id = ? AND hotel_name = ?
  `).run(String(clientId), String(destinationId), String(hotelName));
  return Number(result.changes) > 0;
}

function clearFavorites(clientId) {
  const result = db.prepare('DELETE FROM favorites WHERE client_id = ?').run(String(clientId));
  return Number(result.changes);
}

function adminClearFavorites() {
  const result = db.prepare('DELETE FROM favorites').run();
  return Number(result.changes);
}

/* ------------------------------------------------------------ заявки */
const TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
});

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  return TIME_FORMAT.format(date);
}

function requestRow(row) {
  return {
    id: row.id,
    service: row.service,
    route: row.route_text,
    user: row.user_name || 'без входа',
    clientId: row.client_id,
    createdAt: row.created_at,
    time: formatTime(row.created_at)
  };
}

function listRequests(clientId, limit) {
  return db.prepare(`
    SELECT * FROM requests WHERE client_id = ?
    ORDER BY id DESC LIMIT ?
  `).all(String(clientId), Math.max(1, Math.min(200, Number(limit) || 60))).map(requestRow);
}

function listAllRequests(limit) {
  return db.prepare(`
    SELECT * FROM requests ORDER BY id DESC LIMIT ?
  `).all(Math.max(1, Math.min(500, Number(limit) || 200))).map(requestRow);
}

function addRequest({ clientId, service, route, userName }) {
  touchClient(clientId, userName || '');
  const result = db.prepare(`
    INSERT INTO requests (client_id, service, route_text, user_name)
    VALUES (?, ?, ?, ?)
  `).run(String(clientId), String(service), String(route), String(userName || ''));
  const id = Number(result.lastInsertRowid);
  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
  return requestRow(row);
}

function clearRequests(clientId) {
  const result = db.prepare('DELETE FROM requests WHERE client_id = ?').run(String(clientId));
  return Number(result.changes);
}

function adminClearRequests() {
  const result = db.prepare('DELETE FROM requests').run();
  return Number(result.changes);
}

/* ---------------------------------------------------------- настройки */
function getSetting(key, fallback) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(String(key));
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(String(key), String(value));
}

function getPriceK() {
  return clampNumber(getSetting('price_k', '1'), 0.5, 3, 1);
}

function setPriceK(value) {
  const k = clampNumber(value, 0.5, 3, 1);
  const rounded = Math.round(k * 100) / 100;
  setSetting('price_k', String(rounded));
  return rounded;
}

/* ------------------------------------------------- администратор */
function adminStats() {
  const requests = Number(db.prepare('SELECT COUNT(*) AS c FROM requests').get().c);
  const favorites = Number(db.prepare('SELECT COUNT(*) AS c FROM favorites').get().c);
  const clients = Number(db.prepare('SELECT COUNT(*) AS c FROM clients').get().c);
  const destinations = Number(db.prepare('SELECT COUNT(*) AS c FROM destinations').get().c);
  const hotels = Number(db.prepare('SELECT COUNT(*) AS c FROM hotels').get().c);
  const last = db.prepare('SELECT created_at FROM requests ORDER BY id DESC LIMIT 1').get();
  return {
    requests,
    favorites,
    clients,
    destinations,
    hotels,
    priceK: getPriceK(),
    lastRequestAt: last ? last.created_at : null,
    database: true
  };
}

function verifyAdmin(login, password) {
  return safeEqual(login, ADMIN_LOGIN) && safeEqual(password, ADMIN_PASSWORD);
}

function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(now);
  db.prepare('INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
    .run(token, now, now + SESSION_TTL_MS);
  return { token, expiresAt: now + SESSION_TTL_MS };
}

function checkAdminSession(token) {
  if (!token) return false;
  const row = db.prepare('SELECT expires_at FROM admin_sessions WHERE token = ?').get(String(token));
  if (!row) return false;
  if (Number(row.expires_at) < Date.now()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(String(token));
    return false;
  }
  return true;
}

function revokeAdminSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(String(token));
}

function usesDefaultAdminCredentials() {
  return ADMIN_LOGIN === 'admin' && ADMIN_PASSWORD === 'admin';
}

module.exports = {
  db,
  DB_FILE,
  seedDestinations,
  getDestinations,
  getDestination,
  destinationExists,
  listFavorites,
  addFavorite,
  removeFavorite,
  clearFavorites,
  adminClearFavorites,
  listRequests,
  listAllRequests,
  addRequest,
  clearRequests,
  adminClearRequests,
  getPriceK,
  setPriceK,
  adminStats,
  verifyAdmin,
  createAdminSession,
  checkAdminSession,
  revokeAdminSession,
  usesDefaultAdminCredentials,
  close: () => db.close()
};
