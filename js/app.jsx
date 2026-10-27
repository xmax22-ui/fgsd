/* ============================================================
   Поехали! — React-приложение (исходник JSX)
   Компилируется в js/app.js командой: node build.cjs
   ============================================================ */

const { useState, useEffect, useMemo, useRef } = React;
const API = window.PoehaliAPI || null;

/* -------------------------------------------------- утилиты */
const rub = (n) => Number(n).toLocaleString('ru-RU') + ' ₽';
const dateRu = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric'
});
const timeRu = (dateObj) => dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const todayPlus = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const plusDay = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const pluralPax = (n) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'пассажир';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'пассажира';
  return 'пассажиров';
};
const pluralTransfer = (n) => n === 0 ? 'без пересадок' : n + ' пересадка' + (n === 1 ? '' : (n >= 2 && n <= 4 ? 'и' : ''));

const minFlight = (d) => d.flights.length ? Math.min(...d.flights.map((f) => f.econ)) : null;
const minTrain = (d) => d.trains.length ? Math.min(...d.trains.flatMap((t) => Object.values(t.classes))) : null;
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const grad = (d) => 'linear-gradient(135deg, ' + d.gradient[0] + ', ' + d.gradient[1] + ')';

/* ---------------------------------------------------- SVG-иконки (вместо эмодзи) */
const ICONS = {
  plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  train: (
    <g>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14" />
      <circle cx="9" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <path d="m8.5 17-1.5 3M15.5 17l1.5 3" />
      <path d="M11 20v-1.5M13 18.5V20" />
    </g>
  ),
  bus: (
    <g>
      <rect x="4" y="4" width="16" height="13" rx="3" />
      <path d="M4 10h16" />
      <circle cx="8" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <path d="M7 17v3M17 17v3" />
    </g>
  ),
  car: (
    <g>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </g>
  ),
  ferry: (
    <g>
      <path d="M3.5 14.5h17L19 18.5H5z" />
      <path d="M12 14.5v-8l5.5 8" />
      <path d="M4 21.2c.5.3 1.2.6 2 .6s1.6-.3 2.2-.6c.6-.3 1.3-.6 2-.6s1.4.3 2 .6c.6.3 1.4.6 2.2.6s1.4-.3 2-.6" />
    </g>
  ),
  bed: <g><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" /></g>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  search: <g><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></g>,
  sun: <g><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></g>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  pin: <g><path d="M20 10c0 5-5.5 10.4-7.4 12.2a1 1 0 0 1-1.2 0C9.5 20.4 4 15 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></g>,
  route: <g><circle cx="6" cy="19" r="3" /><path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5" /><circle cx="18" cy="5" r="3" /></g>,
  swap: <g><path d="M7 4v15M3.5 7.5 7 4l3.5 3.5" /><path d="M17 20V5M13.5 16.5 17 20l3.5-3.5" /></g>,
  user: <g><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.7-3.7 3.8-5.8 7.5-5.8s6.8 2.1 7.5 5.8" /></g>,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-left': <path d="M19 12H5M11 18l-6-6 6-6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  calendar: <g><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></g>,
  briefcase: <g><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></g>,
  compass: <g><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1z" /></g>,
  help: <g><circle cx="12" cy="12" r="9" /><path d="M9.3 9.2a2.9 2.9 0 0 1 5.6 1c0 2-2.9 2.2-2.9 3.8M12 17h.01" /></g>
};

function Icon({ name, size, filled, className }) {
  const px = size || 20;
  return (
    <svg
      className={'ico' + (className ? ' ' + className : '')}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] || null}
    </svg>
  );
}

/* логотип: синий жетон с белой меткой места (название «Поехали» сохраняем) */
function LogoMark({ size }) {
  const px = size || 30;
  return (
    <svg width={px} height={px} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9.5" fill="currentColor" />
      <path
        d="M16 25.5c4.8-4.7 7.5-8.1 7.5-11.3a7.5 7.5 0 1 0-15 0c0 3.2 2.7 6.6 7.5 11.3Z"
        fill="#fff"
      />
      <circle cx="16" cy="13.6" r="2.9" fill="#ff7a00" />
    </svg>
  );
}

/* звёздный рейтинг отеля — SVG вместо символов */
function Stars({ n }) {
  return (
    <span className="stars" aria-label={'Категория: ' + n + ' из 5'}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={12} filled={i <= n} className={i <= n ? 'on' : ''} />
      ))}
    </span>
  );
}

/* ------------------------------- реальные ссылки на покупку */
const CITY_INFO = {
  'Москва':           { iata: 'MOW', lat: 55.7558, lon: 37.6173 },
  'Санкт-Петербург':  { iata: 'LED', lat: 59.9386, lon: 30.3141 },
  'Нижний Новгород':  { iata: 'GOJ', lat: 56.3269, lon: 44.0059 },
  'Казань':           { iata: 'KZN', lat: 55.7963, lon: 49.1088 },
  'Ростов-на-Дону':   { iata: 'ROV', lat: 47.2357, lon: 39.7015 },
  'Воронеж':          { iata: 'VOG', lat: 51.6720, lon: 39.1843 },
  'Екатеринбург':     { iata: 'SVX', lat: 56.8389, lon: 60.6057 },
  'Уфа':              { iata: 'UFA', lat: 54.7388, lon: 55.9721 },
  'Челябинск':        { iata: 'CEK', lat: 55.1644, lon: 61.4368 },
  'Красноярск':       { iata: 'KJA', lat: 56.0153, lon: 92.8932 },
  'Новосибирск':      { iata: 'OVB', lat: 55.0084, lon: 82.9357 },
  'Краснодар':        { iata: 'KRR', lat: 45.0355, lon: 38.9753 },
  'Самара':           { iata: 'KUF', lat: 53.1959, lon: 50.1002 },
  'Владивосток':      { iata: 'VVO', lat: 43.1155, lon: 131.8855 }
};

const CITIES_IATA = Object.fromEntries(
  Object.entries(CITY_INFO).map(([name, info]) => [name, info.iata])
);

const AIRLINES = {
  SU: 'Аэрофлот', S7: 'S7 Airlines', DP: 'Победа', FV: 'Россия',
  U6: 'Уральские авиалинии', TK: 'Turkish Airlines', RL: 'РусЛайн',
  N4: 'Nordwind', '5N': 'Smartavia', WZ: 'Red Wings', A4: 'Азимут', IO: 'ИрАэро'
};

const pad2 = (n) => String(n).padStart(2, '0');

const aviaUrl = (fromCity, toCode, dateISO, pax) => {
  const origin = CITIES_IATA[fromCity] || 'MOW';
  const dt = new Date(dateISO + 'T00:00:00');
  return 'https://www.aviasales.ru/search/' + origin + pad2(dt.getDate()) + pad2(dt.getMonth() + 1) + toCode + Math.max(1, pax || 1);
};

const TUTU_URL = 'https://www.tutu.ru/poezda/';

const bookingUrl = (query, checkin, checkout, adults) =>
  'https://www.booking.com/searchresults.ru.html?ss=' + encodeURIComponent(query) +
  '&checkin=' + checkin + '&checkout=' + checkout +
  '&group_adults=' + adults + '&no_rooms=1&selected_currency=RUB';

const cityFromCode = (code) => {
  const found = Object.keys(CITIES_IATA).find((c) => CITIES_IATA[c] === code);
  return found || code;
};

/* --------------------------------------- геометрия и Яндекс.Карты */
const yaRouteUrl = (a, b) =>
  'https://yandex.ru/maps/?rtext=' +
  a.lat.toFixed(5) + ',' + a.lon.toFixed(5) + '~' +
  b.lat.toFixed(5) + ',' + b.lon.toFixed(5) +
  '&rtt=auto';

const distKm = (a, b) => {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.pow(Math.sin(dLon / 2), 2);
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
};

/* дуга большого круга для красивой линии маршрута на карте */
const toRad = (v) => v * Math.PI / 180;
const toDeg = (v) => v * 180 / Math.PI;

const arcPoints = (a, b, n) => {
  const steps = n || 64;
  const lat1 = toRad(a.lat), lon1 = toRad(a.lon), lat2 = toRad(b.lat), lon2 = toRad(b.lon);
  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
  ));
  if (d === 0) return [[a.lat, a.lon], [b.lat, b.lon]];
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    pts.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
  }
  return pts;
};

