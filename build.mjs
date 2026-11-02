/**
 * Coverlines — generatore del sito.
 * Legge content/prodotti/*.json e produce il sito statico in dist/.
 * Lanciato da Netlify a ogni modifica fatta dal pannello /admin.
 */
import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { CAT, esc, short, paragrafi, imgSrc, schedaHTML, cardHTML } from './static/scheda.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');

// prodotti messi in vetrina in home (per nome commerciale, in ordine di preferenza)
const VETRINA = ['plisse', 'evotwin', 'miniscenica', 'molla', 'catena', 'battente', 'gioconda', 'faber'];

const griglia = (lista) => '      <div class="pgrid">\n' + lista.map(cardHTML).join('') + '      </div>\n';

function paginaProdotto(p) {
  const cat = CAT[p.categoria] || { nome: p.categoria, page: 'prodotti.html' };
  const meta = short(paragrafi(p.descrizione)[0] || p.titolo, 155);
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.titolo)} &mdash; ${esc(cat.nome)} Coverlines</title>
<meta name="description" content="${esc(meta)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div id="site-header"></div>
<main>
${schedaHTML(p)}</main>
<div id="site-footer"></div>
<script src="app.js"></script>
</body>
</html>`;
}

function vetrinaHome(zanz) {
  const scelti = [];
  for (const chiave of VETRINA) {
    const p = zanz.find(x => !scelti.includes(x) &&
      ((x.nome || '') + ' ' + (x.titolo || '')).toLowerCase().includes(chiave));
    if (p) scelti.push(p);
    if (scelti.length >= 6) break;
  }
  for (const p of zanz) {
    if (scelti.length >= 6) break;
    if (!scelti.includes(p) && imgSrc(p)) scelti.push(p);
  }
  return scelti.slice(0, 6);
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 1. contenuti
  const dir = path.join(ROOT, 'content', 'prodotti');
  const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
  const prodotti = [];
  for (const f of files) {
    const p = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
    if (p.pubblicato === false) continue;
    if (!p.slug || !p.titolo) { console.warn('saltato (slug o titolo mancante):', f); continue; }
    prodotti.push(p);
  }
  prodotti.sort((a, b) => (a.titolo || '').localeCompare(b.titolo || '', 'it'));

  // 2. asset statici + pannello
  await cp(path.join(ROOT, 'static'), DIST, { recursive: true });
  await cp(path.join(ROOT, 'admin'), path.join(DIST, 'admin'), { recursive: true });

  // 3. schede prodotto
  for (const p of prodotti) await writeFile(path.join(DIST, `${p.slug}.html`), paginaProdotto(p), 'utf8');

  // 4. pagine fisse: griglie al posto del segnaposto
  const perCat = {};
  for (const p of prodotti) (perCat[p.categoria] ||= []).push(p);
  const pagesDir = path.join(ROOT, 'pages');
  for (const f of await readdir(pagesDir)) {
    if (!f.endsWith('.html')) continue;
    let s = await readFile(path.join(pagesDir, f), 'utf8');
    if (s.includes('<!--PGRID-->')) {
      const cat = Object.keys(CAT).find(c => CAT[c].page === f);
      const lista = f === 'index.html' ? vetrinaHome(perCat.zanzariere || []) : (perCat[cat] || []);
      s = s.replace('      <!--PGRID-->\n', griglia(lista));
      if (f !== 'index.html' && cat) {
        s = s.replace(/<span class="eyebrow">Catalogo [^·<]*· \d+ prodotti<\/span>/,
          `<span class="eyebrow">Catalogo ${CAT[cat].nome.toLowerCase()} · ${lista.length} prodotti</span>`);
      } else {
        const n = (perCat.zanzariere || []).length;
        s = s.replace(/Tutti i \d+ modelli/g, `Tutti i ${n} modelli`)
             .replace(/<span>\d+ modelli di zanzariere<\/span>/, `<span>${n} modelli di zanzariere</span>`);
      }
    }
    await writeFile(path.join(DIST, f), s, 'utf8');
  }

  console.log(`fatto: ${prodotti.length} schede prodotto`);
  for (const [c, l] of Object.entries(perCat)) console.log(`  ${c}: ${l.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
