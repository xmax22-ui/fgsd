/* Сгенерировано из js/app.jsx командой node build.cjs — не редактируйте вручную. */
/* ============================================================
   Поехали! — React-приложение (исходник JSX)
   Компилируется в js/app.js командой: node build.cjs
   ============================================================ */

const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

/* -------------------------------------------------- утилиты */
const rub = n => Number(n).toLocaleString('ru-RU') + ' ₽';
const dateRu = iso => new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const timeRu = dateObj => dateObj.toLocaleTimeString('ru-RU', {
  hour: '2-digit',
  minute: '2-digit'
});
const todayPlus = days => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const plusDay = iso => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const pluralPax = n => {
  const m10 = n % 10,
    m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'пассажир';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'пассажира';
  return 'пассажиров';
};
const pluralTransfer = n => n === 0 ? 'без пересадок' : n + ' пересадка' + (n === 1 ? '' : n >= 2 && n <= 4 ? 'и' : '');
const minFlight = d => d.flights.length ? Math.min(...d.flights.map(f => f.econ)) : null;
const minTrain = d => d.trains.length ? Math.min(...d.trains.flatMap(t => Object.values(t.classes))) : null;
const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const grad = d => 'linear-gradient(135deg, ' + d.gradient[0] + ', ' + d.gradient[1] + ')';

/* ---------------------------------------------------- SVG-иконки (вместо эмодзи) */
const ICONS = {
  plane: /*#__PURE__*/React.createElement("path", {
    d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
  }),
  train: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "3",
    width: "14",
    height: "14",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 10h14"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "13.5",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "13.5",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m8.5 17-1.5 3M15.5 17l1.5 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 20v-1.5M13 18.5V20"
  })),
  bus: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "4",
    width: "16",
    height: "13",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 10h16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "13.5",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "13.5",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17v3M17 17v3"
  })),
  car: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "17",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "17",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17h6"
  })),
  ferry: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 14.5h17L19 18.5H5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14.5v-8l5.5 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 21.2c.5.3 1.2.6 2 .6s1.6-.3 2.2-.6c.6-.3 1.3-.6 2-.6s1.4.3 2 .6c.6.3 1.4.6 2.2.6s1.4-.3 2-.6"
  })),
  bed: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"
  })),
  heart: /*#__PURE__*/React.createElement("path", {
    d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7z"
  }),
  check: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  search: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  sun: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
  })),
  moon: /*#__PURE__*/React.createElement("path", {
    d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"
  }),
  flame: /*#__PURE__*/React.createElement("path", {
    d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"
  }),
  pin: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M20 10c0 5-5.5 10.4-7.4 12.2a1 1 0 0 1-1.2 0C9.5 20.4 4 15 4 10a8 8 0 0 1 16 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })),
  route: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "19",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "3"
  })),
  swap: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M7 4v15M3.5 7.5 7 4l3.5 3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 20V5M13.5 16.5 17 20l3.5-3.5"
  })),
  user: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.5 21c.7-3.7 3.8-5.8 7.5-5.8s6.8 2.1 7.5 5.8"
  })),
  close: /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }),
  star: /*#__PURE__*/React.createElement("path", {
    d: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"
  }),
  arrow: /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }),
  'arrow-left': /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M11 18l-6-6 6-6"
  }),
  chevron: /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }),
  calendar: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3v4M16 3v4M3 10h18"
  })),
  briefcase: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "7",
    width: "18",
    height: "13",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"
  })),
  compass: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1z"
  })),
  help: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.3 9.2a2.9 2.9 0 0 1 5.6 1c0 2-2.9 2.2-2.9 3.8M12 17h.01"
  }))
};
function Icon({
  name,
  size,
  filled,
  className
}) {
  const px = size || 20;
  return /*#__PURE__*/React.createElement("svg", {
    className: 'ico' + (className ? ' ' + className : ''),
    width: px,
    height: px,
    viewBox: "0 0 24 24",
    fill: filled ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: filled ? 0 : 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, ICONS[name] || null);
}

/* логотип: синий жетон с белой меткой места (название «Поехали» сохраняем) */
function LogoMark({
  size
}) {
  const px = size || 30;
  return /*#__PURE__*/React.createElement("svg", {
    width: px,
    height: px,
    viewBox: "0 0 32 32",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "32",
    height: "32",
    rx: "9.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 25.5c4.8-4.7 7.5-8.1 7.5-11.3a7.5 7.5 0 1 0-15 0c0 3.2 2.7 6.6 7.5 11.3Z",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "13.6",
    r: "2.9",
    fill: "#ff7a00"
  }));
}

/* звёздный рейтинг отеля — SVG вместо символов */
function Stars({
  n
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "stars",
    "aria-label": 'Категория: ' + n + ' из 5'
  }, [1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement(Icon, {
    key: i,
    name: "star",
    size: 12,
    filled: i <= n,
    className: i <= n ? 'on' : ''
  })));
}

/* ------------------------------- реальные ссылки на покупку */
const CITY_INFO = {
  'Москва': {
    iata: 'MOW',
    lat: 55.7558,
    lon: 37.6173
  },
  'Санкт-Петербург': {
    iata: 'LED',
    lat: 59.9386,
    lon: 30.3141
  },
  'Нижний Новгород': {
    iata: 'GOJ',
    lat: 56.3269,
    lon: 44.0059
  },
  'Казань': {
    iata: 'KZN',
    lat: 55.7963,
    lon: 49.1088
  },
  'Ростов-на-Дону': {
    iata: 'ROV',
    lat: 47.2357,
    lon: 39.7015
  },
  'Воронеж': {
    iata: 'VOG',
    lat: 51.6720,
    lon: 39.1843
  },
  'Екатеринбург': {
    iata: 'SVX',
    lat: 56.8389,
    lon: 60.6057
  },
  'Уфа': {
    iata: 'UFA',
    lat: 54.7388,
    lon: 55.9721
  },
  'Челябинск': {
    iata: 'CEK',
    lat: 55.1644,
    lon: 61.4368
  },
  'Красноярск': {
    iata: 'KJA',
    lat: 56.0153,
    lon: 92.8932
  },
  'Новосибирск': {
    iata: 'OVB',
    lat: 55.0084,
    lon: 82.9357
  },
  'Краснодар': {
    iata: 'KRR',
    lat: 45.0355,
    lon: 38.9753
  },
  'Самара': {
    iata: 'KUF',
    lat: 53.1959,
    lon: 50.1002
  },
  'Владивосток': {
    iata: 'VVO',
    lat: 43.1155,
    lon: 131.8855
  }
};
const CITIES_IATA = Object.fromEntries(Object.entries(CITY_INFO).map(([name, info]) => [name, info.iata]));
const AIRLINES = {
  SU: 'Аэрофлот',
  S7: 'S7 Airlines',
  DP: 'Победа',
  FV: 'Россия',
  U6: 'Уральские авиалинии',
  TK: 'Turkish Airlines',
  RL: 'РусЛайн',
  N4: 'Nordwind',
  '5N': 'Smartavia',
  WZ: 'Red Wings',
  A4: 'Азимут',
  IO: 'ИрАэро'
};
const pad2 = n => String(n).padStart(2, '0');
const aviaUrl = (fromCity, toCode, dateISO, pax) => {
  const origin = CITIES_IATA[fromCity] || 'MOW';
  const dt = new Date(dateISO + 'T00:00:00');
  return 'https://www.aviasales.ru/search/' + origin + pad2(dt.getDate()) + pad2(dt.getMonth() + 1) + toCode + Math.max(1, pax || 1);
};
const TUTU_URL = 'https://www.tutu.ru/poezda/';
const bookingUrl = (query, checkin, checkout, adults) => 'https://www.booking.com/searchresults.ru.html?ss=' + encodeURIComponent(query) + '&checkin=' + checkin + '&checkout=' + checkout + '&group_adults=' + adults + '&no_rooms=1&selected_currency=RUB';
const cityFromCode = code => {
  const found = Object.keys(CITIES_IATA).find(c => CITIES_IATA[c] === code);
  return found || code;
};

/* --------------------------------------- геометрия и Яндекс.Карты */
const yaRouteUrl = (a, b) => 'https://yandex.ru/maps/?rtext=' + a.lat.toFixed(5) + ',' + a.lon.toFixed(5) + '~' + b.lat.toFixed(5) + ',' + b.lon.toFixed(5) + '&rtt=auto';
const distKm = (a, b) => {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.pow(Math.sin(dLon / 2), 2);
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
};

/* дуга большого круга для красивой линии маршрута на карте */
const toRad = v => v * Math.PI / 180;
const toDeg = v => v * 180 / Math.PI;
const arcPoints = (a, b, n) => {
  const steps = n || 64;
  const lat1 = toRad(a.lat),
    lon1 = toRad(a.lon),
    lat2 = toRad(b.lat),
    lon2 = toRad(b.lon);
  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2 - lat1) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)));
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
const flightTime = km => {
  const totalMin = Math.round(km / 800 * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return (h > 0 ? h + ' ч ' : '') + (m < 10 ? '0' + m : m) + ' мин';
};

/* демо-коэффициент цен (админ-панель), шаг до 10 ₽ */
const dprice = (v, k) => Math.round(Number(v) * (k || 1) / 10) * 10;

/* -------------------------------------------- фото из Википедии */
/* в кэше храним промис: одну и ту же статью могут запросить несколько карточек */
const WIKI_CACHE = {};
function useWikiPhoto(article) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    if (!WIKI_CACHE[article]) {
      WIKI_CACHE[article] = fetch('https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(article) + '?redirect=true').then(r => r.ok ? r.json() : Promise.reject(new Error('no photo'))).then(data => {
        return data.originalimage && data.originalimage.source || data.thumbnail && data.thumbnail.source || null;
      }).catch(() => null);
    }
    WIKI_CACHE[article].then(src => {
      if (alive) setUrl(src);
    });
    return () => {
      alive = false;
    };
  }, [article]);
  return url;
}

