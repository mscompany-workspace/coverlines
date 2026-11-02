/**
 * Coverlines — generatore del sito.
 * Legge content/prodotti/*.json e produce il sito statico in dist/.
 * Lanciato da Netlify a ogni modifica fatta dal pannello /admin.
 */
import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');

const CAT = {
  zanzariere:  { nome: 'Zanzariere',            page: 'zanzariere.html' },
  tapparelle:  { nome: 'Tapparelle',            page: 'tapparelle.html' },
  frangisole:  { nome: 'Frangisole',            page: 'frangisole.html' },
  cassonetti:  { nome: 'Cassonetti coibentati', page: 'cassonetti.html' },
  automazioni: { nome: 'Automazioni',           page: 'automazioni.html' },
  accessori:   { nome: 'Accessori tapparelle',  page: 'accessori.html' },
};
// prodotti messi in vetrina in home (per nome commerciale, in ordine di preferenza)
const VETRINA = ['plisse','evotwin','miniscenica','molla','catena','battente','gioconda','faber'];

const ARROW = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const esc = (s='') => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const short = (t='', n=100) => {
  t = String(t).replace(/\s+/g,' ').trim();
  return t.length > n ? t.slice(0,n).replace(/\s+\S*$/,'') + '…' : t;
};
const paragrafi = (t='') => String(t).split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);

/** percorso immagine: file caricato dal pannello, altrimenti immagine del catalogo o URL esterno */
const imgSrc = (p) => p.immagine_upload || p.immagine || p.immagine_url || '';

/** trasforma un link YouTube/Vimeo in URL da incorporare */
function embedUrl(u='') {
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return '';
}

function cardProdotto(p) {
  const src = imgSrc(p);
  const ph = src
    ? `<span class="ph"><img src="${esc(src)}" alt="${esc(p.nome || p.titolo)}" loading="lazy"></span>`
    : '<span class="ph ph-empty"></span>';
  return `        <a class="pcard" href="${esc(p.slug)}.html">
          ${ph}
          <span class="pb">
            <span class="ptag">${esc((p.nome||'').toUpperCase().slice(0,28))}</span>
            <h3>${esc(p.titolo)}</h3>
            <span class="pd">${esc(short(paragrafi(p.descrizione)[0] || ''))}</span>
            <span class="pmore">Scheda prodotto &rarr;</span>
          </span>
        </a>\n`;
}

const griglia = (lista) => '      <div class="pgrid">\n' + lista.map(cardProdotto).join('') + '      </div>\n';