/* примерное время в пути по прямой (пассажирский самолёт ≈ 800 км/ч) */
const flightTime = (km) => {
  const totalMin = Math.round((km / 800) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return (h > 0 ? h + ' ч ' : '') + (m < 10 ? '0' + m : m) + ' мин';
};

const formatDurationMin = (min) => {
  const total = Math.max(1, Math.round(Number(min) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return (h > 0 ? h + ' ч ' : '') + (m > 0 ? (m < 10 && h > 0 ? '0' + m : m) + ' мин' : (h > 0 ? '' : '0 мин'));
};

const formatKm = (km) => (Number(km) || 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' км';

/* демо-коэффициент цен (админ-панель), шаг до 10 ₽ */
const dprice = (v, k) => Math.round((Number(v) * (k || 1)) / 10) * 10;

/* -------------------------------------------- фото из Википедии */
/* в кэше храним промис: одну и ту же статью могут запросить несколько карточек */
const WIKI_CACHE = {};

function useWikiPhoto(article) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;

    if (!WIKI_CACHE[article]) {
      WIKI_CACHE[article] = fetch(
        'https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(article) + '?redirect=true'
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no photo'))))
        .then((data) => {
          return (data.originalimage && data.originalimage.source) ||
            (data.thumbnail && data.thumbnail.source) || null;
        })
        .catch(() => null);
    }

    WIKI_CACHE[article].then((src) => {
      if (alive) setUrl(src);
    });

    return () => { alive = false; };
  }, [article]);

  return url;
}

/* фон-обложка: фото из Википедии, а до загрузки — цветной градиент направления */
function Cover({ article, className, overlay, gradient }) {
  const url = useWikiPhoto(article);
  const cls = 'cover-img' + (url ? ' loaded' : ' fallback');
  const style = url
    ? { backgroundImage: 'url("' + url + '")' }
    : (gradient ? { backgroundImage: grad({ gradient }) } : null);
  return (
    <div className={className + (url ? ' has-photo' : '')}>
      <div className={cls} style={style} aria-hidden="true"></div>
      <div className={'cover-shade shade-' + (overlay || 'soft')}></div>
    </div>
  );
}

/* ------------------------------------- онлайн-цены Aviasales */
function useLiveFlights(d, origin, date, enabled, refresh) {
  const [state, setState] = useState({ status: 'demo', offers: [], updatedAt: null, reason: '' });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const ctrl = new AbortController();
    const originCode = CITIES_IATA[origin] || 'MOW';
    setState((prev) => ({ ...prev, status: 'checking' }));

    fetch('/api/config', { signal: ctrl.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Локальный сервер цен не запущен')))
      .then((cfg) => {
        if (!cfg.livePrices) throw new Error('Не задан токен Travelpayouts');
        return fetch(
          '/api/flights?origin=' + originCode +
          '&destination=' + d.iata +
          '&departure_at=' + date,
          { signal: ctrl.signal }
        ).then((r) => r.json());
      })
      .then((json) => {
        if (cancelled) return;
        if (json && json.data && json.data.length) {
          setState({ status: 'live', offers: json.data, updatedAt: new Date(), reason: '' });
        } else {
          setState({
            status: 'demo',
            offers: [],
            updatedAt: null,
            reason: (json && json.error) || 'На выбранную дату онлайн-цен нет'
          });
        }
      })
      .catch((err) => {
        if (cancelled || err.name === 'AbortError') return;
        setState({ status: 'demo', offers: [], updatedAt: null, reason: err.message || 'Онлайн-цены недоступны' });
      });

    return () => { cancelled = true; ctrl.abort(); };
  }, [d.id, d.iata, origin, date, enabled, refresh]);

  return state;
}

/* ------------------------------------------------------ шапка */
function Header({
  page, onHome, favCount, onFav, dark, onTheme,
  user, menuOpen, onMenuToggle, onAuth, onLogout, onRequests, onPanel, onPlanner, reqCount
}) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <button className="brand" onClick={onHome} aria-label="Поехали — на главную">
          <span className="brand-mark"><LogoMark size={32} /></span>
          <span className="brand-name">Поехали</span>
        </button>

        {page === 'home' && (
          <nav className="nav-links" aria-label="Разделы сайта">
            <button onClick={() => document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' })}>Направления</button>
            <button onClick={onPlanner}>Планировщик</button>
            <button onClick={() => document.getElementById('steps').scrollIntoView({ behavior: 'smooth' })}>Как это работает</button>
          </nav>
        )}

        <div className="nav-actions">
          {page === 'dest' && (
            <button className="nav-item nav-back" onClick={onHome}>
              <Icon name="arrow-left" size={16} />
              <span className="nav-item-label">Все направления</span>
            </button>
          )}

          <button className="nav-item" onClick={onFav} title="Избранное">
            <Icon name="heart" size={17} filled={favCount > 0} />
            <span className="nav-item-label">Избранное</span>
            {favCount > 0 && <span className="count">{favCount}</span>}
          </button>

          {user ? (
            <div className="user-wrap">
              <button
                className="user-chip"
                onClick={onMenuToggle}
                aria-expanded={menuOpen}
                title="Профиль"
              >
                <span className={'user-ava' + (user.role === 'admin' ? ' admin' : '')}>
                  {initials(user.name || 'Гость')}
                </span>
                <span className="user-meta">
                  <span className="user-name">{user.name || 'Гость'}</span>
                  <span className="user-role">{user.role === 'admin' ? 'Администратор' : 'Гость'}</span>
                </span>
              </button>
              {menuOpen && (
                <div className="user-menu" role="menu">
                  <div className="user-menu-head">
                    <div className="user-name">{user.name || 'Гость'}</div>
                    <div className="mini muted">{user.role === 'admin' ? 'Роль: администратор' : 'Роль: гость'}</div>
                  </div>
                  <button className="item" onClick={onRequests} role="menuitem">
                    Мои заявки {reqCount > 0 && <span className="count">{reqCount}</span>}
                  </button>
                  {user.role === 'admin' && (
                    <button className="item" onClick={onPanel} role="menuitem">Админ-панель</button>
                  )}
                  <button className="item muted" onClick={onLogout} role="menuitem">Выйти из аккаунта</button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-item" onClick={onAuth} aria-label="Профиль" title="Профиль">
              <Icon name="user" size={17} />
              <span className="nav-item-label">Профиль</span>
            </button>
          )}

          <button
            className={'theme-toggle' + (dark ? ' is-dark' : '')}
            onClick={onTheme}
            role="switch"
            aria-checked={dark}
            aria-label="Тёмная тема"
            title={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            <span className="tt-opt tt-sun"><Icon name="sun" size={13} /></span>
            <span className="tt-opt tt-moon"><Icon name="moon" size={12} /></span>
            <span className="tt-knob" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------- карточка направления */
function DestCard({ d, index, onOpen, k }) {
  const f = minFlight(d);
  const t = minTrain(d);
  return (
    <article
      className="dest-card"
      role="button"
      tabIndex={0}
      aria-label={'Открыть направление ' + d.name}
      style={{ animationDelay: (index * 55) + 'ms' }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
    >
      <div className="dest-media">
        <Cover article={d.wiki} gradient={d.gradient} className="cover-holder" overlay="card" />
        <span className="dest-country">{d.country}</span>
      </div>
      <div className="dest-body">
        <h3>{d.name}</h3>
        <p>{d.tagline}</p>
        <div className="dest-foot">
          <div className="dest-prices">
            <div>Самолёт: <b>{f ? '≈ от ' + rub(dprice(f, k)) : 'нет данных'}</b></div>
            <div>Поезд: <b>{t ? '≈ от ' + rub(dprice(t, k)) : 'нет данных'}</b></div>
          </div>
          <span className="dest-arrow"><Icon name="arrow" size={16} /></span>
        </div>
      </div>
    </article>
  );
}

/* табы героя — как у Авиасейлс, но ведут в реальные разделы сайта */
const HERO_TABS = [
  ['tickets', 'Авиабилеты', 'plane'],
  ['dests', 'Направления', 'pin'],
  ['planner', 'Планировщик', 'route'],
  ['fav', 'Избранное', 'heart']
];

/* -------------------------------------------------------- главная */
function Home({
  onOpen, onOpenSearch, onPlanner, onFav,
  searchOrigin, onSearchOrigin, searchDate, onSearchDate,
  searchPax, onSearchPax, k, data
}) {
  const [pick, setPick] = useState(data[0] ? data[0].id : 'sochi');
  const [heroTab, setHeroTab] = useState('tickets');
  const [tag, setTag] = useState('all');
  const [q, setQ] = useState('');

  /* самые доступные направления для белой карточки поверх синего героя */
  const cheap = useMemo(() => {
    return data.slice()
      .sort((a, b) => (minFlight(a) || 1e9) - (minFlight(b) || 1e9))
      .slice(0, 4);
  }, [data]);

  const list = data.filter((d) => {
    const byTag = tag === 'all' || d.tags.indexOf(tag) !== -1;
    const query = q.trim().toLowerCase();
    const byText = !query || d.name.toLowerCase().indexOf(query) !== -1 || d.country.toLowerCase().indexOf(query) !== -1;
    return byTag && byText;
  });

  const TAGS = [
    ['all', 'Все направления'],
    ['sea', 'Море'],
    ['city', 'Города'],
    ['north', 'Север'],
    ['nature', 'Природа']
  ];

  const goTab = (id) => {
    setHeroTab(id);
    if (id === 'planner') onPlanner();
    if (id === 'fav') onFav();
    if (id === 'dests') {
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <h1>Тут покупают дешёвые билеты и туры</h1>
            <p className="hero-lead">
              Сравните перелёты, отели и туры — покупка на Aviasales, Tutu и Booking.
            </p>

            <div className="hero-tabs" role="tablist" aria-label="Разделы">
              {HERO_TABS.map(([id, label, ic]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={heroTab === id}
                  className={'htab' + (heroTab === id ? ' active' : '')}
                  onClick={() => goTab(id)}
                >
                  <Icon name={ic} size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="hero-search">
              <label className="hs-field">
                <span className="hs-label">Откуда</span>
                <select
                  value={searchOrigin}
                  onChange={(e) => onSearchOrigin(e.target.value)}
                  aria-label="Город вылета"
                >
                  {Object.keys(CITY_INFO).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="hs-field">
                <span className="hs-label">Куда</span>
                <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Направление">
                  {data.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>

              <label className="hs-field">
                <span className="hs-label">Когда</span>
                <input
                  type="date"
                  value={searchDate}
                  min={todayPlus(0)}
                  onChange={(e) => onSearchDate(e.target.value)}
                  aria-label="Дата поездки"
                />
              </label>

              <div className="hs-field hs-pax">
                <span className="hs-label">Пассажиры</span>
                <div className="pax-stepper">
                  <button type="button" onClick={() => onSearchPax(Math.max(1, searchPax - 1))} aria-label="Меньше пассажиров">−</button>
                  <span>{searchPax}</span>
                  <button type="button" onClick={() => onSearchPax(Math.min(6, searchPax + 1))} aria-label="Больше пассажиров">+</button>
                </div>
              </div>

              <button className="btn" onClick={() => onOpenSearch(pick)}>Найти билеты</button>
            </div>

            <div className="hero-subrow">
              <button className="hero-link" onClick={onPlanner}>
                <Icon name="route" size={15} /> Составить сложный маршрут
              </button>
              <span className="hero-note">
                <Icon name="check" size={15} /> Покупка на Aviasales, Tutu и Booking — в новой вкладке
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-popular" aria-label="Популярные направления">
        <div className="container">
          <div className="popular-card">
            <div className="popular-head">
              <div>
                <h2>Популярные направления</h2>
                <p>Куда улететь выгоднее всего прямо сейчас</p>
              </div>
              <button
                className="popular-all"
                onClick={() => document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' })}
              >
                Все направления <Icon name="arrow" size={14} />
              </button>
            </div>
            <div className="popular-grid">
              {cheap.map((d) => {
                const f = minFlight(d);
                return (
                  <div
                    className="popular-item"
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    aria-label={'Открыть направление ' + d.name}
                    onClick={() => onOpenSearch(d.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenSearch(d.id); }
                    }}
                  >
                    <span className="popular-media">
                      <Cover article={d.wiki} gradient={d.gradient} className="cover-holder" overlay="none" />
                    </span>
                    <span className="popular-info">
                      <span className="popular-name">{d.name}</span>
                      <span className="popular-country">{d.country}</span>
                      <span className="popular-price">{f ? 'от ' + rub(dprice(f, k)) : 'Цена по запросу'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container section" id="destinations">
        <div className="section-head">
          <div>
            <div className="eyebrow">Направления</div>
            <h2 className="h2">Выберите, куда поедем</h2>
          </div>
          <p className="section-sub">
            От Балтики до Байкала: маршруты, отели, туры и реальные ссылки на покупку билетов.
          </p>
        </div>

        <div className="filters">
          {TAGS.map(([id, label]) => (
            <button key={id} className={'chip' + (tag === id ? ' active' : '')} onClick={() => setTag(id)}>
              {label}
            </button>
          ))}
          <div className="field-search">
            <span className="lens"><Icon name="search" size={15} /></span>
            <input
              type="text"
              placeholder="Поиск: город или страна"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Поиск направления"
            />
          </div>
        </div>

        <div className="grid dest">
          {list.map((d, i) => (
            <DestCard key={d.id} d={d} index={i} k={k} onOpen={() => onOpen(d.id)} />
          ))}
        </div>
        {list.length === 0 && (
          <div className="empty-state">
            <b>Ничего не нашли.</b> Попробуйте другой фильтр или запрос.
          </div>
        )}
      </section>

      <section className="container section" id="steps">
        <div className="section-head">
          <div>
            <div className="eyebrow">Как это работает</div>
            <h2 className="h2">Три шага до чемодана</h2>
          </div>
        </div>
        <div className="steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Выбираете направление</h3>
            <p>Сравните, как добраться: самолёт, поезд, авто или паром — время, цена и полезные детали в одном месте.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Смотрите отели и туры</h3>
            <p>Сортируйте отели по рейтингу и цене, отмечайте сердечком понравившиеся и изучайте предложения операторов.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Покупаете у партнёров</h3>
            <p>Кнопки ведут на Aviasales, Tutu, Booking и сайты туроператоров — дата, маршрут и пассажиры уже подставлены.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------ как добраться */
function RoutesTab({ d, onTab }) {
  const routes = [...d.routes].sort((a, b) => (b.rec ? 1 : 0) - (a.rec ? 1 : 0));
  return (
    <div>
      <p className="tab-hint">Способы добраться до {d.name}: время в пути, ориентиры по ценам и важные детали.</p>
      <div className="routes">
        {routes.map((r, i) => (
          <article key={i} className={'route-card' + (r.rec ? ' rec' : '')} style={{ animationDelay: (i * 60) + 'ms' }}>
            <div className="route-ic"><Icon name={ICONS[r.icon] ? r.icon : 'train'} size={22} /></div>
            <div className="route-main">
              <div className="route-head">
                <h3>{r.title}</h3>
                {r.rec && <span className="badge-rec">Оптимально</span>}
              </div>
              <div className="route-geo">
                <span>{r.from}</span>
                <span className="dots"></span>
                <span className="to-name">{d.name}</span>
              </div>
              <div className="chips">
                <span>В пути: {r.dur}</span>
                <span>Расстояние: {r.dist}</span>
                <span>Цена: {r.price}</span>
              </div>
              <p className="route-note">{r.note}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="panel cta-panel">
        <div>
          <h3>Готовы ехать?</h3>
          <p className="muted mini">Подберите билеты на самолёт или поезд — покупка на реальных сервисах.</p>
        </div>
        <button className="btn" onClick={() => onTab('tickets')}>
          Смотреть билеты <Icon name="arrow" size={15} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- билеты */
function LiveTicket({ offer, d, date, pax, notify, onRequest }) {
  const depDate = new Date(offer.departure_at);
  const arrDate = offer.duration ? new Date(depDate.getTime() + offer.duration * 60000) : null;
  const url = offer.link
    ? (offer.link.indexOf('http') === 0 ? offer.link : 'https://www.aviasales.ru' + offer.link)
    : aviaUrl(cityFromCode(offer.origin), d.iata, date, pax);
  const airline = AIRLINES[offer.airline] || ('Авиакомпания ' + offer.airline);

  return (
    <div className="ticket-card">
      <div className="airline">
        <div className="airline-logo airline-logo-live">{offer.airline}</div>
        <div>
          <div className="airline-name">{airline}</div>
          <div className="airline-sub">{offer.flight_number ? 'Рейс ' + offer.flight_number : 'Рейс'} · из {cityFromCode(offer.origin)}</div>
        </div>
      </div>

      <div className="ticket-mid">
        <div className="times-row">
          <div className="time-block">
            <div className="t">{isNaN(depDate) ? '—' : timeRu(depDate)}</div>
            <div className="p">{cityFromCode(offer.origin)}</div>
          </div>
          <div className="ticket-line"><span className="mid-icon"><Icon name="plane" size={13} /></span></div>
          <div className="time-block">
            <div className="t">{arrDate ? timeRu(arrDate) : '—'}</div>
            <div className="p">{d.name}</div>
          </div>
        </div>
        <div className="class-row">
          <span className="class-chip static">{pluralTransfer(offer.transfers || 0)}</span>
          <span className="class-chip static">Цена Aviasales</span>
        </div>
      </div>

      <div className="ticket-buy">
        <div>
          <div className="price-big">{rub(offer.price * pax)}</div>
          <div className="price-note">{pax > 1 ? 'за ' + pax + ' ' + pluralPax(pax) : 'за пассажира'}</div>
        </div>
        <a
          className="btn btn-sm"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            notify('Открываем Aviasales — завершите покупку на сайте авиакомпании.');
            if (onRequest) onRequest('Aviasales (онлайн)', cityFromCode(offer.origin) + ' → ' + d.name + ', ' + dateRu(date) + ', ' + pax + ' ' + pluralPax(pax));
          }}
        >
          Купить
        </a>
      </div>
    </div>
  );
}

function TicketsTab({ d, notify, k, onRequest, initialDate, initialPax, initialOrigin }) {
  const [mode, setMode] = useState('plane');
  const [origin, setOrigin] = useState(initialOrigin || 'Москва');
  const [date, setDate] = useState(initialDate || todayPlus(7));
  const [pax, setPax] = useState(initialPax || 1);
  const [choices, setChoices] = useState({});
  const [refresh, setRefresh] = useState(0);

  const live = useLiveFlights(d, origin, date, mode === 'plane', refresh);
  const liveReady = live.status === 'live';

  const flightsAll = useMemo(() => [...d.flights].sort((a, b) => a.econ - b.econ), [d]);
  const trainsAll = useMemo(() => [...d.trains], [d]);

  const directFlights = flightsAll.filter((f) => f.from === origin);
  const flights = directFlights.length ? directFlights : flightsAll;
  const directTrains = trainsAll.filter((t) => t.from === origin);
  const trains = directTrains.length ? directTrains : trainsAll;

  const flightOptions = (f) => {
    const arr = [{ key: 'econ', label: 'Эконом', price: dprice(f.econ, k) }];
    if (f.biz) arr.push({ key: 'biz', label: 'Бизнес', price: dprice(f.biz, k) });
    return arr;
  };
  const trainOptions = (tr) => Object.keys(tr.classes).map((key) => ({ key, label: key, price: dprice(tr.classes[key], k) }));
  const choose = (key, options) => {
    const saved = choices[key];
    return options.find((o) => o.key === saved) || options[0];
  };
  const setChoice = (key, val) => setChoices((prev) => ({ ...prev, [key]: val }));

  const paxText = pax + ' ' + pluralPax(pax);

  return (
    <div>
      <div className="seg-row">
          <div className="seg" role="tablist" aria-label="Вид транспорта">
            <button className={mode === 'plane' ? 'active' : ''} onClick={() => setMode('plane')}>Авиабилеты</button>
            <button className={mode === 'train' ? 'active' : ''} onClick={() => setMode('train')}>Поезда</button>
          </div>
        <p className="search-summary">
          <b>{origin}</b> → <b>{d.name}</b> · {dateRu(date)} · {paxText}
        </p>
      </div>

      <div className="search-form">
        <div className="field">
          <label htmlFor="origin">Откуда</label>
          <select id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {Object.keys(CITY_INFO).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Дата поездки</label>
          <input id="date" type="date" value={date} min={todayPlus(0)} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Пассажиры</label>
          <div className="stepper">
            <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} aria-label="Меньше пассажиров">−</button>
            <span>{pax}</span>
            <button type="button" onClick={() => setPax((p) => Math.min(6, p + 1))} aria-label="Больше пассажиров">+</button>
          </div>
        </div>
        <a
          className="btn"
          href={mode === 'plane'
            ? aviaUrl(origin, d.iata, date, pax)
            : TUTU_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            notify(mode === 'plane'
              ? 'Открываем Aviasales: актуальные цены и оплата на сайте партнёра.'
              : 'Открываем Tutu.ru: выберите города и дату — они уже у вас перед глазами.');
            if (onRequest) onRequest(
              mode === 'plane' ? 'Aviasales' : 'Tutu.ru',
              origin + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText
            );
          }}
        >
          {mode === 'plane' ? 'Найти на Aviasales' : 'Найти на Tutu'}
        </a>
      </div>

      <div className={'price-source ' + (liveReady && mode === 'plane' ? 'live' : 'demo')}>
        {mode === 'plane' && live.status === 'checking' && (
          <span>Проверяем онлайн-цены Aviasales…</span>
        )}
        {mode === 'plane' && liveReady && (
          <span>
            <span className="source-dot"></span>
            Онлайн-цены Aviasales · обновлено {timeRu(live.updatedAt)}
          </span>
        )}
        {mode === 'plane' && !liveReady && live.status !== 'checking' && (
          <span>≈ Демо-цены. Точные цены и покупка — на Aviasales.</span>
        )}
        {mode === 'train' && (
          <span>≈ Демо-цены. Точные цены и покупка — на Tutu.ru.</span>
        )}
        {mode === 'plane' && (
          <button type="button" className="link-refresh" onClick={() => setRefresh((v) => v + 1)}>
            Обновить
          </button>
        )}
      </div>

      {mode === 'plane' && !liveReady && (
        <details className="hint-box">
          <summary>Как включить реальные цены из Aviasales</summary>
          <ol>
            <li>Получите бесплатный API-токен в партнёрской программе Travelpayouts (Aviasales).</li>
            <li>Запустите проект командой <code>node server.cjs</code>, указав токен в переменной окружения <code>TRAVELPAYOUTS_TOKEN</code> (или в файле <code>config.local.json</code>).</li>
            <li>Обновите страницу: цены на самолёты подтянутся из Aviasales и будут обновляться при смене даты, города и количества пассажиров.</li>
          </ol>
          <p className="mini muted">
            Без токена сайт показывает ориентировочные цены, но кнопки покупки всё равно ведут на настоящие Aviasales и Tutu.
            Причина: {live.reason || 'онлайн-режим не настроен'}.
          </p>
        </details>
      )}

      {mode === 'plane' && !liveReady && !directFlights.length && (
        <p className="tab-hint" style={{ marginTop: '16px' }}>
          Прямых рейсов из «{origin}» нет — показываем перелёты из других городов.
        </p>
      )}
      {mode === 'train' && !directTrains.length && trains.length > 0 && (
        <p className="tab-hint" style={{ marginTop: '16px' }}>
          Прямых поездов из «{origin}» нет — показываем варианты из других городов.
        </p>
      )}

      <div className="tickets" style={{ marginTop: '16px' }}>
        {mode === 'plane' && liveReady && live.offers.map((o, i) => (
          <LiveTicket
            key={(o.flight_number || '') + o.departure_at + i}
            offer={o}
            d={d}
            date={date}
            pax={pax}
            notify={notify}
            onRequest={onRequest}
          />
        ))}

        {mode === 'plane' && !liveReady && flights.map((f, i) => {
          const key = 'plane|' + f.num + '|' + f.from;
          const options = flightOptions(f);
          const chosen = choose(key, options);
          const arrParts = f.arr.split(' ');
          const link = aviaUrl(f.from, d.iata, date, pax);
          return (
            <div className="ticket-card" key={key} style={{ animationDelay: (i * 45) + 'ms' }}>
              <div className="airline">
                <div className="airline-logo">{initials(f.airline)}</div>
                <div>
                  <div className="airline-name">{f.airline}</div>
                  <div className="airline-sub">{f.num} · из {f.from}</div>
                </div>
              </div>

              <div className="ticket-mid">
                <div className="times-row">
                  <div className="time-block">
                    <div className="t">{f.dep}</div>
                    <div className="p">{f.from}</div>
                  </div>
                  <div className="ticket-line"><span className="mid-icon"><Icon name="plane" size={13} /></span></div>
                  <div className="time-block">
                    <div className="t">{arrParts[0]} <span className="arr-day">{arrParts[1] || ''}</span></div>
                    <div className="p">{d.name}</div>
                  </div>
                </div>
                <div className="class-row">
                  {options.map((o) => (
                    <button
                      key={o.key}
                      className={'class-chip' + (chosen.key === o.key ? ' active' : '')}
                      onClick={() => setChoice(key, o.key)}
                    >
                      {o.label} · ≈ {rub(o.price)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ticket-buy">
                <div>
                  <div className="price-big">≈ {rub(chosen.price * pax)}</div>
                  <div className="price-note">{pax > 1 ? 'за ' + paxText : 'за пассажира'}</div>
                </div>
                <a
                  className="btn btn-sm"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    notify('Открываем Aviasales: ' + f.from + ' → ' + d.name + ', ' + paxText + '.');
                    if (onRequest) onRequest('Aviasales', f.from + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText);
                  }}
                >
                  Найти на Aviasales
                </a>
              </div>
            </div>
          );
        })}

        {mode === 'train' && trains.length === 0 && (
          <div className="empty-state">
            <b>Прямых поездов в {d.name} нет.</b><br />
            Самый быстрый способ — самолёт: переключитесь на авиабилеты.
            <div style={{ marginTop: '18px' }}>
              <button className="btn" onClick={() => setMode('plane')}>Показать авиабилеты</button>
            </div>
          </div>
        )}

        {mode === 'train' && trains.map((tr, i) => {
          const key = 'train|' + tr.num + '|' + tr.from;
          const options = trainOptions(tr);
          const chosen = choose(key, options);
          const arrParts = tr.arr.split(' ');
          return (
            <div className="ticket-card" key={key} style={{ animationDelay: (i * 45) + 'ms' }}>
              <div className="airline">
                <div className="airline-logo train-logo">РЖД</div>
                <div>
                  <div className="airline-name">{tr.num}</div>
                  <div className="airline-sub">из {tr.from}</div>
                </div>
              </div>

              <div className="ticket-mid">
                <div className="times-row">
                  <div className="time-block">
                    <div className="t">{tr.dep}</div>
                    <div className="p">{tr.from}</div>
                  </div>
                  <div className="ticket-line"><span className="mid-icon"><Icon name="train" size={13} /></span></div>
                  <div className="time-block">
                    <div className="t">{arrParts[0]} <span className="arr-day">{arrParts[1] || ''}</span></div>
                    <div className="p">{d.name}</div>
                  </div>
                </div>
                <div className="class-row">
                  {options.map((o) => (
                    <button
                      key={o.key}
                      className={'class-chip' + (chosen.key === o.key ? ' active' : '')}
                      onClick={() => setChoice(key, o.key)}
                    >
                      {o.label} · ≈ {rub(o.price)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ticket-buy">
                <div>
                  <div className="price-big">≈ {rub(chosen.price * pax)}</div>
                  <div className="price-note">{pax > 1 ? 'за ' + paxText : 'за пассажира'}</div>
                </div>
                <a
                  className="btn btn-sm"
                  href={TUTU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    notify('Открываем Tutu.ru: ' + tr.from + ' → ' + d.name + ', ' + dateRu(date) + '.');
                    if (onRequest) onRequest('Tutu.ru', tr.from + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText);
                  }}
                >
                  Купить на Tutu
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="tab-hint" style={{ marginTop: '18px' }}>
        Оплата и выпуск билетов происходят на сайте партнёра (Aviasales или Tutu.ru).
        Демо-цены даны для ознакомления и могут отличаться от актуальных.
        Нажатия кнопок сохраняются в «Мои заявки» — локально, в этом браузере.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- отели */
function HotelsTab({ d, favorites, onFav, notify, k, onRequest }) {
  const [sort, setSort] = useState('rating');
  const [checkin, setCheckin] = useState(todayPlus(7));
  const [checkout, setCheckout] = useState(todayPlus(10));
  const [guests, setGuests] = useState(2);

  const sorted = useMemo(() => {
    const arr = [...d.hotels];
    if (sort === 'rating') arr.sort((a, b) => b.rating - a.rating);
    if (sort === 'cheap') arr.sort((a, b) => a.price - b.price);
    if (sort === 'rich') arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [sort, d]);

  const onCheckin = (value) => {
    setCheckin(value);
    if (value >= checkout) setCheckout(plusDay(value));
  };

  const commonUrl = bookingUrl(d.hotelQuery, checkin, checkout, guests);
  const guestsText = guests + ' ' + (guests === 1 ? 'гость' : 'гостей');

  return (
    <div>
      <div className="search-form hotel-search">
        <div className="field">
          <label htmlFor="checkin">Заезд</label>
          <input id="checkin" type="date" value={checkin} min={todayPlus(0)} onChange={(e) => onCheckin(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="checkout">Выезд</label>
          <input id="checkout" type="date" value={checkout} min={plusDay(checkin)} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        <div className="field">
          <label>Гости</label>
          <div className="stepper">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Меньше гостей">−</button>
            <span>{guests}</span>
            <button type="button" onClick={() => setGuests((g) => Math.min(8, g + 1))} aria-label="Больше гостей">+</button>
          </div>
        </div>
        <a
          className="btn"
          href={commonUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            notify('Открываем Booking.com: ' + d.name + ', ' + guestsText + '.');
            if (onRequest) onRequest('Booking.com', d.name + ', ' + checkin + ' — ' + checkout + ', ' + guestsText);
          }}
        >
          Цены на Booking
        </a>
      </div>

      <p className="tab-hint" style={{ marginTop: '16px' }}>
        Цены в карточках ориентировочные (за ночь). Кнопка «Найти на Booking» открывает реальный поиск
        с датами и гостями — актуальные цены и оплата там.
      </p>

      <div className="sortbar" style={{ marginTop: '10px' }}>
        <span className="label">Сортировать:</span>
        <select className="select-mini" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сортировка отелей">
          <option value="rating">По рейтингу</option>
          <option value="cheap">Сначала дешевле</option>
          <option value="rich">Сначала дороже</option>
        </select>
      </div>

      <div className="hotel-grid">
        {sorted.map((h, i) => {
          const key = d.id + '::' + h.name;
          const fav = !!favorites[key];
          const url = bookingUrl(h.name + ', ' + d.hotelQuery, checkin, checkout, guests);
          return (
            <article className="hotel-card" key={key} style={{ animationDelay: (i * 55) + 'ms' }}>
              <div className="hotel-media">
                <Cover article={d.wiki} gradient={d.gradient} className="cover-holder" overlay="card" />
                <button
                  className={'heart' + (fav ? ' active' : '')}
                  onClick={() => onFav(d, h)}
                  aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
                  title={fav ? 'Убрать из избранного' : 'В избранное'}
                >
                  <Icon name="heart" size={16} filled={fav} />
                </button>
              </div>
              <div className="hotel-body">
                <div className="hotel-top">
                  <div>
                    <h3 className="hotel-name">{h.name}</h3>
                    <Stars n={h.stars} />
                  </div>
                  <span className="rating-pill"><Icon name="star" size={12} filled /> {h.rating.toFixed(1)}</span>
                </div>
                <p className="hotel-district">{h.district}</p>
                <div className="features">
                  {h.features.map((x, idx) => <span key={idx}>{x}</span>)}
                </div>
                <div className="hotel-foot">
                  <div className="hotel-price">
                    <div className="sum">≈ {rub(dprice(h.price, k))}</div>
                    <span className="per">за ночь, ориентир</span>
                  </div>
                  <a
                    className="btn btn-sm"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      notify('Открываем Booking.com — ищем «' + h.name + '».');
                      if (onRequest) onRequest('Booking.com', h.name + ', ' + checkin + ' — ' + checkout + ', ' + guestsText);
                    }}
                  >
                    Найти на Booking
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="tab-hint" style={{ marginTop: '18px' }}>
        Отели из подборки могут быть недоступны по названию — Booking покажет похожие варианты с реальными ценами.
      </p>
    </div>
  );
}

/* -------------------------------------------------- тур агентства */
function AgenciesTab({ d, notify, k, onRequest }) {
  return (
    <div>
      <p className="tab-hint">
        Реальные туроператоры: кнопка ведёт на их сайт, где можно подобрать и купить тур.
        Телефоны и рейтинги здесь демонстрационные.
      </p>
      <div className="agency-grid">
        {d.agencies.map((a, i) => (
          <article className="agency-card" key={a.name + i} style={{ animationDelay: (i * 70) + 'ms' }}>
            <div className="agency-head">
              <div className="agency-logo">{initials(a.name)}</div>
              <span className="rating-pill"><Icon name="star" size={12} filled /> {a.rating.toFixed(1)}</span>
            </div>
            <div>
              <h3 className="agency-name">{a.name}</h3>
              <p className="agency-spec">{a.spec}</p>
            </div>
            <div className="agency-price">
              <span className="lbl">туры от</span>
              <span className="sum">≈ {rub(dprice(a.toursFrom, k))}</span>
            </div>
            <div className="agency-actions">
              <a
                className="btn"
                href={a.site}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  notify('Открываем реальный сайт «' + a.name + '» — покупка тура там.');
                  if (onRequest) onRequest(a.name, d.name + ', туры от ' + rub(dprice(a.toursFrom, k)));
                }}
              >
                Купить тур
              </a>
              <a
                className="btn-ghost"
                href={'tel:' + a.phone.replace(/[^+\d]/g, '')}
                onClick={() => notify('Демо-телефон: ' + a.phone + '. Настоящие контакты — на сайте оператора.')}
              >
                Телефон (демо)
              </a>
            </div>
            <p className="mini muted agency-site">{a.site.replace(/^https?:\/\//, '')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------- карта маршрута */
/* Бесплатные тайлы без API-ключа: OSM, а если он недоступен — CARTO. */
const MAP_TILES = {
  light: [
    {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }
  ],
  dark: [
    {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }
  ]
};

const TRANSPORT_MODES = [
  ['plane', 'Самолёт', 'plane'],
  ['train', 'Поезд', 'train'],
  ['bus', 'Автобус', 'bus'],
  ['car', 'Автомобиль', 'car']
];

function TransportPicker({ value, onChange, label }) {
  return (
    <div className="transport-picker" role="tablist" aria-label={label || 'Способ добраться'}>
      {TRANSPORT_MODES.map(([id, title, icon]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={'transport-option' + (value === id ? ' active' : '')}
          onClick={() => onChange(id)}
        >
          <Icon name={icon} size={17} />
          <span>{title}</span>
        </button>
      ))}
    </div>
  );
}

/* переиспользуемая карта: линия маршрута, точки и (по желанию) реальный путь по дорогам */
function RouteMap({ a, b, dark, className, title, summary, mode, onRoadInfo }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tileRef = useRef(null);
  const providerRef = useRef(0);
  const infoRef = useRef(onRoadInfo);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [roadState, setRoadState] = useState({ status: 'idle', data: null, error: '' });
  const hasMap = typeof window.L !== 'undefined';
  const roadEnabled = mode === 'car' || mode === 'bus';
  const titleKey = title ? title.join('|') : '';

  infoRef.current = onRoadInfo;

  const applyTiles = (map, isDark, index) => {
    const L = window.L;
    if (!L || !map) return;
    if (tileRef.current) {
      map.removeLayer(tileRef.current);
      tileRef.current = null;
    }
    const providers = MAP_TILES[isDark ? 'dark' : 'light'];
    const provider = providers[Math.min(index, providers.length - 1)];
    let errors = 0;
    const layer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom || 19,
      subdomains: provider.subdomains || 'abc',
      attribution: provider.attribution,
      crossOrigin: true,
      updateWhenIdle: true,
      keepBuffer: 2
    });
    layer.on('tileerror', () => {
      errors += 1;
      if (errors >= 4 && index < providers.length - 1 && tileRef.current === layer) {
        providerRef.current = index + 1;
        window.setTimeout(() => applyTiles(map, isDark, index + 1), 0);
      } else if (errors >= 8 && index >= providers.length - 1) {
        setTilesFailed(true);
      }
    });
    layer.on('load', () => setTilesFailed(false));
    layer.addTo(map);
    tileRef.current = layer;
  };

  useEffect(() => {
    if (!window.L || !boxRef.current || mapRef.current) return undefined;
    let map;
    try {
      map = window.L.map(boxRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        worldCopyJump: true,
        preferCanvas: true
      });
    } catch (e) {
      return undefined;
    }
    mapRef.current = map;
    layerRef.current = window.L.layerGroup().addTo(map);
    window.L.control.zoom({ position: 'bottomright' }).addTo(map);
    window.L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 90 }).addTo(map);

    providerRef.current = 0;
    applyTiles(map, dark, 0);

    const invalidate = () => {
      try { map.invalidateSize({ pan: false }); } catch (e) { /* ignore */ }
    };
    const raf = window.requestAnimationFrame(invalidate);
    const timers = [window.setTimeout(invalidate, 180), window.setTimeout(invalidate, 650)];
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(invalidate)
      : null;
    if (observer) observer.observe(boxRef.current);
    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      if (observer) observer.disconnect();
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('orientationchange', invalidate);
      try { map.remove(); } catch (e) { /* ignore */ }
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    providerRef.current = 0;
    setTilesFailed(false);
    applyTiles(map, dark, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  /* Реальный автомобильный маршрут: OSRM через наш /api/route. */
  useEffect(() => {
    let alive = true;
    if (!roadEnabled) {
      setRoadState({ status: 'idle', data: null, error: '' });
      if (infoRef.current) infoRef.current(null);
      return () => { alive = false; };
    }

    setRoadState({ status: 'loading', data: null, error: '' });
    if (infoRef.current) infoRef.current({ status: 'loading', data: null, error: '' });

    if (!API) {
      const state = { status: 'error', data: null, error: 'API сервера недоступен' };
      setRoadState(state);
      if (infoRef.current) infoRef.current(state);
      return () => { alive = false; };
    }

    API.roadRoute(a, b).then((data) => {
      if (!alive) return;
      const state = data && Array.isArray(data.geometry) && data.geometry.length > 1
        ? { status: 'ok', data, error: '' }
        : { status: 'error', data: null, error: 'Маршрут не найден' };
      setRoadState(state);
      if (infoRef.current) infoRef.current(state);
    }).catch((error) => {
      if (!alive) return;
      const state = { status: 'error', data: null, error: error.message || 'Сервис маршрутов недоступен' };
      setRoadState(state);
      if (infoRef.current) infoRef.current(state);
    });

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadEnabled, a.lat, a.lon, b.lat, b.lon]);

  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();

    const road = roadState.status === 'ok' && roadState.data && roadState.data.geometry
      ? roadState.data.geometry
      : null;
    const pts = road && road.length > 1 ? road : arcPoints(a, b);
    const c1 = dark ? '#7da2ff' : '#1d4ed8';
    const c2 = dark ? '#4fd1c5' : '#0f766e';
    const plane = mode === 'plane' || (!mode && !road);

    L.polyline(pts, { color: c1, weight: 10, opacity: 0.15, lineCap: 'round' }).addTo(layer);
    L.polyline(pts, {
      color: c1,
      weight: road ? 5 : 3,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: plane ? '7 7' : null
    }).addTo(layer);

    const halo = (pos, color) => L.marker(pos, {
      icon: L.divIcon({
        className: 'map-halo-wrap',
        html: '<span style="background:' + color + '"></span>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      keyboard: false,
      interactive: false
    }).addTo(layer);

    const pin = (pos, text, color) => L.marker(pos, {
      icon: L.divIcon({
        className: 'map-pin-wrap',
        html: '<div class="map-label"><span class="dot" style="background:' + color + '"></span>' +
          String(text).replace(/[<>&]/g, '') + '</div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      keyboard: false,
      interactive: false
    }).addTo(layer);

    halo([a.lat, a.lon], c1);
    halo([b.lat, b.lon], c2);
    pin([a.lat, a.lon], title ? title[0] : (a.name || a.iata || 'Откуда'), c1);
    pin([b.lat, b.lon], title ? title[1] : (b.name || 'Куда'), c2);

    const bounds = L.latLngBounds(pts);
    try {
      map.fitBounds(bounds, {
        paddingTopLeft: [34, 54],
        paddingBottomRight: [34, 34],
        maxZoom: 12,
        animate: false
      });
      window.setTimeout(() => {
        try { map.invalidateSize({ pan: false }); } catch (e) { /* ignore */ }
      }, 80);
    } catch (e) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.lat, a.lon, b.lat, b.lon, dark, mode, roadState.status, roadState.data, titleKey]);

  const roadStatus = roadState.status === 'ok' && roadState.data
    ? formatKm(roadState.data.distanceKm) + ' по дорогам · ' + formatDurationMin(roadState.data.durationMin)
    : '';

  return (
    <div className={'map-wrap ' + (className || '')}>
      {!hasMap && (
        <div className="hint-box" style={{ display: 'block', marginBottom: '10px' }}>
          <p style={{ margin: '8px 0' }}>
            Карта недоступна: библиотека Leaflet не загрузилась. Расстояние, время и кнопки покупки работают и без карты.
          </p>
        </div>
      )}
      <div
        className={'map-box' + (hasMap ? '' : ' map-box-empty') + (dark ? ' map-box-dark' : '')}
        ref={boxRef}
        role="region"
        aria-label={'Карта маршрута ' + (title ? title.join(' — ') : '')}
      ></div>

      <div className="map-badges">
        {summary && <div className="map-summary">{summary}</div>}
        {roadEnabled && roadState.status === 'loading' && (
          <div className="map-road-chip">Строю дорожный маршрут…</div>
        )}
        {roadStatus && (
          <div className="map-road-chip ok">{roadStatus}</div>
        )}
        {roadEnabled && roadState.status === 'error' && (
          <div className="map-road-chip warn">
            Дорога недоступна — показана прямая. {roadState.error ? '(' + roadState.error + ')' : ''}
          </div>
        )}
        {tilesFailed && (
          <div className="map-road-chip warn">Подложка карты не загрузилась. Проверьте интернет.</div>
        )}
      </div>

      <span className="map-attribution">© OpenStreetMap contributors · Leaflet</span>
    </div>
  );
}

/* Одна выбранная поездка: путь, время, расстояние, цена и кнопка покупки. */
function TripModeSummary({ mode, km, roadInfo, knownRoute, priceK, fromName, toName, notify, onRequest }) {
  const meta = MODE_META.find((m) => m[0] === mode) || MODE_META[0];
  const estimate = fareByDistance[mode] ? fareByDistance[mode](km) : fareByDistance.plane(km);
  const road = (mode === 'car' || mode === 'bus') && roadInfo && roadInfo.status === 'ok'
    ? roadInfo.data
    : null;
  const known = knownRoute || null;
  const time = known ? known.dur : (road ? formatDurationMin(road.durationMin) : estimate.time);
  const distance = known ? known.dist : (road ? formatKm(road.distanceKm) : formatKm(km) + ' по прямой');
  const price = known ? known.price : '≈ ' + rub(dprice(estimate.from, priceK)) + ' — ' + rub(dprice(estimate.to, priceK));
  const note = known ? known.note : meta[2];

  let url = '';
  let label = 'Проверить и купить';
  if (mode === 'plane') url = 'https://www.aviasales.ru';
  if (mode === 'train') url = TUTU_URL;
  if (mode === 'bus') url = 'https://rasp.yandex.ru/bus';
  if (mode === 'car') {
    url = yaRouteUrl(
      { lat: fromName && fromName.lat, lon: fromName && fromName.lon },
      { lat: toName && toName.lat, lon: toName && toName.lon }
    );
    label = 'Открыть в Яндекс.Картах';
  }

  return (
    <div className="trip-summary panel">
      <div className="trip-summary-main">
        <div className="trip-summary-icon"><Icon name={meta[3]} size={24} /></div>
        <div>
          <h3>{meta[1]} — {fromName.name || fromName} → {toName.name || toName}</h3>
          <p className="trip-summary-note">{note}</p>
          {roadInfo && roadInfo.status === 'loading' && (
            <p className="mini muted">Строю реальный дорожный маршрут…</p>
          )}
          {roadInfo && roadInfo.status === 'error' && !road && (
            <p className="mini muted">Дорожный сервис недоступен — время и расстояние показаны ориентировочно.</p>
          )}
        </div>
      </div>
      <div className="trip-summary-stats">
        <div>
          <span className="k">В пути</span>
          <span className="v">{time}</span>
          <span className="mini muted">{road ? 'по дорогам' : 'ориентир'}</span>
        </div>
        <div>
          <span className="k">Расстояние</span>
          <span className="v">{distance}</span>
        </div>
        <div>
          <span className="k">Цена</span>
          <span className="v">{price}</span>
        </div>
      </div>
      <div className="trip-summary-actions">
        <a
          className="btn"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (notify) notify('Открываем ' + (mode === 'car' ? 'Яндекс.Карты' : 'сайт партнёра') + ' — там актуальные цены и маршрут.');
            if (onRequest) onRequest(mode === 'car' ? 'Яндекс Карты' : meta[1], (fromName.name || fromName) + ' → ' + (toName.name || toName));
          }}
        >
          {label}
        </a>
      </div>
    </div>
  );
}

function MapTab({ d, notify, dark, onRequest, k }) {
  const [origin, setOrigin] = useState('Москва');
  const [mode, setMode] = useState('plane');
  const [roadInfo, setRoadInfo] = useState(null);
  const o = { ...(CITY_INFO[origin] || CITY_INFO['Москва']), name: origin };
  const dest = { lat: d.lat, lon: d.lon, name: d.name };
  const km = distKm(o, dest);
  const knownRoute = d.routes.find((r) => r.icon === mode && r.from === origin && mode !== 'car') || null;

  return (
    <div>
      <p className="tab-hint">
        Маршрут «{origin} → {d.name}». Выберите, на чём хотите добраться: карта покажет путь,
        а ниже — примерное время и расстояние. Для автомобиля строится реальный дорожный маршрут.
      </p>

      <div className="search-form map-form">
        <div className="field">
          <label htmlFor="map-origin">Откуда</label>
          <select id="map-origin" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {Object.keys(CITY_INFO).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Куда</label>
          <div className="map-dest-fixed">{d.name}, {d.country}</div>
        </div>
        <a
          className="btn"
          href={yaRouteUrl(o, dest)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            notify('Открываем Яндекс.Карты — реальные маршруты, время и пробки.');
            if (onRequest) onRequest('Яндекс Карты', origin + ' → ' + d.name);
          }}
        >
          Дорога в Яндекс.Картах
        </a>
      </div>

      <TransportPicker value={mode} onChange={setMode} label="Чем добраться до направления" />

      <RouteMap
        a={o}
        b={dest}
        dark={dark}
        mode={mode}
        title={[origin, d.name]}
        summary={origin + ' → ' + d.name + ' · ' + formatKm(km) + ' по прямой'}
        onRoadInfo={setRoadInfo}
      />

      <TripModeSummary
        mode={mode}
        km={km}
        roadInfo={roadInfo}
        knownRoute={knownRoute}
        priceK={k}
        fromName={origin}
        toName={d.name}
        notify={notify}
        onRequest={onRequest}
      />
    </div>
  );
}

/* -------------------------------------------------- о направлении */
function AboutTab({ d }) {
  return (
    <div className="about">
      <div className="panel">
        <h3>Почему {d.name}?</h3>
        <p className="about-desc">{d.description}</p>
        <div className="attr-grid">
          {d.attractions.map((a) => (
            <div className="attr-card" key={a.name}>{a.name}</div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Полезно знать</h3>
        <div className="stat-row">
          <div className="stat-box">
            <div className="k">Когда ехать</div>
            <div className="v">{d.stats.bestTime}</div>
          </div>
          <div className="stat-box">
            <div className="k">Температура</div>
            <div className="v">{d.stats.temp}</div>
          </div>
        </div>
        <div className="stat-box" style={{ marginBottom: '16px' }}>
          <div className="k">Сезон</div>
          <div className="v">{d.stats.season}</div>
        </div>
        <ul className="tips">
          {d.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------- страница направления */
function Destination({ d, tab, onTab, favorites, onFav, notify, k, dark, onRequest, initialOrigin, initialDate, initialPax }) {
  const tabs = [
    ['route', 'Как добраться'],
    ['tickets', 'Билеты'],
    ['hotels', 'Отели'],
    ['tours', 'Турфирмы'],
    ['map', 'Карта маршрута'],
    ['about', 'О направлении']
  ];
  const f = minFlight(d);
  const t = minTrain(d);

  return (
    <div>
      <section className="dest-hero">
        <Cover article={d.wiki} gradient={d.gradient} className="cover-holder" overlay="hero" />
        <div className="container dest-hero-inner">
          <div className="hero-chips">
            <span className="pill">{d.country}{d.region ? ' · ' + d.region : ''}</span>
          </div>
          <h1 className="dest-title">{d.name}</h1>
          <p className="dest-tagline">{d.tagline}</p>
          <div className="hero-chips">
            <span className="pill">Лучший сезон: {d.stats.bestTime}</span>
            <span className="pill">Температура: {d.stats.temp}</span>
            {f && <span className="pill">Самолёт — от <strong>{rub(dprice(f, k))}</strong></span>}
            {t && <span className="pill">Поезд — от <strong>{rub(dprice(t, k))}</strong></span>}
          </div>
        </div>
      </section>

      <div className="tabs-wrap">
        <div className="container">
          <div className="tabs" role="tablist">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={'tab' + (tab === id ? ' active' : '')}
                onClick={() => onTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container content-area" key={tab}>
        {tab === 'route' && <RoutesTab d={d} onTab={onTab} />}
        {tab === 'tickets' && (
          <TicketsTab
            d={d}
            notify={notify}
            k={k}
            onRequest={onRequest}
            initialOrigin={initialOrigin}
            initialDate={initialDate}
            initialPax={initialPax}
          />
        )}
        {tab === 'hotels' && <HotelsTab d={d} favorites={favorites} onFav={onFav} notify={notify} k={k} onRequest={onRequest} />}
        {tab === 'tours' && <AgenciesTab d={d} notify={notify} k={k} onRequest={onRequest} />}
        {tab === 'map' && <MapTab d={d} notify={notify} dark={dark} onRequest={onRequest} />}
        {tab === 'about' && <AboutTab d={d} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- избранное */
function FavModal({ favs, onClose, onRemove, onClear }) {
  const list = Object.values(favs);
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Избранные отели">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Избранные отели</h3>
          <button className="icon-btn close" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={16} /></button>
        </div>
        <div className="fav-list">
          {list.length === 0 && (
            <div className="empty-state" style={{ border: 0, padding: '26px 12px' }}>
              Пока пусто. Отмечайте отели сердечком — они появятся здесь.
            </div>
          )}
          {list.map((item) => (
            <div className="fav-row" key={item.key}>
              <span className="fav-ico"><Icon name="bed" size={16} /></span>
              <div className="fav-info">
                <div className="fav-name">{item.name}</div>
                <div className="fav-sub">{item.destName} · ≈ {rub(item.price)} за ночь</div>
              </div>
              <button className="x" onClick={() => onRemove(item.key)} aria-label="Удалить из избранного"><Icon name="close" size={14} /></button>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClear}>Очистить</button>
          <button className="btn" onClick={onClose} style={{ flex: 1 }}>Готово</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- подвал */
function Footer({ onOpen, data }) {
  const list = Array.isArray(data) ? data : [];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="foot-brand">
            <div className="brand foot-logo">
              <span className="brand-mark"><LogoMark size={28} /></span>
              <span className="brand-name">Поехали</span>
            </div>
            <p>Планировщик путешествий: как добраться, где остановиться и у кого купить тур — в одном месте.</p>
          </div>
          <div className="foot-col">
            <h4>Направления</h4>
            {list.slice(0, 4).map((d) => (
              <button key={d.id} onClick={() => onOpen(d.id)}>{d.name}</button>
            ))}
          </div>
          <div className="foot-col">
            <h4>Партнёры</h4>
            <a href="https://www.aviasales.ru" target="_blank" rel="noopener noreferrer">Aviasales — авиабилеты</a>
            <a href="https://www.tutu.ru/poezda/" target="_blank" rel="noopener noreferrer">Tutu.ru — поезда</a>
            <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer">Booking.com — отели</a>
            <a href="https://yandex.ru/maps/" target="_blank" rel="noopener noreferrer">Яндекс Карты — маршруты</a>
            <a href="https://level.travel" target="_blank" rel="noopener noreferrer">Level.Travel — туры</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 «Поехали» — учебный проект. Демо-цены и контакты не являются офертой; покупка — на сайтах партнёров.</span>
          <span>Сделано на HTML, CSS и React</span>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------- тост */
function Toast({ msg }) {
  return (
    <div className="toast">
      <span className="toast-ico"><Icon name="check" size={13} /></span>
      {msg}
    </div>
  );
}

/* ------------------------------------------------------ вход */
const ADMIN_CREDENTIALS = { login: 'admin', password: 'admin' };

function AuthModal({ onClose, onGuest, onAdmin }) {
  const nameRef = useRef(null);
  const loginRef = useRef(null);
  const passRef = useRef(null);

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Вход в аккаунт">
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Вход в аккаунт</h3>
          <button className="icon-btn close" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={16} /></button>
        </div>
        <div className="auth-grid">
          <div className="auth-card">
            <span className="auth-role-badge guest">Гость</span>
            <p className="auth-text">
              Планируйте поездки, сохраняйте отели в избранное и оставляйте заявки на покупку.
            </p>
            <label className="auth-label" htmlFor="gname">Как вас называть (необязательно)</label>
            <input
              id="gname"
              ref={nameRef}
              type="text"
              placeholder="Например, Анна"
              autoComplete="off"
            />
            <button className="btn" onClick={() => onGuest(nameRef.current.value)}>Войти как гость</button>
          </div>

          <div className="auth-card admin">
            <span className="auth-role-badge">Администратор</span>
            <p className="auth-text">
              Доступ к админ-панели: заявки пользователей, статистика и демо-коэффициент цен.
            </p>
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="alogin">Логин</label>
                <input id="alogin" ref={loginRef} type="text" placeholder="Логин" autoComplete="off" />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="apass">Пароль</label>
                <input id="apass" ref={passRef} type="password" placeholder="Пароль" autoComplete="off" />
              </div>
            </div>
            <button className="btn dark" onClick={() => onAdmin(loginRef.current.value, passRef.current.value)}>Войти как администратор</button>
            <p className="mini muted">Демо-доступ: логин <code>admin</code>, пароль <code>admin</code>. Пароль находится прямо в коде страницы — это не настоящая защита.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------- мои заявки */
function RequestsModal({ requests, onClose, onClear, title, note }) {
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn close" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={16} /></button>
        </div>
        <div className="fav-list req-list">
          {requests.length === 0 && (
            <div className="empty-state" style={{ border: 0, padding: '26px 12px' }}>
              Заявок пока нет. Нажимайте кнопки покупки — обращения сохранятся здесь.
            </div>
          )}
          {requests.map((r) => (
            <div className="req-row" key={r.id}>
              <div className="req-top">
                <span className="req-service">{r.service}</span>
                <span className="req-time">{r.time}</span>
              </div>
              <div className="req-route">{r.route}</div>
              <div className="req-user mini muted">клиент: {r.user}</div>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClear} disabled={requests.length === 0}>Очистить</button>
          <button className="btn" onClick={onClose} style={{ flex: 1 }}>Готово</button>
        </div>
        <p className="mini muted" style={{ margin: '0 20px 14px' }}>{note}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------- админ-панель */
function AdminPanel({
  requests, favCount, priceK, onPriceK,
  onClearRequests, onClearFavs, onClose
}) {
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Админ-панель">
      <div className="modal admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Админ-панель</h3>
          <button className="icon-btn close" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={16} /></button>
        </div>
        <div className="admin-body">
          <div className="admin-stats">
            <div className="stat-box">
              <div className="k">Заявки</div>
              <div className="v">{requests.length}</div>
            </div>
            <div className="stat-box">
              <div className="k">В избранном</div>
              <div className="v">{favCount}</div>
            </div>
          </div>

          <div className="admin-block">
            <h4>Демо-коэффициент цен</h4>
            <p className="mini muted">
              Умножает ориентировочные цены (со знаком ≈): удобно для показа на защите или для сценария «цены выросли».
              Реальные цены Aviasales коэффициент не меняет.
            </p>
            <div className="range-row">
              <span>×0,8</span>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                defaultValue={priceK || 1}
                onInput={(e) => onPriceK(parseFloat(e.target.value))}
                onChange={(e) => onPriceK(parseFloat(e.target.value))}
                aria-label="Коэффициент цен"
              />
              <span>×1,5</span>
            </div>
            <div className="range-value">Текущий коэффициент: <b>×{priceK.toFixed(2).replace('.', ',')}</b></div>
          </div>

          <div className="admin-block">
            <h4>Последние заявки</h4>
            <div className="fav-list req-list admin-req">
              {requests.length === 0 && <p className="mini muted">Пока нет обращений.</p>}
              {requests.slice(0, 6).map((r) => (
                <div className="req-row compact" key={r.id}>
                  <div className="req-top">
                    <span className="req-service">{r.service}</span>
                    <span className="req-time">{r.time}</span>
                  </div>
                  <div className="req-route">{r.route}</div>
                  <div className="req-user mini muted">{r.user}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-actions">
            <button className="btn-ghost" onClick={onClearRequests}>Очистить заявки</button>
            <button className="btn-ghost" onClick={onClearFavs}>Очистить избранное</button>
          </div>

          <p className="mini muted">
            Панель работает локально (демо): все данные хранятся только в этом браузере.
            Для реальной системы нужны сервер, база данных и настоящая авторизация.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------- планировщик поездки */
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&accept-language=ru&limit=5&q=';

function PlaceSearch({ id, label, value, onPick, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onType = (text) => {
    setQuery(text);
    setResults([]);
    clearTimeout(timerRef.current);
    if (text.trim().length < 3) { setOpen(false); setBusy(false); return; }
    setBusy(true);
    timerRef.current = setTimeout(() => {
      fetch(NOMINATIM_URL + encodeURIComponent(text.trim()))
        .then((r) => r.ok ? r.json() : Promise.reject(new Error('geocode failed')))
        .then((data) => {
          setResults(data.map((x) => ({
            name: x.name || x.address && x.address.city || (x.display_name || '').split(',')[0],
            display: x.display_name,
            lat: parseFloat(x.lat),
            lon: parseFloat(x.lon),
            country: x.address && (x.address.country || ''),
            kind: x.type || ''
          })));
          setOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setBusy(false));
    }, 500);
  };

  return (
    <div className="field place-search">
      <label htmlFor={id}>{label}</label>
      {value ? (
        <div className="place-picked">
          <span className="place-dot"></span>
          <span className="place-name">{value.name}</span>
          <button type="button" className="place-replace" onClick={() => { onPick(null); setQuery(''); }}>
            Изменить
          </button>
        </div>
      ) : (
        <div className="place-wrap">
          <input
            id={id}
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onType(e.target.value)}
          />
          {busy && <span className="place-busy">поиск…</span>}
          {open && results.length > 0 && (
            <div className="place-results" role="listbox">
              {results.map((r, i) => (
                <button
                  type="button"
                  key={i}
                  role="option"
                  aria-selected="false"
                  className="place-result"
                  onClick={() => { onPick(r); setOpen(false); }}
                >
                  <span className="place-result-name">{r.name}</span>
                  <span className="place-result-sub">{r.display}</span>
                </button>
              ))}
            </div>
          )}
          {open && !busy && results.length === 0 && (
            <div className="place-results"><span className="place-empty mini muted">Ничего не нашлось. Попробуйте написать по-другому.</span></div>
          )}
        </div>
      )}
    </div>
  );
}

/* грубые ориентиры стоимости и времени (для «любого места», где нет наших тарифов) */
const fareByDistance = {
  plane: (km) => ({ from: Math.round((km * 3.1 + 1800) / 10) * 10, to: Math.round((km * 4.6 + 2600) / 10) * 10, time: flightTime(Math.round(km * 1.1)) }),
  train: (km) => ({ from: Math.round((km * 1.0 + 700) / 10) * 10, to: Math.round((km * 2.1 + 1200) / 10) * 10, time: flightTime(Math.round(km * 1.65)) }),
  bus: (km) => ({ from: Math.round((km * 1.1 + 500) / 10) * 10, to: Math.round((km * 1.9 + 900) / 10) * 10, time: flightTime(Math.round(km * 1.55)) }),
  car: (km) => ({ from: Math.round((km * 7.5 + 0) / 10) * 10, to: Math.round((km * 9.5 + 500) / 10) * 10, time: flightTime(Math.round(km * 1.25)) })
};

const MODE_META = [
  ['plane', 'Самолёт', 'По прямой авиамаршрут: время и цена — ориентир, точные тарифы на Aviasales.', 'https://www.aviasales.ru'],
  ['train', 'Поезд', 'Если между пунктами есть железнодорожное сообщение.', 'https://www.tutu.ru/poezda/'],
  ['bus', 'Автобус', 'Междугородние автобусы и маршрутные перевозки.', 'https://rasp.yandex.ru/bus'],
  ['car', 'Автомобиль', 'По реальным дорогам: топливо, платные участки и средняя скорость учтены ориентировочно.', '']
];

function PlannerPage({ notify, dark, onRequest, priceK }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState(todayPlus(7));
  const [time, setTime] = useState('10:00');
  const ready = !!(from && to);
  const km = ready ? distKm(from, to) : 0;
  const k = priceK || 1;
  const sameCountry = ready && from.country === to.country;

  const summary = ready
    ? from.name + ' → ' + to.name + ' · ≈' + km.toLocaleString('ru-RU') + ' км'
    : '';

  return (
    <div>
      <section className="planner-head">
        <div className="eyebrow">Планировщик</div>
        <h1 className="h2">Постройте маршрут «откуда — куда»</h1>
        <p className="section-sub">
          Введите любые города или места, выберите дату и время в календаре —
          покажем все возможные способы добраться с ориентирами по времени и цене.
        </p>
      </section>

      <div className="search-form planner-form">
        <PlaceSearch
          id="p-from"
          label="Откуда"
          placeholder="Город, например Казань"
          value={from}
          onPick={setFrom}
        />
        <PlaceSearch
          id="p-to"
          label="Куда"
          placeholder="Город или место, например Дагомыс"
          value={to}
          onPick={setTo}
        />
        <div className="field">
          <label htmlFor="p-date">Дата</label>
          <input id="p-date" type="date" value={date} min={todayPlus(0)} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p-time">Время</label>
          <input id="p-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        {ready && from && to && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => { const a = from; const b = to; setFrom(b); setTo(a); }}
            title="Поменять пункты местами"
          >
            <Icon name="swap" size={15} /> Поменять
          </button>
        )}
      </div>

      {!ready && (
        <div className="empty-state">
          Укажите «откуда» и «куда» — появятся способы добраться и карта маршрута.
        </div>
      )}

      {ready && (
        <div>
          <RouteMap
            a={from}
            b={to}
            dark={dark}
            className="planner-map"
            showLabels
            summary={summary + ' · ' + dateRu(date) + ' ' + time}
          />

          <div className="mode-grid">
            {MODE_META.map(([id, title, note, link]) => {
              if ((id === 'train' || id === 'bus') && !sameCountry) return null;
              const f = fareByDistance[id](km);
              const url = id === 'car' ? yaRouteUrl(from, to) : link;
              const label = id === 'car' ? 'Маршрут в Яндекс.Картах' : 'Проверить и купить';
              return (
                <article className="mode-card" key={id}>
                  <div className="mode-head">
                    <h3>{title}</h3>
                    <span className="mode-abbr">{id === 'plane' ? 'самолёт' : id === 'train' ? 'поезд' : id === 'bus' ? 'автобус' : 'авто'}</span>
                  </div>
                  <div className="mode-body">
                    <div className="mode-cell">
                      <span className="k">В пути</span>
                      <span className="v">{f.time}</span>
                    </div>
                    <div className="mode-cell">
                      <span className="k">Цена</span>
                      <span className="v">≈ {rub(dprice(f.from, k))} — {rub(dprice(f.to, k))}</span>
                    </div>
                  </div>
                  <p className="mode-note">{note}</p>
                  {url ? (
                    <a
                      className="btn btn-sm"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        notify('Открываем внешнюю услугу: расписание и покупка там.');
                        if (onRequest) onRequest(label.startsWith('Маршрут') ? 'Яндекс Карты' : title, from.name + ' → ' + to.name + ', ' + dateRu(date) + ' ' + time);
                      }}
                    >
                      {label}
                    </a>
                  ) : <span className="mini muted">Езжайте сами — маршрут уже в Яндекс.Картах по кнопке ниже.</span>}
                </article>
              );
            })}
          </div>

          <div className="panel cta-panel">
            <div>
              <h3>Дальше по маршруту</h3>
              <p className="muted mini">
                Оценки построены по расстоянию по прямой — у автобуса и поезда фактический путь длиннее,
                поэтому точные цены всегда по кнопкам на сайтах партнёров.
              </p>
            </div>
            <a
              className="btn-ghost"
              href={yaRouteUrl(from, to)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                notify('Открываем Яндекс.Карты.');
                if (onRequest) onRequest('Яндекс Карты', from.name + ' → ' + to.name + ', ' + dateRu(date) + ' ' + time);
              }}
            >
              Дорога в Яндекс.Картах
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------- приложение */
/* адреса вида #/dest/sochi и #/planner — чтобы страницу можно было открыть и обновить */
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '');
  if (raw.indexOf('dest/') === 0) {
    const id = raw.slice(5);
    if (DATA.some((x) => x.id === id)) return { page: 'dest', id };
  }
  if (raw === 'planner') return { page: 'planner' };
  return { page: 'home' };
}

function App() {
  const [route, setRoute] = useState(parseHash);
  const [tab, setTab] = useState('route');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poehali_favs') || '{}'); } catch (e) { return {}; }
  });
  const [favOpen, setFavOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('poehali_theme') === 'dark'; } catch (e) { return false; }
  });
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  /* аккаунты, заявки, коэффициент цен */
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poehali_user') || 'null'); } catch (e) { return null; }
  });
  const [requests, setRequests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poehali_requests') || '[]'); } catch (e) { return []; }
  });
  const [priceK, setPriceK] = useState(() => {
    const v = parseFloat(localStorage.getItem('poehali_priceK'));
    return isNaN(v) ? 1 : v;
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* что выбрано в поиске на главной — переносим на страницу билетов */
  const [searchOrigin, setSearchOrigin] = useState('Москва');
  const [searchDate, setSearchDate] = useState(todayPlus(7));
  const [searchPax, setSearchPax] = useState(1);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('poehali_theme', dark ? 'dark' : 'light'); } catch (e) {}
  }, [dark]);

  useEffect(() => {
    try { localStorage.setItem('poehali_favs', JSON.stringify(favorites)); } catch (e) {}
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem('poehali_requests', JSON.stringify(requests)); } catch (e) {}
  }, [requests]);

  useEffect(() => {
    try { localStorage.setItem('poehali_priceK', String(priceK)); } catch (e) {}
  }, [priceK]);

  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  useEffect(() => {
    const hash = route.page === 'home'
      ? '#/'
      : route.page === 'planner'
        ? '#/planner'
        : '#/dest/' + route.id;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [route]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      setTab('route');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (msg) => {
    setToast({ msg, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3800);
  };

  const openDest = (id) => {
    setTab('route');
    setRoute({ page: 'dest', id });
  };
  const openSearch = (id) => {
    setTab('tickets');
    setRoute({
      page: 'dest',
      id,
      origin: searchOrigin,
      date: searchDate,
      pax: searchPax
    });
  };
  const goHome = () => setRoute({ page: 'home' });
  const goPlanner = () => setRoute({ page: 'planner' });
  const d = route.page === 'dest' ? DATA.find((x) => x.id === route.id) : null;

  /* ---------- учётные записи ---------- */
  const loginUser = (u, msg) => {
    setUser(u);
    try { localStorage.setItem('poehali_user', JSON.stringify(u)); } catch (e) {}
    setAuthOpen(false);
    setMenuOpen(false);
    notify(msg);
  };

  const loginGuest = (name) => {
    loginUser({ name: (String(name || '').trim() || 'Гость').slice(0, 24), role: 'guest' },
      'Вы вошли как гость. Приятного планирования!');
  };

  const loginAdmin = (login, pass) => {
    if (login.trim().toLowerCase() === ADMIN_CREDENTIALS.login && pass === ADMIN_CREDENTIALS.password) {
      loginUser({ name: 'Администратор', role: 'admin' }, 'Вы вошли как администратор. Открыт доступ к панели.');
    } else {
      notify('Неверный логин или пароль администратора. Демо-доступ: admin / admin.');
    }
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('poehali_user'); } catch (e) {}
    setMenuOpen(false);
    notify('Вы вышли из аккаунта.');
  };

  const logRequest = (service, routeText) => {
    setRequests((prev) => [{
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      service,
      route: routeText,
      user: user ? (user.name + ' · ' + (user.role === 'admin' ? 'администратор' : 'гость')) : 'без входа',
      time: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 60));
  };

  const clearRequests = () => { setRequests([]); notify('Список заявок очищен.'); };
  const clearFavsFromPanel = () => { setFavorites({}); notify('Избранное очищено.'); };

  const toggleFav = (dest, hotel) => {
    const key = dest.id + '::' + hotel.name;
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        notify('Отель убран из избранного');
      } else {
        next[key] = {
          key,
          name: hotel.name,
          price: hotel.price,
          icon: hotel.icon,
          destId: dest.id,
          destName: dest.name
        };
        notify('Отель «' + hotel.name + '» в избранном');
      }
      return next;
    });
  };

  const removeFav = (key) => setFavorites((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });
  const clearFavs = () => { setFavorites({}); notify('Избранное очищено'); };
  const favCount = Object.keys(favorites).length;

  return (
    <div className="app">
      <Header
        page={route.page}
        onHome={goHome}
        favCount={favCount}
        onFav={() => setFavOpen(true)}
        dark={dark}
        onTheme={() => setDark((v) => !v)}
        user={user}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onAuth={() => setAuthOpen(true)}
        onLogout={logout}
        onRequests={() => { setMenuOpen(false); setReqOpen(true); }}
        onPanel={() => { setMenuOpen(false); setPanelOpen(true); }}
        onPlanner={goPlanner}
        reqCount={requests.length}
      />
      <main>
        {route.page === 'home' && (
          <Home
            onOpen={openDest}
            onOpenSearch={openSearch}
            onPlanner={goPlanner}
            onFav={() => setFavOpen(true)}
            searchOrigin={searchOrigin}
            onSearchOrigin={setSearchOrigin}
            searchDate={searchDate}
            onSearchDate={setSearchDate}
            searchPax={searchPax}
            onSearchPax={setSearchPax}
            k={priceK}
          />
        )}
        {route.page === 'planner' && (
          <PlannerPage
            notify={notify}
            dark={dark}
            onRequest={logRequest}
            priceK={priceK}
          />
        )}
        {d && (
          <Destination
            d={d}
            tab={tab}
            onTab={setTab}
            favorites={favorites}
            onFav={toggleFav}
            notify={notify}
            k={priceK}
            dark={dark}
            onRequest={logRequest}
            initialOrigin={route.origin}
            initialDate={route.date}
            initialPax={route.pax}
          />
        )}
      </main>
      <Footer onOpen={openDest} />
      {favOpen && <FavModal favs={favorites} onClose={() => setFavOpen(false)} onRemove={removeFav} onClear={clearFavs} />}
      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onGuest={loginGuest} onAdmin={loginAdmin} />
      )}
      {reqOpen && (
        <RequestsModal
          requests={requests}
          title="Мои заявки"
          note="Заявки фиксируются автоматически, когда вы открываете сервис покупки. Данные хранятся только в этом браузере."
          onClose={() => setReqOpen(false)}
          onClear={clearRequests}
        />
      )}
      {panelOpen && (
        <AdminPanel
          requests={requests}
          favCount={favCount}
          priceK={priceK}
          onPriceK={(v) => setPriceK(v)}
          onClearRequests={clearRequests}
          onClearFavs={clearFavsFromPanel}
          onClose={() => setPanelOpen(false)}
        />
      )}
      {toast && <Toast key={toast.id} msg={toast.msg} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