/* фон-обложка: фото из Википедии, а до загрузки — цветной градиент направления */
function Cover({
  article,
  className,
  overlay,
  gradient
}) {
  const url = useWikiPhoto(article);
  const cls = 'cover-img' + (url ? ' loaded' : ' fallback');
  const style = url ? {
    backgroundImage: 'url("' + url + '")'
  } : gradient ? {
    backgroundImage: grad({
      gradient
    })
  } : null;
  return /*#__PURE__*/React.createElement("div", {
    className: className + (url ? ' has-photo' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: style,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: 'cover-shade shade-' + (overlay || 'soft')
  }));
}

/* ------------------------------------- онлайн-цены Aviasales */
function useLiveFlights(d, origin, date, enabled, refresh) {
  const [state, setState] = useState({
    status: 'demo',
    offers: [],
    updatedAt: null,
    reason: ''
  });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const ctrl = new AbortController();
    const originCode = CITIES_IATA[origin] || 'MOW';
    setState(prev => ({
      ...prev,
      status: 'checking'
    }));
    fetch('/api/config', {
      signal: ctrl.signal
    }).then(r => r.ok ? r.json() : Promise.reject(new Error('Локальный сервер цен не запущен'))).then(cfg => {
      if (!cfg.livePrices) throw new Error('Не задан токен Travelpayouts');
      return fetch('/api/flights?origin=' + originCode + '&destination=' + d.iata + '&departure_at=' + date, {
        signal: ctrl.signal
      }).then(r => r.json());
    }).then(json => {
      if (cancelled) return;
      if (json && json.data && json.data.length) {
        setState({
          status: 'live',
          offers: json.data,
          updatedAt: new Date(),
          reason: ''
        });
      } else {
        setState({
          status: 'demo',
          offers: [],
          updatedAt: null,
          reason: json && json.error || 'На выбранную дату онлайн-цен нет'
        });
      }
    }).catch(err => {
      if (cancelled || err.name === 'AbortError') return;
      setState({
        status: 'demo',
        offers: [],
        updatedAt: null,
        reason: err.message || 'Онлайн-цены недоступны'
      });
    });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [d.id, d.iata, origin, date, enabled, refresh]);
  return state;
}

/* ------------------------------------------------------ шапка */
function Header({
  page,
  onHome,
  favCount,
  onFav,
  dark,
  onTheme,
  user,
  menuOpen,
  onMenuToggle,
  onAuth,
  onLogout,
  onRequests,
  onPanel,
  onPlanner,
  reqCount
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container nav-inner"
  }, /*#__PURE__*/React.createElement("button", {
    className: "brand",
    onClick: onHome,
    "aria-label": "Поехали — на главную"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement(LogoMark, {
    size: 32
  })), /*#__PURE__*/React.createElement("span", {
    className: "brand-name"
  }, "Поехали")), page === 'home' && /*#__PURE__*/React.createElement("nav", {
    className: "nav-links",
    "aria-label": "Разделы сайта"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById('destinations').scrollIntoView({
      behavior: 'smooth'
    })
  }, "Направления"), /*#__PURE__*/React.createElement("button", {
    onClick: onPlanner
  }, "Планировщик"), /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById('steps').scrollIntoView({
      behavior: 'smooth'
    })
  }, "Как это работает")), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions"
  }, page === 'dest' && /*#__PURE__*/React.createElement("button", {
    className: "nav-item nav-back",
    onClick: onHome
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-item-label"
  }, "Все направления")), /*#__PURE__*/React.createElement("button", {
    className: "nav-item",
    onClick: onFav,
    title: "Избранное"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 17,
    filled: favCount > 0
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-item-label"
  }, "Избранное"), favCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, favCount)), user ? /*#__PURE__*/React.createElement("div", {
    className: "user-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "user-chip",
    onClick: onMenuToggle,
    "aria-expanded": menuOpen,
    title: "Профиль"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'user-ava' + (user.role === 'admin' ? ' admin' : '')
  }, initials(user.name || 'Гость')), /*#__PURE__*/React.createElement("span", {
    className: "user-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "user-name"
  }, user.name || 'Гость'), /*#__PURE__*/React.createElement("span", {
    className: "user-role"
  }, user.role === 'admin' ? 'Администратор' : 'Гость'))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "user-menu",
    role: "menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "user-menu-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "user-name"
  }, user.name || 'Гость'), /*#__PURE__*/React.createElement("div", {
    className: "mini muted"
  }, user.role === 'admin' ? 'Роль: администратор' : 'Роль: гость')), /*#__PURE__*/React.createElement("button", {
    className: "item",
    onClick: onRequests,
    role: "menuitem"
  }, "Мои заявки ", reqCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, reqCount)), user.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    className: "item",
    onClick: onPanel,
    role: "menuitem"
  }, "Админ-панель"), /*#__PURE__*/React.createElement("button", {
    className: "item muted",
    onClick: onLogout,
    role: "menuitem"
  }, "Выйти из аккаунта"))) : /*#__PURE__*/React.createElement("button", {
    className: "nav-item",
    onClick: onAuth,
    "aria-label": "Профиль",
    title: "Профиль"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 17
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-item-label"
  }, "Профиль")), /*#__PURE__*/React.createElement("button", {
    className: 'theme-toggle' + (dark ? ' is-dark' : ''),
    onClick: onTheme,
    role: "switch",
    "aria-checked": dark,
    "aria-label": "Тёмная тема",
    title: dark ? 'Включить светлую тему' : 'Включить тёмную тему'
  }, /*#__PURE__*/React.createElement("span", {
    className: "tt-opt tt-sun"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sun",
    size: 13
  })), /*#__PURE__*/React.createElement("span", {
    className: "tt-opt tt-moon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 12
  })), /*#__PURE__*/React.createElement("span", {
    className: "tt-knob",
    "aria-hidden": "true"
  })))));
}