function paginaProdotto(p) {
  const cat = CAT[p.categoria] || { nome: p.categoria, page: 'prodotti.html' };
  const desc = paragrafi(p.descrizione);
  const meta = short(desc[0] || p.titolo, 155);
  const src = imgSrc(p);

  const shot = src
    ? `<div class="pshot"><img src="${esc(src)}" alt="${esc(p.nome || p.titolo)}"></div>`
    : '<div class="pshot pshot-empty"><span>Immagine non disponibile</span></div>';

  let righe = (p.caratteristiche||[])
    .filter(c => c && String(c.etichetta||'').trim() && String(c.valore||'').trim())
    .map(c => `<div class="row"><span class="lb">${esc(c.etichetta)}</span><span class="vl">${esc(c.valore)}</span></div>`)
    .join('');
  if ((p.colori||[]).length)
    righe += `<div class="row"><span class="lb">Colori</span><span class="vl">${esc(p.colori.join(' · '))}</span></div>`;
  const spec = righe ? `<div class="spec">${righe}</div>` : '';

  const docs = (p.documenti||[]).filter(d => d && (d.file || d.url));
  const docsHtml = docs.length ? `  <section class="section docs-sec">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">Documentazione</span>
        <h2 class="title">Schede, manuali e certificazioni.</h2>
      </div>
      <div class="doc-grid">
${docs.map(d => `        <a class="doc-card" href="${esc(d.file || d.url)}" target="_blank" rel="noopener">
          <svg class="fi" viewBox="0 0 24 24" fill="none"><path d="M7 2h7l5 5v15H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 2v5h5" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v6m0 0l-2.5-2.5M12 17l2.5-2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="t"><b>${esc(d.titolo || 'Documento PDF')}</b><span>PDF</span></span>
          <span class="go">&darr;</span>
        </a>\n`).join('')}      </div>
    </div>
  </section>

` : '';

  // videoguida: link YouTube/Vimeo incorporato, oppure file video caricato
  let videoHtml = '';
  const emb = embedUrl(p.videoguida_url || '');
  if (emb) {
    videoHtml = `  <section class="section video-sec">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Videoguida</span><h2 class="title">Installazione passo passo.</h2></div>
      <div class="video-wrap"><iframe src="${esc(emb)}" title="Videoguida ${esc(p.nome||p.titolo)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    </div>
  </section>

`;
  } else if (p.videoguida_file || (p.videoguida_url && /\.(mp4|webm|mov)$/i.test(p.videoguida_url))) {
    const v = p.videoguida_file || p.videoguida_url;
    videoHtml = `  <section class="section video-sec">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Videoguida</span><h2 class="title">Installazione passo passo.</h2></div>
      <div class="video-wrap"><video src="${esc(v)}" controls preload="metadata"></video></div>
    </div>
  </section>

`;
  }

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
  <section class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><a href="prodotti.html">Prodotti</a><span class="sep">/</span><a href="${cat.page}">${esc(cat.nome)}</a><span class="sep">/</span> ${esc(p.nome || p.titolo)}</div>
      <span class="eyebrow">${esc(cat.nome)}</span>
      <h1>${esc(p.titolo)}</h1>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="pdetail">
        ${shot}
        <div class="pinfo">
          <h2>${esc(p.nome || p.titolo)}</h2>
${desc.map(t => `          <p class="pdesc">${esc(t)}</p>`).join('\n')}
          ${spec}
          <div class="pactions">
            <a href="#richiedi" class="btn btn-pri">Richiedi informazioni</a>
            <a href="${cat.page}" class="btn btn-ghost">Tutta la categoria</a>
          </div>
        </div>
      </div>
    </div>
  </section>

${docsHtml}${videoHtml}<div id="richiedi"></div>
  <section class="section contact-sec">
    <div class="wrap">
      <div class="form-card" style="max-width:860px;margin-inline:auto">
        <span class="eyebrow">Contatti</span>
        <h3>Richiedi informazioni su ${esc(p.nome || p.titolo)}</h3>
        <p class="fp">Compila il modulo: un referente del team Coverlines ti risponde entro 1 giorno lavorativo.</p>
        <form onsubmit="return false">
          <div class="grid2">
            <div class="field"><label for="nome">Nome e cognome</label><input id="nome" type="text" placeholder="Mario Rossi"></div>
            <div class="field"><label for="azienda">Azienda</label><input id="azienda" type="text" placeholder="Ragione sociale"></div>
          </div>
          <div class="grid2">
            <div class="field"><label for="email">Email</label><input id="email" type="email" placeholder="nome@azienda.it"></div>
            <div class="field"><label for="tel">Telefono</label><input id="tel" type="tel" placeholder="+39 ..."></div>
          </div>
          <div class="field"><label for="msg">Messaggio</label><textarea id="msg" placeholder="Richiesta su ${esc(p.nome || p.titolo)}…"></textarea></div>
          <button type="submit" class="btn btn-pri">Invia richiesta ${ARROW}</button>
          <p class="privacy-mini">Inviando accetti la Privacy Policy. Ti rispondiamo entro 1 giorno lavorativo.</p>
        </form>
      </div>
    </div>
  </section>
</main>
<div id="site-footer"></div>
<script src="app.js"></script>
</body>
</html>`;
}

function vetrinaHome(zanz) {
  const scelti = [];
  for (const chiave of VETRINA) {
    const p = zanz.find(x => !scelti.includes(x) &&
      ((x.nome||'') + ' ' + (x.titolo||'')).toLowerCase().includes(chiave));
    if (p) scelti.push(p);
    if (scelti.length >= 6) break;
  }
  for (const p of zanz) {
    if (scelti.length >= 6) break;
    if (!scelti.includes(p) && imgSrc(p)) scelti.push(p);
  }
  return scelti.slice(0,6);
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 1. contenuti
  const dir = path.join(ROOT,'content','prodotti');
  const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
  const prodotti = [];
  for (const f of files) {
    const p = JSON.parse(await readFile(path.join(dir,f),'utf8'));
    if (p.pubblicato === false) continue;
    if (!p.slug || !p.titolo) { console.warn('saltato (slug o titolo mancante):', f); continue; }
    prodotti.push(p);
  }
  prodotti.sort((a,b) => (a.titolo||'').localeCompare(b.titolo||'','it'));

  // 2. asset statici
  await cp(path.join(ROOT,'static'), DIST, { recursive: true });
  // pannello di gestione
  await cp(path.join(ROOT,'admin'), path.join(DIST,'admin'), { recursive: true });

  // 3. schede prodotto
  for (const p of prodotti) await writeFile(path.join(DIST, `${p.slug}.html`), paginaProdotto(p), 'utf8');

  // 4. pagine: griglie al posto del segnaposto
  const perCat = {};
  for (const p of prodotti) (perCat[p.categoria] ||= []).push(p);
  const pagesDir = path.join(ROOT,'pages');
  for (const f of await readdir(pagesDir)) {
    if (!f.endsWith('.html')) continue;
    let s = await readFile(path.join(pagesDir,f),'utf8');
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
    await writeFile(path.join(DIST,f), s, 'utf8');
  }

  console.log(`fatto: ${prodotti.length} schede prodotto`);
  for (const [c,l] of Object.entries(perCat)) console.log(`  ${c}: ${l.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
