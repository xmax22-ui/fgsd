/* ============================================================
   «Поехали» — клиент для API и базы данных.
   Если сайт открыт как обычный файл (file://) или API недоступен,
   приложение автоматически работает на встроенных демо-данных.
   ============================================================ */

(function (global) {
  'use strict';

  var CLIENT_KEY = 'poehali_client_id';
  var TOKEN_KEY = 'poehali_admin_token';
  var TIMEOUT_MS = 15000;

  function read(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }

  function write(storage, key, value) {
    try {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    } catch (e) { /* приватный режим браузера */ }
  }

  function randomId() {
    try {
      if (global.crypto && typeof global.crypto.randomUUID === 'function') {
        return global.crypto.randomUUID().replace(/[^a-zA-Z0-9_-]/g, '');
      }
      if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
        var bytes = new Uint8Array(16);
        global.crypto.getRandomValues(bytes);
        return Array.prototype.map.call(bytes, function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      }
    } catch (e) { /* ignore */ }
    return 'guest' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  function getClientId() {
    var id = read(global.localStorage, CLIENT_KEY);
    if (!id || !/^[a-zA-Z0-9_-]{8,80}$/.test(id)) {
      id = randomId();
      write(global.localStorage, CLIENT_KEY, id);
    }
    return id;
  }

  function getAdminToken() {
    return read(global.sessionStorage, TOKEN_KEY) || '';
  }

  function setAdminToken(token) {
    write(global.sessionStorage, TOKEN_KEY, token || null);
  }

  function request(path, options) {
    var opts = options || {};
    var controller = null;
    var timer = null;

    if (typeof global.AbortController === 'function') {
      controller = new global.AbortController();
      timer = global.setTimeout(function () { controller.abort(); }, opts.timeout || TIMEOUT_MS);
    }

    var headers = { 'Accept': 'application/json' };
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (opts.token) headers['Authorization'] = 'Bearer ' + opts.token;

    return global.fetch(path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller ? controller.signal : undefined,
      credentials: 'same-origin',
      cache: 'no-store'
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = null;
        if (text) {
          try { data = JSON.parse(text); } catch (e) { data = { error: text.slice(0, 300) }; }
        }
        if (!response.ok) {
          var message = (data && (data.error || data.message)) || ('Ошибка сервера: ' + response.status);
          var error = new Error(message);
          error.status = response.status;
          error.data = data;
          throw error;
        }
        return data;
      });
    }).finally(function () {
      if (timer) global.clearTimeout(timer);
    });
  }

  var api = {
    clientId: getClientId,
    getAdminToken: getAdminToken,
    setAdminToken: setAdminToken,

    config: function () {
      return request('/api/config');
    },

    destinations: function () {
      return request('/api/destinations');
    },

    destination: function (id) {
      return request('/api/destinations/' + encodeURIComponent(id));
    },

    favorites: function () {
      return request('/api/favorites?client=' + encodeURIComponent(getClientId()));
    },

    addFavorite: function (destinationId, hotelName) {
      return request('/api/favorites', {
        method: 'POST',
        body: {
          clientId: getClientId(),
          destinationId: destinationId,
          hotelName: hotelName
        }
      });
    },

    removeFavorite: function (destinationId, hotelName) {
      return request(
        '/api/favorites?client=' + encodeURIComponent(getClientId()) +
        '&destinationId=' + encodeURIComponent(destinationId) +
        '&hotelName=' + encodeURIComponent(hotelName),
        { method: 'DELETE' }
      );
    },

    clearFavorites: function () {
      return request('/api/favorites?client=' + encodeURIComponent(getClientId()), { method: 'DELETE' });
    },

    requests: function () {
      return request('/api/requests?client=' + encodeURIComponent(getClientId()));
    },

    addRequest: function (service, route, user) {
      return request('/api/requests', {
        method: 'POST',
        body: {
          clientId: getClientId(),
          service: service,
          route: route,
          user: user || ''
        }
      });
    },

    clearRequests: function () {
      return request('/api/requests?client=' + encodeURIComponent(getClientId()), { method: 'DELETE' });
    },

    login: function (login, password) {
      return request('/api/auth', {
        method: 'POST',
        body: { login: login, password: password }
      });
    },

    logout: function (token) {
      return request('/api/admin/logout', { method: 'POST', token: token || getAdminToken() });
    },

    checkSession: function (token) {
      return request('/api/admin/session', { token: token || getAdminToken() });
    },

    adminStats: function (token) {
      return request('/api/admin/stats', { token: token || getAdminToken() });
    },

    adminRequests: function (token) {
      return request('/api/admin/requests', { token: token || getAdminToken() });
    },

    adminClearRequests: function (token) {
      return request('/api/admin/requests', { method: 'DELETE', token: token || getAdminToken() });
    },

    adminClearFavorites: function (token) {
      return request('/api/admin/favorites', { method: 'DELETE', token: token || getAdminToken() });
    },

    setPriceK: function (priceK, token) {
      return request('/api/admin/settings', {
        method: 'PATCH',
        body: { priceK: priceK },
        token: token || getAdminToken()
      });
    },

    geocode: function (query) {
      return request('/api/geocode?q=' + encodeURIComponent(query));
    },

    roadRoute: function (from, to) {
      return request(
        '/api/route?from=' + encodeURIComponent(from.lat + ',' + from.lon) +
        '&to=' + encodeURIComponent(to.lat + ',' + to.lon)
      );
    }
  };

  global.PoehaliAPI = api;
})(window);