/* --------------------------------------------- карточка направления */
function DestCard({
  d,
  index,
  onOpen,
  k
}) {
  const f = minFlight(d);
  const t = minTrain(d);
  return /*#__PURE__*/React.createElement("article", {
    className: "dest-card",
    role: "button",
    tabIndex: 0,
    "aria-label": 'Открыть направление ' + d.name,
    style: {
      animationDelay: index * 55 + 'ms'
    },
    onClick: onOpen,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dest-media"
  }, /*#__PURE__*/React.createElement(Cover, {
    article: d.wiki,
    gradient: d.gradient,
    className: "cover-holder",
    overlay: "card"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dest-country"
  }, d.country)), /*#__PURE__*/React.createElement("div", {
    className: "dest-body"
  }, /*#__PURE__*/React.createElement("h3", null, d.name), /*#__PURE__*/React.createElement("p", null, d.tagline), /*#__PURE__*/React.createElement("div", {
    className: "dest-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dest-prices"
  }, /*#__PURE__*/React.createElement("div", null, "Самолёт: ", /*#__PURE__*/React.createElement("b", null, f ? '≈ от ' + rub(dprice(f, k)) : 'нет данных')), /*#__PURE__*/React.createElement("div", null, "Поезд: ", /*#__PURE__*/React.createElement("b", null, t ? '≈ от ' + rub(dprice(t, k)) : 'нет данных'))), /*#__PURE__*/React.createElement("span", {
    className: "dest-arrow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))));
}

/* табы героя — как у Авиасейлс, но ведут в реальные разделы сайта */
const HERO_TABS = [['tickets', 'Авиабилеты', 'plane'], ['dests', 'Направления', 'pin'], ['planner', 'Планировщик', 'route'], ['fav', 'Избранное', 'heart']];

/* -------------------------------------------------------- главная */
function Home({
  onOpen,
  onOpenSearch,
  onPlanner,
  onFav,
  searchOrigin,
  onSearchOrigin,
  searchDate,
  onSearchDate,
  searchPax,
  onSearchPax,
  k
}) {
  const [pick, setPick] = useState(DATA[0].id);
  const [heroTab, setHeroTab] = useState('tickets');
  const [tag, setTag] = useState('all');
  const [q, setQ] = useState('');

  /* самые доступные направления для белой карточки поверх синего героя */
  const cheap = useMemo(() => {
    return DATA.slice().sort((a, b) => (minFlight(a) || 1e9) - (minFlight(b) || 1e9)).slice(0, 4);
  }, []);
  const list = DATA.filter(d => {
    const byTag = tag === 'all' || d.tags.indexOf(tag) !== -1;
    const query = q.trim().toLowerCase();
    const byText = !query || d.name.toLowerCase().indexOf(query) !== -1 || d.country.toLowerCase().indexOf(query) !== -1;
    return byTag && byText;
  });
  const TAGS = [['all', 'Все направления'], ['sea', 'Море'], ['city', 'Города'], ['north', 'Север'], ['nature', 'Природа']];
  const goTab = id => {
    setHeroTab(id);
    if (id === 'planner') onPlanner();
    if (id === 'fav') onFav();
    if (id === 'dests') {
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-inner"
  }, /*#__PURE__*/React.createElement("h1", null, "Тут покупают дешёвые билеты и туры"), /*#__PURE__*/React.createElement("p", {
    className: "hero-lead"
  }, "Сравните перелёты, отели и туры — покупка на Aviasales, Tutu и Booking."), /*#__PURE__*/React.createElement("div", {
    className: "hero-tabs",
    role: "tablist",
    "aria-label": "Разделы"
  }, HERO_TABS.map(([id, label, ic]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    role: "tab",
    "aria-selected": heroTab === id,
    className: 'htab' + (heroTab === id ? ' active' : ''),
    onClick: () => goTab(id)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, label)))), /*#__PURE__*/React.createElement("div", {
    className: "hero-search"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hs-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hs-label"
  }, "Откуда"), /*#__PURE__*/React.createElement("select", {
    value: searchOrigin,
    onChange: e => onSearchOrigin(e.target.value),
    "aria-label": "Город вылета"
  }, Object.keys(CITY_INFO).map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("label", {
    className: "hs-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hs-label"
  }, "Куда"), /*#__PURE__*/React.createElement("select", {
    value: pick,
    onChange: e => setPick(e.target.value),
    "aria-label": "Направление"
  }, DATA.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.name)))), /*#__PURE__*/React.createElement("label", {
    className: "hs-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hs-label"
  }, "Когда"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: searchDate,
    min: todayPlus(0),
    onChange: e => onSearchDate(e.target.value),
    "aria-label": "Дата поездки"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hs-field hs-pax"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hs-label"
  }, "Пассажиры"), /*#__PURE__*/React.createElement("div", {
    className: "pax-stepper"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSearchPax(Math.max(1, searchPax - 1)),
    "aria-label": "Меньше пассажиров"
  }, "−"), /*#__PURE__*/React.createElement("span", null, searchPax), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSearchPax(Math.min(6, searchPax + 1)),
    "aria-label": "Больше пассажиров"
  }, "+"))), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => onOpenSearch(pick)
  }, "Найти билеты")), /*#__PURE__*/React.createElement("div", {
    className: "hero-subrow"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hero-link",
    onClick: onPlanner
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "route",
    size: 15
  }), " Составить сложный маршрут"), /*#__PURE__*/React.createElement("span", {
    className: "hero-note"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15
  }), " Покупка на Aviasales, Tutu и Booking — в новой вкладке"))))), /*#__PURE__*/React.createElement("section", {
    className: "hero-popular",
    "aria-label": "Популярные направления"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "popular-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "popular-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Популярные направления"), /*#__PURE__*/React.createElement("p", null, "Куда улететь выгоднее всего прямо сейчас")), /*#__PURE__*/React.createElement("button", {
    className: "popular-all",
    onClick: () => document.getElementById('destinations').scrollIntoView({
      behavior: 'smooth'
    })
  }, "Все направления ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "popular-grid"
  }, cheap.map(d => {
    const f = minFlight(d);
    return /*#__PURE__*/React.createElement("div", {
      className: "popular-item",
      key: d.id,
      role: "button",
      tabIndex: 0,
      "aria-label": 'Открыть направление ' + d.name,
      onClick: () => onOpenSearch(d.id),
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenSearch(d.id);
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "popular-media"
    }, /*#__PURE__*/React.createElement(Cover, {
      article: d.wiki,
      gradient: d.gradient,
      className: "cover-holder",
      overlay: "none"
    })), /*#__PURE__*/React.createElement("span", {
      className: "popular-info"
    }, /*#__PURE__*/React.createElement("span", {
      className: "popular-name"
    }, d.name), /*#__PURE__*/React.createElement("span", {
      className: "popular-country"
    }, d.country), /*#__PURE__*/React.createElement("span", {
      className: "popular-price"
    }, f ? 'от ' + rub(dprice(f, k)) : 'Цена по запросу')));
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "container section",
    id: "destinations"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Направления"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Выберите, куда поедем")), /*#__PURE__*/React.createElement("p", {
    className: "section-sub"
  }, "От Балтики до Байкала: маршруты, отели, туры и реальные ссылки на покупку билетов.")), /*#__PURE__*/React.createElement("div", {
    className: "filters"
  }, TAGS.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: 'chip' + (tag === id ? ' active' : ''),
    onClick: () => setTag(id)
  }, label)), /*#__PURE__*/React.createElement("div", {
    className: "field-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lens"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Поиск: город или страна",
    value: q,
    onChange: e => setQ(e.target.value),
    "aria-label": "Поиск направления"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid dest"
  }, list.map((d, i) => /*#__PURE__*/React.createElement(DestCard, {
    key: d.id,
    d: d,
    index: i,
    k: k,
    onOpen: () => onOpen(d.id)
  }))), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("b", null, "Ничего не нашли."), " Попробуйте другой фильтр или запрос.")), /*#__PURE__*/React.createElement("section", {
    className: "container section",
    id: "steps"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Как это работает"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Три шага до чемодана"))), /*#__PURE__*/React.createElement("div", {
    className: "steps"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step-num"
  }, "01"), /*#__PURE__*/React.createElement("h3", null, "Выбираете направление"), /*#__PURE__*/React.createElement("p", null, "Сравните, как добраться: самолёт, поезд, авто или паром — время, цена и полезные детали в одном месте.")), /*#__PURE__*/React.createElement("div", {
    className: "step-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step-num"
  }, "02"), /*#__PURE__*/React.createElement("h3", null, "Смотрите отели и туры"), /*#__PURE__*/React.createElement("p", null, "Сортируйте отели по рейтингу и цене, отмечайте сердечком понравившиеся и изучайте предложения операторов.")), /*#__PURE__*/React.createElement("div", {
    className: "step-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step-num"
  }, "03"), /*#__PURE__*/React.createElement("h3", null, "Покупаете у партнёров"), /*#__PURE__*/React.createElement("p", null, "Кнопки ведут на Aviasales, Tutu, Booking и сайты туроператоров — дата, маршрут и пассажиры уже подставлены.")))));
}

/* ------------------------------------------------ как добраться */
function RoutesTab({
  d,
  onTab
}) {
  const routes = [...d.routes].sort((a, b) => (b.rec ? 1 : 0) - (a.rec ? 1 : 0));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "tab-hint"
  }, "Способы добраться до ", d.name, ": время в пути, ориентиры по ценам и важные детали."), /*#__PURE__*/React.createElement("div", {
    className: "routes"
  }, routes.map((r, i) => /*#__PURE__*/React.createElement("article", {
    key: i,
    className: 'route-card' + (r.rec ? ' rec' : ''),
    style: {
      animationDelay: i * 60 + 'ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "route-ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ICONS[r.icon] ? r.icon : 'train',
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "route-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "route-head"
  }, /*#__PURE__*/React.createElement("h3", null, r.title), r.rec && /*#__PURE__*/React.createElement("span", {
    className: "badge-rec"
  }, "Оптимально")), /*#__PURE__*/React.createElement("div", {
    className: "route-geo"
  }, /*#__PURE__*/React.createElement("span", null, r.from), /*#__PURE__*/React.createElement("span", {
    className: "dots"
  }), /*#__PURE__*/React.createElement("span", {
    className: "to-name"
  }, d.name)), /*#__PURE__*/React.createElement("div", {
    className: "chips"
  }, /*#__PURE__*/React.createElement("span", null, "В пути: ", r.dur), /*#__PURE__*/React.createElement("span", null, "Расстояние: ", r.dist), /*#__PURE__*/React.createElement("span", null, "Цена: ", r.price)), /*#__PURE__*/React.createElement("p", {
    className: "route-note"
  }, r.note))))), /*#__PURE__*/React.createElement("div", {
    className: "panel cta-panel"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Готовы ехать?"), /*#__PURE__*/React.createElement("p", {
    className: "muted mini"
  }, "Подберите билеты на самолёт или поезд — покупка на реальных сервисах.")), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => onTab('tickets')
  }, "Смотреть билеты ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }))));
}

