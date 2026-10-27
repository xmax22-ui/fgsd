/* Сборка JSX → js/app.js (запуск: node build.cjs) */
const fs = require('fs');
const path = require('path');

let Babel;
try {
  Babel = require('./vendor/babel.min.js');
} catch (e) {
  console.error('Не найден vendor/babel.min.js — скачайте его или восстановите из резервной копии.');
  process.exit(1);
}

const srcPath = path.join(__dirname, 'js', 'app.jsx');
const outPath = path.join(__dirname, 'js', 'app.js');
const src = fs.readFileSync(srcPath, 'utf8');

const result = Babel.transform(src, {
  filename: 'app.jsx',
  presets: [['react', { runtime: 'classic' }]],
  sourceMaps: false
});

fs.writeFileSync(
  outPath,
  '/* Сгенерировано из js/app.jsx командой node build.cjs — не редактируйте вручную. */\n' + result.code,
  'utf8'
);

console.log('Готово: js/app.js (' + Math.round(result.code.length / 1024) + ' КБ)');