/* -------------------------------------------------------- билеты */
function LiveTicket({
  offer,
  d,
  date,
  pax,
  notify,
  onRequest
}) {
  const depDate = new Date(offer.departure_at);
  const arrDate = offer.duration ? new Date(depDate.getTime() + offer.duration * 60000) : null;
  const url = offer.link ? offer.link.indexOf('http') === 0 ? offer.link : 'https://www.aviasales.ru' + offer.link : aviaUrl(cityFromCode(offer.origin), d.iata, date, pax);
  const airline = AIRLINES[offer.airline] || 'Авиакомпания ' + offer.airline;
  return /*#__PURE__*/React.createElement("div", {
    className: "ticket-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "airline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "airline-logo airline-logo-live"
  }, offer.airline), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "airline-name"
  }, airline), /*#__PURE__*/React.createElement("div", {
    className: "airline-sub"
  }, offer.flight_number ? 'Рейс ' + offer.flight_number : 'Рейс', " · из ", cityFromCode(offer.origin)))), /*#__PURE__*/React.createElement("div", {
    className: "ticket-mid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "times-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, isNaN(depDate) ? '—' : timeRu(depDate)), /*#__PURE__*/React.createElement("div", {
    className: "p"
  }, cityFromCode(offer.origin))), /*#__PURE__*/React.createElement("div", {
    className: "ticket-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mid-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plane",
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    className: "time-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, arrDate ? timeRu(arrDate) : '—'), /*#__PURE__*/React.createElement("div", {
    className: "p"
  }, d.name))), /*#__PURE__*/React.createElement("div", {
    className: "class-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "class-chip static"
  }, pluralTransfer(offer.transfers || 0)), /*#__PURE__*/React.createElement("span", {
    className: "class-chip static"
  }, "Цена Aviasales"))), /*#__PURE__*/React.createElement("div", {
    className: "ticket-buy"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "price-big"
  }, rub(offer.price * pax)), /*#__PURE__*/React.createElement("div", {
    className: "price-note"
  }, pax > 1 ? 'за ' + pax + ' ' + pluralPax(pax) : 'за пассажира')), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-sm",
    href: url,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify('Открываем Aviasales — завершите покупку на сайте авиакомпании.');
      if (onRequest) onRequest('Aviasales (онлайн)', cityFromCode(offer.origin) + ' → ' + d.name + ', ' + dateRu(date) + ', ' + pax + ' ' + pluralPax(pax));
    }
  }, "Купить")));
}
function TicketsTab({
  d,
  notify,
  k,
  onRequest,
  initialDate,
  initialPax,
  initialOrigin
}) {
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
  const directFlights = flightsAll.filter(f => f.from === origin);
  const flights = directFlights.length ? directFlights : flightsAll;
  const directTrains = trainsAll.filter(t => t.from === origin);
  const trains = directTrains.length ? directTrains : trainsAll;
  const flightOptions = f => {
    const arr = [{
      key: 'econ',
      label: 'Эконом',
      price: dprice(f.econ, k)
    }];
    if (f.biz) arr.push({
      key: 'biz',
      label: 'Бизнес',
      price: dprice(f.biz, k)
    });
    return arr;
  };
  const trainOptions = tr => Object.keys(tr.classes).map(key => ({
    key,
    label: key,
    price: dprice(tr.classes[key], k)
  }));
  const choose = (key, options) => {
    const saved = choices[key];
    return options.find(o => o.key === saved) || options[0];
  };
  const setChoice = (key, val) => setChoices(prev => ({
    ...prev,
    [key]: val
  }));
  const paxText = pax + ' ' + pluralPax(pax);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "seg-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg",
    role: "tablist",
    "aria-label": "Вид транспорта"
  }, /*#__PURE__*/React.createElement("button", {
    className: mode === 'plane' ? 'active' : '',
    onClick: () => setMode('plane')
  }, "Авиабилеты"), /*#__PURE__*/React.createElement("button", {
    className: mode === 'train' ? 'active' : '',
    onClick: () => setMode('train')
  }, "Поезда")), /*#__PURE__*/React.createElement("p", {
    className: "search-summary"
  }, /*#__PURE__*/React.createElement("b", null, origin), " → ", /*#__PURE__*/React.createElement("b", null, d.name), " · ", dateRu(date), " · ", paxText)), /*#__PURE__*/React.createElement("div", {
    className: "search-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "origin"
  }, "Откуда"), /*#__PURE__*/React.createElement("select", {
    id: "origin",
    value: origin,
    onChange: e => setOrigin(e.target.value)
  }, Object.keys(CITY_INFO).map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "date"
  }, "Дата поездки"), /*#__PURE__*/React.createElement("input", {
    id: "date",
    type: "date",
    value: date,
    min: todayPlus(0),
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Пассажиры"), /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPax(p => Math.max(1, p - 1)),
    "aria-label": "Меньше пассажиров"
  }, "−"), /*#__PURE__*/React.createElement("span", null, pax), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPax(p => Math.min(6, p + 1)),
    "aria-label": "Больше пассажиров"
  }, "+"))), /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: mode === 'plane' ? aviaUrl(origin, d.iata, date, pax) : TUTU_URL,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify(mode === 'plane' ? 'Открываем Aviasales: актуальные цены и оплата на сайте партнёра.' : 'Открываем Tutu.ru: выберите города и дату — они уже у вас перед глазами.');
      if (onRequest) onRequest(mode === 'plane' ? 'Aviasales' : 'Tutu.ru', origin + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText);
    }
  }, mode === 'plane' ? 'Найти на Aviasales' : 'Найти на Tutu')), /*#__PURE__*/React.createElement("div", {
    className: 'price-source ' + (liveReady && mode === 'plane' ? 'live' : 'demo')
  }, mode === 'plane' && live.status === 'checking' && /*#__PURE__*/React.createElement("span", null, "Проверяем онлайн-цены Aviasales…"), mode === 'plane' && liveReady && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "source-dot"
  }), "Онлайн-цены Aviasales · обновлено ", timeRu(live.updatedAt)), mode === 'plane' && !liveReady && live.status !== 'checking' && /*#__PURE__*/React.createElement("span", null, "≈ Демо-цены. Точные цены и покупка — на Aviasales."), mode === 'train' && /*#__PURE__*/React.createElement("span", null, "≈ Демо-цены. Точные цены и покупка — на Tutu.ru."), mode === 'plane' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-refresh",
    onClick: () => setRefresh(v => v + 1)
  }, "Обновить")), mode === 'plane' && !liveReady && /*#__PURE__*/React.createElement("details", {
    className: "hint-box"
  }, /*#__PURE__*/React.createElement("summary", null, "Как включить реальные цены из Aviasales"), /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "Получите бесплатный API-токен в партнёрской программе Travelpayouts (Aviasales)."), /*#__PURE__*/React.createElement("li", null, "Запустите проект командой ", /*#__PURE__*/React.createElement("code", null, "node server.cjs"), ", указав токен в переменной окружения ", /*#__PURE__*/React.createElement("code", null, "TRAVELPAYOUTS_TOKEN"), " (или в файле ", /*#__PURE__*/React.createElement("code", null, "config.local.json"), ")."), /*#__PURE__*/React.createElement("li", null, "Обновите страницу: цены на самолёты подтянутся из Aviasales и будут обновляться при смене даты, города и количества пассажиров.")), /*#__PURE__*/React.createElement("p", {
    className: "mini muted"
  }, "Без токена сайт показывает ориентировочные цены, но кнопки покупки всё равно ведут на настоящие Aviasales и Tutu. Причина: ", live.reason || 'онлайн-режим не настроен', ".")), mode === 'plane' && !liveReady && !directFlights.length && /*#__PURE__*/React.createElement("p", {
    className: "tab-hint",
    style: {
      marginTop: '16px'
    }
  }, "Прямых рейсов из «", origin, "» нет — показываем перелёты из других городов."), mode === 'train' && !directTrains.length && trains.length > 0 && /*#__PURE__*/React.createElement("p", {
    className: "tab-hint",
    style: {
      marginTop: '16px'
    }
  }, "Прямых поездов из «", origin, "» нет — показываем варианты из других городов."), /*#__PURE__*/React.createElement("div", {
    className: "tickets",
    style: {
      marginTop: '16px'
    }
  }, mode === 'plane' && liveReady && live.offers.map((o, i) => /*#__PURE__*/React.createElement(LiveTicket, {
    key: (o.flight_number || '') + o.departure_at + i,
    offer: o,
    d: d,
    date: date,
    pax: pax,
    notify: notify,
    onRequest: onRequest
  })), mode === 'plane' && !liveReady && flights.map((f, i) => {
    const key = 'plane|' + f.num + '|' + f.from;
    const options = flightOptions(f);
    const chosen = choose(key, options);
    const arrParts = f.arr.split(' ');
    const link = aviaUrl(f.from, d.iata, date, pax);
    return /*#__PURE__*/React.createElement("div", {
      className: "ticket-card",
      key: key,
      style: {
        animationDelay: i * 45 + 'ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "airline"
    }, /*#__PURE__*/React.createElement("div", {
      className: "airline-logo"
    }, initials(f.airline)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "airline-name"
    }, f.airline), /*#__PURE__*/React.createElement("div", {
      className: "airline-sub"
    }, f.num, " · из ", f.from))), /*#__PURE__*/React.createElement("div", {
      className: "ticket-mid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "times-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "time-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, f.dep), /*#__PURE__*/React.createElement("div", {
      className: "p"
    }, f.from)), /*#__PURE__*/React.createElement("div", {
      className: "ticket-line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mid-icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plane",
      size: 13
    }))), /*#__PURE__*/React.createElement("div", {
      className: "time-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, arrParts[0], " ", /*#__PURE__*/React.createElement("span", {
      className: "arr-day"
    }, arrParts[1] || '')), /*#__PURE__*/React.createElement("div", {
      className: "p"
    }, d.name))), /*#__PURE__*/React.createElement("div", {
      className: "class-row"
    }, options.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.key,
      className: 'class-chip' + (chosen.key === o.key ? ' active' : ''),
      onClick: () => setChoice(key, o.key)
    }, o.label, " · ≈ ", rub(o.price))))), /*#__PURE__*/React.createElement("div", {
      className: "ticket-buy"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "price-big"
    }, "≈ ", rub(chosen.price * pax)), /*#__PURE__*/React.createElement("div", {
      className: "price-note"
    }, pax > 1 ? 'за ' + paxText : 'за пассажира')), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm",
      href: link,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: () => {
        notify('Открываем Aviasales: ' + f.from + ' → ' + d.name + ', ' + paxText + '.');
        if (onRequest) onRequest('Aviasales', f.from + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText);
      }
    }, "Найти на Aviasales")));
  }), mode === 'train' && trains.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("b", null, "Прямых поездов в ", d.name, " нет."), /*#__PURE__*/React.createElement("br", null), "Самый быстрый способ — самолёт: переключитесь на авиабилеты.", /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '18px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMode('plane')
  }, "Показать авиабилеты"))), mode === 'train' && trains.map((tr, i) => {
    const key = 'train|' + tr.num + '|' + tr.from;
    const options = trainOptions(tr);
    const chosen = choose(key, options);
    const arrParts = tr.arr.split(' ');
    return /*#__PURE__*/React.createElement("div", {
      className: "ticket-card",
      key: key,
      style: {
        animationDelay: i * 45 + 'ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "airline"
    }, /*#__PURE__*/React.createElement("div", {
      className: "airline-logo train-logo"
    }, "РЖД"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "airline-name"
    }, tr.num), /*#__PURE__*/React.createElement("div", {
      className: "airline-sub"
    }, "из ", tr.from))), /*#__PURE__*/React.createElement("div", {
      className: "ticket-mid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "times-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "time-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, tr.dep), /*#__PURE__*/React.createElement("div", {
      className: "p"
    }, tr.from)), /*#__PURE__*/React.createElement("div", {
      className: "ticket-line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mid-icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "train",
      size: 13
    }))), /*#__PURE__*/React.createElement("div", {
      className: "time-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "t"
    }, arrParts[0], " ", /*#__PURE__*/React.createElement("span", {
      className: "arr-day"
    }, arrParts[1] || '')), /*#__PURE__*/React.createElement("div", {
      className: "p"
    }, d.name))), /*#__PURE__*/React.createElement("div", {
      className: "class-row"
    }, options.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.key,
      className: 'class-chip' + (chosen.key === o.key ? ' active' : ''),
      onClick: () => setChoice(key, o.key)
    }, o.label, " · ≈ ", rub(o.price))))), /*#__PURE__*/React.createElement("div", {
      className: "ticket-buy"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "price-big"
    }, "≈ ", rub(chosen.price * pax)), /*#__PURE__*/React.createElement("div", {
      className: "price-note"
    }, pax > 1 ? 'за ' + paxText : 'за пассажира')), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm",
      href: TUTU_URL,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: () => {
        notify('Открываем Tutu.ru: ' + tr.from + ' → ' + d.name + ', ' + dateRu(date) + '.');
        if (onRequest) onRequest('Tutu.ru', tr.from + ' → ' + d.name + ', ' + dateRu(date) + ', ' + paxText);
      }
    }, "Купить на Tutu")));
  })), /*#__PURE__*/React.createElement("p", {
    className: "tab-hint",
    style: {
      marginTop: '18px'
    }
  }, "Оплата и выпуск билетов происходят на сайте партнёра (Aviasales или Tutu.ru). Демо-цены даны для ознакомления и могут отличаться от актуальных. Нажатия кнопок сохраняются в «Мои заявки» — локально, в этом браузере."));
}

/* ---------------------------------------------------------- отели */
function HotelsTab({
  d,
  favorites,
  onFav,
  notify,
  k,
  onRequest
}) {
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
  const onCheckin = value => {
    setCheckin(value);
    if (value >= checkout) setCheckout(plusDay(value));
  };
  const commonUrl = bookingUrl(d.hotelQuery, checkin, checkout, guests);
  const guestsText = guests + ' ' + (guests === 1 ? 'гость' : 'гостей');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "search-form hotel-search"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "checkin"
  }, "Заезд"), /*#__PURE__*/React.createElement("input", {
    id: "checkin",
    type: "date",
    value: checkin,
    min: todayPlus(0),
    onChange: e => onCheckin(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "checkout"
  }, "Выезд"), /*#__PURE__*/React.createElement("input", {
    id: "checkout",
    type: "date",
    value: checkout,
    min: plusDay(checkin),
    onChange: e => setCheckout(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Гости"), /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setGuests(g => Math.max(1, g - 1)),
    "aria-label": "Меньше гостей"
  }, "−"), /*#__PURE__*/React.createElement("span", null, guests), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setGuests(g => Math.min(8, g + 1)),
    "aria-label": "Больше гостей"
  }, "+"))), /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: commonUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify('Открываем Booking.com: ' + d.name + ', ' + guestsText + '.');
      if (onRequest) onRequest('Booking.com', d.name + ', ' + checkin + ' — ' + checkout + ', ' + guestsText);
    }
  }, "Цены на Booking")), /*#__PURE__*/React.createElement("p", {
    className: "tab-hint",
    style: {
      marginTop: '16px'
    }
  }, "Цены в карточках ориентировочные (за ночь). Кнопка «Найти на Booking» открывает реальный поиск с датами и гостями — актуальные цены и оплата там."), /*#__PURE__*/React.createElement("div", {
    className: "sortbar",
    style: {
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "Сортировать:"), /*#__PURE__*/React.createElement("select", {
    className: "select-mini",
    value: sort,
    onChange: e => setSort(e.target.value),
    "aria-label": "Сортировка отелей"
  }, /*#__PURE__*/React.createElement("option", {
    value: "rating"
  }, "По рейтингу"), /*#__PURE__*/React.createElement("option", {
    value: "cheap"
  }, "Сначала дешевле"), /*#__PURE__*/React.createElement("option", {
    value: "rich"
  }, "Сначала дороже"))), /*#__PURE__*/React.createElement("div", {
    className: "hotel-grid"
  }, sorted.map((h, i) => {
    const key = d.id + '::' + h.name;
    const fav = !!favorites[key];
    const url = bookingUrl(h.name + ', ' + d.hotelQuery, checkin, checkout, guests);
    return /*#__PURE__*/React.createElement("article", {
      className: "hotel-card",
      key: key,
      style: {
        animationDelay: i * 55 + 'ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hotel-media"
    }, /*#__PURE__*/React.createElement(Cover, {
      article: d.wiki,
      gradient: d.gradient,
      className: "cover-holder",
      overlay: "card"
    }), /*#__PURE__*/React.createElement("button", {
      className: 'heart' + (fav ? ' active' : ''),
      onClick: () => onFav(d, h),
      "aria-label": fav ? 'Убрать из избранного' : 'Добавить в избранное',
      title: fav ? 'Убрать из избранного' : 'В избранное'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "heart",
      size: 16,
      filled: fav
    }))), /*#__PURE__*/React.createElement("div", {
      className: "hotel-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hotel-top"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "hotel-name"
    }, h.name), /*#__PURE__*/React.createElement(Stars, {
      n: h.stars
    })), /*#__PURE__*/React.createElement("span", {
      className: "rating-pill"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 12,
      filled: true
    }), " ", h.rating.toFixed(1))), /*#__PURE__*/React.createElement("p", {
      className: "hotel-district"
    }, h.district), /*#__PURE__*/React.createElement("div", {
      className: "features"
    }, h.features.map((x, idx) => /*#__PURE__*/React.createElement("span", {
      key: idx
    }, x))), /*#__PURE__*/React.createElement("div", {
      className: "hotel-foot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hotel-price"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sum"
    }, "≈ ", rub(dprice(h.price, k))), /*#__PURE__*/React.createElement("span", {
      className: "per"
    }, "за ночь, ориентир")), /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm",
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: () => {
        notify('Открываем Booking.com — ищем «' + h.name + '».');
        if (onRequest) onRequest('Booking.com', h.name + ', ' + checkin + ' — ' + checkout + ', ' + guestsText);
      }
    }, "Найти на Booking"))));
  })), /*#__PURE__*/React.createElement("p", {
    className: "tab-hint",
    style: {
      marginTop: '18px'
    }
  }, "Отели из подборки могут быть недоступны по названию — Booking покажет похожие варианты с реальными ценами."));
}

/* -------------------------------------------------- тур агентства */
function AgenciesTab({
  d,
  notify,
  k,
  onRequest
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "tab-hint"
  }, "Реальные туроператоры: кнопка ведёт на их сайт, где можно подобрать и купить тур. Телефоны и рейтинги здесь демонстрационные."), /*#__PURE__*/React.createElement("div", {
    className: "agency-grid"
  }, d.agencies.map((a, i) => /*#__PURE__*/React.createElement("article", {
    className: "agency-card",
    key: a.name + i,
    style: {
      animationDelay: i * 70 + 'ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "agency-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "agency-logo"
  }, initials(a.name)), /*#__PURE__*/React.createElement("span", {
    className: "rating-pill"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 12,
    filled: true
  }), " ", a.rating.toFixed(1))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "agency-name"
  }, a.name), /*#__PURE__*/React.createElement("p", {
    className: "agency-spec"
  }, a.spec)), /*#__PURE__*/React.createElement("div", {
    className: "agency-price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "туры от"), /*#__PURE__*/React.createElement("span", {
    className: "sum"
  }, "≈ ", rub(dprice(a.toursFrom, k)))), /*#__PURE__*/React.createElement("div", {
    className: "agency-actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: a.site,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify('Открываем реальный сайт «' + a.name + '» — покупка тура там.');
      if (onRequest) onRequest(a.name, d.name + ', туры от ' + rub(dprice(a.toursFrom, k)));
    }
  }, "Купить тур"), /*#__PURE__*/React.createElement("a", {
    className: "btn-ghost",
    href: 'tel:' + a.phone.replace(/[^+\d]/g, ''),
    onClick: () => notify('Демо-телефон: ' + a.phone + '. Настоящие контакты — на сайте оператора.')
  }, "Телефон (демо)")), /*#__PURE__*/React.createElement("p", {
    className: "mini muted agency-site"
  }, a.site.replace(/^https?:\/\//, ''))))));
}

/* --------------------------------------------- карта маршрута */
/* обычные тайлы OpenStreetMap: не требуют ключа и не показывают водяные знаки */
const TILE = {
  light: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
};
const TILE_ATTR = '&copy; OpenStreetMap contributors';

/* переиспользуемая карта с линией маршрута и красивыми точками */
function RouteMap({
  a,
  b,
  dark,
  className,
  title,
  summary
}) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tileRef = useRef(null);
  const hasMap = typeof window.L !== 'undefined';
  useEffect(() => {
    if (!window.L || !boxRef.current || mapRef.current) return undefined;
    const map = window.L.map(boxRef.current, {
      zoomControl: true,
      attributionControl: true
    });
    mapRef.current = map;
    layerRef.current = window.L.layerGroup().addTo(map);
    tileRef.current = window.L.tileLayer(dark ? TILE.dark : TILE.light, {
      maxZoom: 18,
      attribution: TILE_ATTR
    }).addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(dark ? TILE.dark : TILE.light, {
      maxZoom: 18,
      attribution: TILE_ATTR
    }).addTo(map);
  }, [dark]);
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !layerRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();
    const pts = arcPoints(a, b);
    const c1 = dark ? '#7da2ff' : '#1d4ed8';
    const c2 = dark ? '#4fd1c5' : '#0f766e';
    L.polyline(pts, {
      color: c1,
      weight: 9,
      opacity: 0.16,
      lineCap: 'round'
    }).addTo(layer);
    L.polyline(pts, {
      color: c1,
      weight: 3,
      opacity: 0.95,
      lineCap: 'round'
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
        html: '<div class="map-label"><span class="dot" style="background:' + color + '"></span>' + text + '</div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      keyboard: false,
      interactive: false
    }).addTo(layer);
    halo([a.lat, a.lon], c1);
    halo([b.lat, b.lon], c2);
    pin([a.lat, a.lon], title ? title[0] : a.name || a.iata || 'Откуда', c1);
    pin([b.lat, b.lon], title ? title[1] : b.name || 'Куда', c2);
    map.fitBounds(L.latLngBounds([[a.lat, a.lon], [b.lat, b.lon]]).pad(0.42));
  }, [a, b, dark, title]);
  return /*#__PURE__*/React.createElement("div", {
    className: 'map-wrap ' + (className || '')
  }, !hasMap && /*#__PURE__*/React.createElement("div", {
    className: "hint-box",
    style: {
      display: 'block',
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0'
    }
  }, "Карта недоступна: библиотека не загрузилась (проверьте интернет). Расстояние и ссылки работают без неё.")), /*#__PURE__*/React.createElement("div", {
    className: 'map-box' + (hasMap ? '' : ' map-box-empty') + (dark ? ' map-box-dark' : ''),
    ref: boxRef,
    role: "img",
    "aria-label": "Карта маршрута"
  }), summary && /*#__PURE__*/React.createElement("div", {
    className: "map-summary"
  }, summary), /*#__PURE__*/React.createElement("span", {
    className: "map-attribution"
  }, "© OpenStreetMap contributors"));
}
function MapTab({
  d,
  notify,
  dark,
  onRequest
}) {
  const [origin, setOrigin] = useState('Москва');
  const o = {
    ...(CITY_INFO[origin] || CITY_INFO['Москва']),
    name: origin
  };
  const dest = {
    lat: d.lat,
    lon: d.lon,
    name: d.name
  };
  const km = distKm(o, dest);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "tab-hint"
  }, "Маршрут «", origin, " → ", d.name, "». Расстояние по прямой — примерно ", km.toLocaleString('ru-RU'), " км (", flightTime(km), " на самолёте); фактический путь по дорогам и рейсам обычно длиннее."), /*#__PURE__*/React.createElement("div", {
    className: "search-form map-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "map-origin"
  }, "Откуда"), /*#__PURE__*/React.createElement("select", {
    id: "map-origin",
    value: origin,
    onChange: e => setOrigin(e.target.value)
  }, Object.keys(CITY_INFO).map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Куда"), /*#__PURE__*/React.createElement("div", {
    className: "map-dest-fixed"
  }, d.name, ", ", d.country)), /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: yaRouteUrl(o, dest),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify('Открываем Яндекс.Карты — реальные маршруты, время и пробки.');
      if (onRequest) onRequest('Яндекс Карты', origin + ' → ' + d.name);
    }
  }, "Дорога в Яндекс.Картах")), /*#__PURE__*/React.createElement(RouteMap, {
    a: o,
    b: dest,
    dark: dark,
    showLabels: true,
    title: [origin, d.name],
    summary: origin + ' → ' + d.name + ' · ≈' + km.toLocaleString('ru-RU') + ' км · ' + flightTime(km)
  }));
}

/* -------------------------------------------------- о направлении */
function AboutTab({
  d
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "about"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, "Почему ", d.name, "?"), /*#__PURE__*/React.createElement("p", {
    className: "about-desc"
  }, d.description), /*#__PURE__*/React.createElement("div", {
    className: "attr-grid"
  }, d.attractions.map(a => /*#__PURE__*/React.createElement("div", {
    className: "attr-card",
    key: a.name
  }, a.name)))), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h3", null, "Полезно знать"), /*#__PURE__*/React.createElement("div", {
    className: "stat-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Когда ехать"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, d.stats.bestTime)), /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Температура"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, d.stats.temp))), /*#__PURE__*/React.createElement("div", {
    className: "stat-box",
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Сезон"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, d.stats.season)), /*#__PURE__*/React.createElement("ul", {
    className: "tips"
  }, d.tips.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, t)))));
}

/* -------------------------------------------- страница направления */
function Destination({
  d,
  tab,
  onTab,
  favorites,
  onFav,
  notify,
  k,
  dark,
  onRequest,
  initialOrigin,
  initialDate,
  initialPax
}) {
  const tabs = [['route', 'Как добраться'], ['tickets', 'Билеты'], ['hotels', 'Отели'], ['tours', 'Турфирмы'], ['map', 'Карта маршрута'], ['about', 'О направлении']];
  const f = minFlight(d);
  const t = minTrain(d);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "dest-hero"
  }, /*#__PURE__*/React.createElement(Cover, {
    article: d.wiki,
    gradient: d.gradient,
    className: "cover-holder",
    overlay: "hero"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container dest-hero-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, d.country, d.region ? ' · ' + d.region : '')), /*#__PURE__*/React.createElement("h1", {
    className: "dest-title"
  }, d.name), /*#__PURE__*/React.createElement("p", {
    className: "dest-tagline"
  }, d.tagline), /*#__PURE__*/React.createElement("div", {
    className: "hero-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "Лучший сезон: ", d.stats.bestTime), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "Температура: ", d.stats.temp), f && /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "Самолёт — от ", /*#__PURE__*/React.createElement("strong", null, rub(dprice(f, k)))), t && /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "Поезд — от ", /*#__PURE__*/React.createElement("strong", null, rub(dprice(t, k))))))), /*#__PURE__*/React.createElement("div", {
    className: "tabs-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs",
    role: "tablist"
  }, tabs.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    role: "tab",
    "aria-selected": tab === id,
    className: 'tab' + (tab === id ? ' active' : ''),
    onClick: () => onTab(id)
  }, label))))), /*#__PURE__*/React.createElement("div", {
    className: "container content-area",
    key: tab
  }, tab === 'route' && /*#__PURE__*/React.createElement(RoutesTab, {
    d: d,
    onTab: onTab
  }), tab === 'tickets' && /*#__PURE__*/React.createElement(TicketsTab, {
    d: d,
    notify: notify,
    k: k,
    onRequest: onRequest,
    initialOrigin: initialOrigin,
    initialDate: initialDate,
    initialPax: initialPax
  }), tab === 'hotels' && /*#__PURE__*/React.createElement(HotelsTab, {
    d: d,
    favorites: favorites,
    onFav: onFav,
    notify: notify,
    k: k,
    onRequest: onRequest
  }), tab === 'tours' && /*#__PURE__*/React.createElement(AgenciesTab, {
    d: d,
    notify: notify,
    k: k,
    onRequest: onRequest
  }), tab === 'map' && /*#__PURE__*/React.createElement(MapTab, {
    d: d,
    notify: notify,
    dark: dark,
    onRequest: onRequest
  }), tab === 'about' && /*#__PURE__*/React.createElement(AboutTab, {
    d: d
  })));
}

/* ---------------------------------------------------- избранное */
function FavModal({
  favs,
  onClose,
  onRemove,
  onClear
}) {
  const list = Object.values(favs);
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Избранные отели"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("h3", null, "Избранные отели"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn close",
    onClick: onClose,
    "aria-label": "Закрыть"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fav-list"
  }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      border: 0,
      padding: '26px 12px'
    }
  }, "Пока пусто. Отмечайте отели сердечком — они появятся здесь."), list.map(item => /*#__PURE__*/React.createElement("div", {
    className: "fav-row",
    key: item.key
  }, /*#__PURE__*/React.createElement("span", {
    className: "fav-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bed",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "fav-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fav-name"
  }, item.name), /*#__PURE__*/React.createElement("div", {
    className: "fav-sub"
  }, item.destName, " · ≈ ", rub(item.price), " за ночь")), /*#__PURE__*/React.createElement("button", {
    className: "x",
    onClick: () => onRemove(item.key),
    "aria-label": "Удалить из избранного"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: onClear
  }, "Очистить"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
    style: {
      flex: 1
    }
  }, "Готово"))));
}

/* --------------------------------------------------------- подвал */
function Footer({
  onOpen
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand foot-logo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement(LogoMark, {
    size: 28
  })), /*#__PURE__*/React.createElement("span", {
    className: "brand-name"
  }, "Поехали")), /*#__PURE__*/React.createElement("p", null, "Планировщик путешествий: как добраться, где остановиться и у кого купить тур — в одном месте.")), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Направления"), DATA.slice(0, 4).map(d => /*#__PURE__*/React.createElement("button", {
    key: d.id,
    onClick: () => onOpen(d.id)
  }, d.name))), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Партнёры"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.aviasales.ru",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Aviasales — авиабилеты"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.tutu.ru/poezda/",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Tutu.ru — поезда"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.booking.com",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Booking.com — отели"), /*#__PURE__*/React.createElement("a", {
    href: "https://yandex.ru/maps/",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Яндекс Карты — маршруты"), /*#__PURE__*/React.createElement("a", {
    href: "https://level.travel",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Level.Travel — туры"))), /*#__PURE__*/React.createElement("div", {
    className: "foot-bottom"
  }, /*#__PURE__*/React.createElement("span", null, "© 2026 «Поехали» — учебный проект. Демо-цены и контакты не являются офертой; покупка — на сайтах партнёров."), /*#__PURE__*/React.createElement("span", null, "Сделано на HTML, CSS и React"))));
}

/* --------------------------------------------------------- тост */
function Toast({
  msg
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: "toast-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13
  })), msg);
}

/* ------------------------------------------------------ вход */
const ADMIN_CREDENTIALS = {
  login: 'admin',
  password: 'admin'
};
function AuthModal({
  onClose,
  onGuest,
  onAdmin
}) {
  const nameRef = useRef(null);
  const loginRef = useRef(null);
  const passRef = useRef(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Вход в аккаунт"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal auth-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("h3", null, "Вход в аккаунт"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn close",
    onClick: onClose,
    "aria-label": "Закрыть"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "auth-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth-role-badge guest"
  }, "Гость"), /*#__PURE__*/React.createElement("p", {
    className: "auth-text"
  }, "Планируйте поездки, сохраняйте отели в избранное и оставляйте заявки на покупку."), /*#__PURE__*/React.createElement("label", {
    className: "auth-label",
    htmlFor: "gname"
  }, "Как вас называть (необязательно)"), /*#__PURE__*/React.createElement("input", {
    id: "gname",
    ref: nameRef,
    type: "text",
    placeholder: "Например, Анна",
    autoComplete: "off"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => onGuest(nameRef.current.value)
  }, "Войти как гость")), /*#__PURE__*/React.createElement("div", {
    className: "auth-card admin"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth-role-badge"
  }, "Администратор"), /*#__PURE__*/React.createElement("p", {
    className: "auth-text"
  }, "Доступ к админ-панели: заявки пользователей, статистика и демо-коэффициент цен."), /*#__PURE__*/React.createElement("div", {
    className: "auth-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "auth-label",
    htmlFor: "alogin"
  }, "Логин"), /*#__PURE__*/React.createElement("input", {
    id: "alogin",
    ref: loginRef,
    type: "text",
    placeholder: "Логин",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement("div", {
    className: "auth-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "auth-label",
    htmlFor: "apass"
  }, "Пароль"), /*#__PURE__*/React.createElement("input", {
    id: "apass",
    ref: passRef,
    type: "password",
    placeholder: "Пароль",
    autoComplete: "off"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "btn dark",
    onClick: () => onAdmin(loginRef.current.value, passRef.current.value)
  }, "Войти как администратор"), /*#__PURE__*/React.createElement("p", {
    className: "mini muted"
  }, "Демо-доступ: логин ", /*#__PURE__*/React.createElement("code", null, "admin"), ", пароль ", /*#__PURE__*/React.createElement("code", null, "admin"), ". Пароль находится прямо в коде страницы — это не настоящая защита.")))));
}

/* --------------------------------------------------- мои заявки */
function RequestsModal({
  requests,
  onClose,
  onClear,
  title,
  note
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn close",
    onClick: onClose,
    "aria-label": "Закрыть"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fav-list req-list"
  }, requests.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      border: 0,
      padding: '26px 12px'
    }
  }, "Заявок пока нет. Нажимайте кнопки покупки — обращения сохранятся здесь."), requests.map(r => /*#__PURE__*/React.createElement("div", {
    className: "req-row",
    key: r.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "req-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "req-service"
  }, r.service), /*#__PURE__*/React.createElement("span", {
    className: "req-time"
  }, r.time)), /*#__PURE__*/React.createElement("div", {
    className: "req-route"
  }, r.route), /*#__PURE__*/React.createElement("div", {
    className: "req-user mini muted"
  }, "клиент: ", r.user)))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: onClear,
    disabled: requests.length === 0
  }, "Очистить"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
    style: {
      flex: 1
    }
  }, "Готово")), /*#__PURE__*/React.createElement("p", {
    className: "mini muted",
    style: {
      margin: '0 20px 14px'
    }
  }, note)));
}

/* -------------------------------------------------- админ-панель */
function AdminPanel({
  requests,
  favCount,
  priceK,
  onPriceK,
  onClearRequests,
  onClearFavs,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Админ-панель"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal admin-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("h3", null, "Админ-панель"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn close",
    onClick: onClose,
    "aria-label": "Закрыть"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "admin-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Заявки"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, requests.length)), /*#__PURE__*/React.createElement("div", {
    className: "stat-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "В избранном"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, favCount))), /*#__PURE__*/React.createElement("div", {
    className: "admin-block"
  }, /*#__PURE__*/React.createElement("h4", null, "Демо-коэффициент цен"), /*#__PURE__*/React.createElement("p", {
    className: "mini muted"
  }, "Умножает ориентировочные цены (со знаком ≈): удобно для показа на защите или для сценария «цены выросли». Реальные цены Aviasales коэффициент не меняет."), /*#__PURE__*/React.createElement("div", {
    className: "range-row"
  }, /*#__PURE__*/React.createElement("span", null, "×0,8"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.8",
    max: "1.5",
    step: "0.05",
    defaultValue: priceK || 1,
    onInput: e => onPriceK(parseFloat(e.target.value)),
    onChange: e => onPriceK(parseFloat(e.target.value)),
    "aria-label": "Коэффициент цен"
  }), /*#__PURE__*/React.createElement("span", null, "×1,5")), /*#__PURE__*/React.createElement("div", {
    className: "range-value"
  }, "Текущий коэффициент: ", /*#__PURE__*/React.createElement("b", null, "×", priceK.toFixed(2).replace('.', ',')))), /*#__PURE__*/React.createElement("div", {
    className: "admin-block"
  }, /*#__PURE__*/React.createElement("h4", null, "Последние заявки"), /*#__PURE__*/React.createElement("div", {
    className: "fav-list req-list admin-req"
  }, requests.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "mini muted"
  }, "Пока нет обращений."), requests.slice(0, 6).map(r => /*#__PURE__*/React.createElement("div", {
    className: "req-row compact",
    key: r.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "req-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "req-service"
  }, r.service), /*#__PURE__*/React.createElement("span", {
    className: "req-time"
  }, r.time)), /*#__PURE__*/React.createElement("div", {
    className: "req-route"
  }, r.route), /*#__PURE__*/React.createElement("div", {
    className: "req-user mini muted"
  }, r.user))))), /*#__PURE__*/React.createElement("div", {
    className: "admin-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: onClearRequests
  }, "Очистить заявки"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: onClearFavs
  }, "Очистить избранное")), /*#__PURE__*/React.createElement("p", {
    className: "mini muted"
  }, "Панель работает локально (демо): все данные хранятся только в этом браузере. Для реальной системы нужны сервер, база данных и настоящая авторизация."))));
}

/* ---------------------------------------------- планировщик поездки */
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&accept-language=ru&limit=5&q=';
function PlaceSearch({
  id,
  label,
  value,
  onPick,
  placeholder
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  const onType = text => {
    setQuery(text);
    setResults([]);
    clearTimeout(timerRef.current);
    if (text.trim().length < 3) {
      setOpen(false);
      setBusy(false);
      return;
    }
    setBusy(true);
    timerRef.current = setTimeout(() => {
      fetch(NOMINATIM_URL + encodeURIComponent(text.trim())).then(r => r.ok ? r.json() : Promise.reject(new Error('geocode failed'))).then(data => {
        setResults(data.map(x => ({
          name: x.name || x.address && x.address.city || (x.display_name || '').split(',')[0],
          display: x.display_name,
          lat: parseFloat(x.lat),
          lon: parseFloat(x.lon),
          country: x.address && (x.address.country || ''),
          kind: x.type || ''
        })));
        setOpen(true);
      }).catch(() => setResults([])).finally(() => setBusy(false));
    }, 500);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "field place-search"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: id
  }, label), value ? /*#__PURE__*/React.createElement("div", {
    className: "place-picked"
  }, /*#__PURE__*/React.createElement("span", {
    className: "place-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "place-name"
  }, value.name), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "place-replace",
    onClick: () => {
      onPick(null);
      setQuery('');
    }
  }, "Изменить")) : /*#__PURE__*/React.createElement("div", {
    className: "place-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "text",
    autoComplete: "off",
    placeholder: placeholder,
    value: query,
    onChange: e => onType(e.target.value)
  }), busy && /*#__PURE__*/React.createElement("span", {
    className: "place-busy"
  }, "поиск…"), open && results.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "place-results",
    role: "listbox"
  }, results.map((r, i) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: i,
    role: "option",
    "aria-selected": "false",
    className: "place-result",
    onClick: () => {
      onPick(r);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "place-result-name"
  }, r.name), /*#__PURE__*/React.createElement("span", {
    className: "place-result-sub"
  }, r.display)))), open && !busy && results.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "place-results"
  }, /*#__PURE__*/React.createElement("span", {
    className: "place-empty mini muted"
  }, "Ничего не нашлось. Попробуйте написать по-другому."))));
}

/* грубые ориентиры стоимости и времени (для «любого места», где нет наших тарифов) */
const fareByDistance = {
  plane: km => ({
    from: Math.round((km * 3.1 + 1800) / 10) * 10,
    to: Math.round((km * 4.6 + 2600) / 10) * 10,
    time: flightTime(Math.round(km * 1.1))
  }),
  train: km => ({
    from: Math.round((km * 1.0 + 700) / 10) * 10,
    to: Math.round((km * 2.1 + 1200) / 10) * 10,
    time: flightTime(Math.round(km * 1.65))
  }),
  bus: km => ({
    from: Math.round((km * 1.1 + 500) / 10) * 10,
    to: Math.round((km * 1.9 + 900) / 10) * 10,
    time: flightTime(Math.round(km * 1.55))
  }),
  car: km => ({
    from: Math.round((km * 7.5 + 0) / 10) * 10,
    to: Math.round((km * 9.5 + 500) / 10) * 10,
    time: flightTime(Math.round(km * 1.25))
  })
};
const MODE_META = [['plane', 'Самолёт', 'По прямой авиамаршрут: время и цена — ориентир, точные тарифы на Aviasales.', 'https://www.aviasales.ru'], ['train', 'Поезд', 'Если между пунктами есть железнодорожное сообщение.', 'https://www.tutu.ru/poezda/'], ['bus', 'Автобус', 'Междугородние автобусы и маршрутные перевозки.', 'https://rasp.yandex.ru/bus'], ['car', 'Автомобиль', 'По реальным дорогам: топливо, платные участки и средняя скорость учтены ориентировочно.', '']];
function PlannerPage({
  notify,
  dark,
  onRequest,
  priceK
}) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState(todayPlus(7));
  const [time, setTime] = useState('10:00');
  const ready = !!(from && to);
  const km = ready ? distKm(from, to) : 0;
  const k = priceK || 1;
  const sameCountry = ready && from.country === to.country;
  const summary = ready ? from.name + ' → ' + to.name + ' · ≈' + km.toLocaleString('ru-RU') + ' км' : '';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    className: "planner-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Планировщик"), /*#__PURE__*/React.createElement("h1", {
    className: "h2"
  }, "Постройте маршрут «откуда — куда»"), /*#__PURE__*/React.createElement("p", {
    className: "section-sub"
  }, "Введите любые города или места, выберите дату и время в календаре — покажем все возможные способы добраться с ориентирами по времени и цене.")), /*#__PURE__*/React.createElement("div", {
    className: "search-form planner-form"
  }, /*#__PURE__*/React.createElement(PlaceSearch, {
    id: "p-from",
    label: "Откуда",
    placeholder: "Город, например Казань",
    value: from,
    onPick: setFrom
  }), /*#__PURE__*/React.createElement(PlaceSearch, {
    id: "p-to",
    label: "Куда",
    placeholder: "Город или место, например Дагомыс",
    value: to,
    onPick: setTo
  }), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "p-date"
  }, "Дата"), /*#__PURE__*/React.createElement("input", {
    id: "p-date",
    type: "date",
    value: date,
    min: todayPlus(0),
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "p-time"
  }, "Время"), /*#__PURE__*/React.createElement("input", {
    id: "p-time",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), ready && from && to && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-ghost",
    onClick: () => {
      const a = from;
      const b = to;
      setFrom(b);
      setTo(a);
    },
    title: "Поменять пункты местами"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "swap",
    size: 15
  }), " Поменять")), !ready && /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, "Укажите «откуда» и «куда» — появятся способы добраться и карта маршрута."), ready && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(RouteMap, {
    a: from,
    b: to,
    dark: dark,
    className: "planner-map",
    showLabels: true,
    summary: summary + ' · ' + dateRu(date) + ' ' + time
  }), /*#__PURE__*/React.createElement("div", {
    className: "mode-grid"
  }, MODE_META.map(([id, title, note, link]) => {
    if ((id === 'train' || id === 'bus') && !sameCountry) return null;
    const f = fareByDistance[id](km);
    const url = id === 'car' ? yaRouteUrl(from, to) : link;
    const label = id === 'car' ? 'Маршрут в Яндекс.Картах' : 'Проверить и купить';
    return /*#__PURE__*/React.createElement("article", {
      className: "mode-card",
      key: id
    }, /*#__PURE__*/React.createElement("div", {
      className: "mode-head"
    }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("span", {
      className: "mode-abbr"
    }, id === 'plane' ? 'самолёт' : id === 'train' ? 'поезд' : id === 'bus' ? 'автобус' : 'авто')), /*#__PURE__*/React.createElement("div", {
      className: "mode-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mode-cell"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "В пути"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, f.time)), /*#__PURE__*/React.createElement("div", {
      className: "mode-cell"
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, "Цена"), /*#__PURE__*/React.createElement("span", {
      className: "v"
    }, "≈ ", rub(dprice(f.from, k)), " — ", rub(dprice(f.to, k))))), /*#__PURE__*/React.createElement("p", {
      className: "mode-note"
    }, note), url ? /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm",
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: () => {
        notify('Открываем внешнюю услугу: расписание и покупка там.');
        if (onRequest) onRequest(label.startsWith('Маршрут') ? 'Яндекс Карты' : title, from.name + ' → ' + to.name + ', ' + dateRu(date) + ' ' + time);
      }
    }, label) : /*#__PURE__*/React.createElement("span", {
      className: "mini muted"
    }, "Езжайте сами — маршрут уже в Яндекс.Картах по кнопке ниже."));
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel cta-panel"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Дальше по маршруту"), /*#__PURE__*/React.createElement("p", {
    className: "muted mini"
  }, "Оценки построены по расстоянию по прямой — у автобуса и поезда фактический путь длиннее, поэтому точные цены всегда по кнопкам на сайтах партнёров.")), /*#__PURE__*/React.createElement("a", {
    className: "btn-ghost",
    href: yaRouteUrl(from, to),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      notify('Открываем Яндекс.Карты.');
      if (onRequest) onRequest('Яндекс Карты', from.name + ' → ' + to.name + ', ' + dateRu(date) + ' ' + time);
    }
  }, "Дорога в Яндекс.Картах"))));
}

/* --------------------------------------------------- приложение */
/* адреса вида #/dest/sochi и #/planner — чтобы страницу можно было открыть и обновить */
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '');
  if (raw.indexOf('dest/') === 0) {
    const id = raw.slice(5);
    if (DATA.some(x => x.id === id)) return {
      page: 'dest',
      id
    };
  }
  if (raw === 'planner') return {
    page: 'planner'
  };
  return {
    page: 'home'
  };
}
function App() {
  const [route, setRoute] = useState(parseHash);
  const [tab, setTab] = useState('route');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('poehali_favs') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [favOpen, setFavOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('poehali_theme') === 'dark';
    } catch (e) {
      return false;
    }
  });
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  /* аккаунты, заявки, коэффициент цен */
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('poehali_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('poehali_requests') || '[]');
    } catch (e) {
      return [];
    }
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
    if (dark) root.setAttribute('data-theme', 'dark');else root.removeAttribute('data-theme');
    try {
      localStorage.setItem('poehali_theme', dark ? 'dark' : 'light');
    } catch (e) {}
  }, [dark]);
  useEffect(() => {
    try {
      localStorage.setItem('poehali_favs', JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);
  useEffect(() => {
    try {
      localStorage.setItem('poehali_requests', JSON.stringify(requests));
    } catch (e) {}
  }, [requests]);
  useEffect(() => {
    try {
      localStorage.setItem('poehali_priceK', String(priceK));
    } catch (e) {}
  }, [priceK]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    const hash = route.page === 'home' ? '#/' : route.page === 'planner' ? '#/planner' : '#/dest/' + route.id;
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
  const notify = msg => {
    setToast({
      msg,
      id: Date.now()
    });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3800);
  };
  const openDest = id => {
    setTab('route');
    setRoute({
      page: 'dest',
      id
    });
  };
  const openSearch = id => {
    setTab('tickets');
    setRoute({
      page: 'dest',
      id,
      origin: searchOrigin,
      date: searchDate,
      pax: searchPax
    });
  };
  const goHome = () => setRoute({
    page: 'home'
  });
  const goPlanner = () => setRoute({
    page: 'planner'
  });
  const d = route.page === 'dest' ? DATA.find(x => x.id === route.id) : null;

  /* ---------- учётные записи ---------- */
  const loginUser = (u, msg) => {
    setUser(u);
    try {
      localStorage.setItem('poehali_user', JSON.stringify(u));
    } catch (e) {}
    setAuthOpen(false);
    setMenuOpen(false);
    notify(msg);
  };
  const loginGuest = name => {
    loginUser({
      name: (String(name || '').trim() || 'Гость').slice(0, 24),
      role: 'guest'
    }, 'Вы вошли как гость. Приятного планирования!');
  };
  const loginAdmin = (login, pass) => {
    if (login.trim().toLowerCase() === ADMIN_CREDENTIALS.login && pass === ADMIN_CREDENTIALS.password) {
      loginUser({
        name: 'Администратор',
        role: 'admin'
      }, 'Вы вошли как администратор. Открыт доступ к панели.');
    } else {
      notify('Неверный логин или пароль администратора. Демо-доступ: admin / admin.');
    }
  };
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('poehali_user');
    } catch (e) {}
    setMenuOpen(false);
    notify('Вы вышли из аккаунта.');
  };
  const logRequest = (service, routeText) => {
    setRequests(prev => [{
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      service,
      route: routeText,
      user: user ? user.name + ' · ' + (user.role === 'admin' ? 'администратор' : 'гость') : 'без входа',
      time: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }, ...prev].slice(0, 60));
  };
  const clearRequests = () => {
    setRequests([]);
    notify('Список заявок очищен.');
  };
  const clearFavsFromPanel = () => {
    setFavorites({});
    notify('Избранное очищено.');
  };
  const toggleFav = (dest, hotel) => {
    const key = dest.id + '::' + hotel.name;
    setFavorites(prev => {
      const next = {
        ...prev
      };
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
  const removeFav = key => setFavorites(prev => {
    const next = {
      ...prev
    };
    delete next[key];
    return next;
  });
  const clearFavs = () => {
    setFavorites({});
    notify('Избранное очищено');
  };
  const favCount = Object.keys(favorites).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Header, {
    page: route.page,
    onHome: goHome,
    favCount: favCount,
    onFav: () => setFavOpen(true),
    dark: dark,
    onTheme: () => setDark(v => !v),
    user: user,
    menuOpen: menuOpen,
    onMenuToggle: () => setMenuOpen(v => !v),
    onAuth: () => setAuthOpen(true),
    onLogout: logout,
    onRequests: () => {
      setMenuOpen(false);
      setReqOpen(true);
    },
    onPanel: () => {
      setMenuOpen(false);
      setPanelOpen(true);
    },
    onPlanner: goPlanner,
    reqCount: requests.length
  }), /*#__PURE__*/React.createElement("main", null, route.page === 'home' && /*#__PURE__*/React.createElement(Home, {
    onOpen: openDest,
    onOpenSearch: openSearch,
    onPlanner: goPlanner,
    onFav: () => setFavOpen(true),
    searchOrigin: searchOrigin,
    onSearchOrigin: setSearchOrigin,
    searchDate: searchDate,
    onSearchDate: setSearchDate,
    searchPax: searchPax,
    onSearchPax: setSearchPax,
    k: priceK
  }), route.page === 'planner' && /*#__PURE__*/React.createElement(PlannerPage, {
    notify: notify,
    dark: dark,
    onRequest: logRequest,
    priceK: priceK
  }), d && /*#__PURE__*/React.createElement(Destination, {
    d: d,
    tab: tab,
    onTab: setTab,
    favorites: favorites,
    onFav: toggleFav,
    notify: notify,
    k: priceK,
    dark: dark,
    onRequest: logRequest,
    initialOrigin: route.origin,
    initialDate: route.date,
    initialPax: route.pax
  })), /*#__PURE__*/React.createElement(Footer, {
    onOpen: openDest
  }), favOpen && /*#__PURE__*/React.createElement(FavModal, {
    favs: favorites,
    onClose: () => setFavOpen(false),
    onRemove: removeFav,
    onClear: clearFavs
  }), authOpen && /*#__PURE__*/React.createElement(AuthModal, {
    onClose: () => setAuthOpen(false),
    onGuest: loginGuest,
    onAdmin: loginAdmin
  }), reqOpen && /*#__PURE__*/React.createElement(RequestsModal, {
    requests: requests,
    title: "Мои заявки",
    note: "Заявки фиксируются автоматически, когда вы открываете сервис покупки. Данные хранятся только в этом браузере.",
    onClose: () => setReqOpen(false),
    onClear: clearRequests
  }), panelOpen && /*#__PURE__*/React.createElement(AdminPanel, {
    requests: requests,
    favCount: favCount,
    priceK: priceK,
    onPriceK: v => setPriceK(v),
    onClearRequests: clearRequests,
    onClearFavs: clearFavsFromPanel,
    onClose: () => setPanelOpen(false)
  }), toast && /*#__PURE__*/React.createElement(Toast, {
    key: toast.id,
    msg: toast.msg
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));