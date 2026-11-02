/**
 * Coverlines — markup della scheda prodotto.
 * Usato sia dal generatore del sito (build.mjs) sia dall'anteprima del pannello,
 * così la pagina pubblicata e l'anteprima sono sempre identiche.
 */
export const CAT = {
  zanzariere:  { nome: 'Zanzariere',            page: 'zanzariere.html' },
  tapparelle:  { nome: 'Tapparelle',            page: 'tapparelle.html' },
  frangisole:  { nome: 'Frangisole',            page: 'frangisole.html' },
  cassonetti:  { nome: 'Cassonetti coibentati', page: 'cassonetti.html' },
  automazioni: { nome: 'Automazioni',           page: 'automazioni.html' },
  accessori:   { nome: 'Accessori tapparelle',  page: 'accessori.html' },
};

export const ARROW = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PDF_ICON = '<svg class="fi" viewBox="0 0 24 24" fill="none"><path d="M7 2h7l5 5v15H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 2v5h5" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v6m0 0l-2.5-2.5M12 17l2.5-2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const esc = (s = '') => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const short = (t = '', n = 100) => {
  t = String(t ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
};

export const paragrafi = (t = '') => String(t ?? '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

/** immagine da mostrare: file caricato dal pannello, altrimenti catalogo, altrimenti link esterno */
export const imgSrc = (p) => p.immagine_upload || p.immagine || p.immagine_url || '';

/** trasforma un link YouTube/Vimeo in URL da incorporare */
export function embedUrl(u = '') {
  u = String(u ?? '');
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return '';
}

/**
 * Contenuto della pagina prodotto (tutto ciò che sta dentro <main>).
 * @param p      dati del prodotto
 * @param opts.asset  funzione che risolve un percorso file (usata dall'anteprima)
 * @param opts.link   funzione che risolve un link interno (usata dall'anteprima)
 */
export function schedaHTML(p, opts = {}) {
  const asset = opts.asset || (v => v);
  const link  = opts.link  || (v => v);
  // in anteprima ogni blocco porta il nome del campo che lo modifica
  const dc = (campo) => opts.campi ? ` data-campo="${campo}"` : '';
  const cat = CAT[p.categoria] || { nome: p.categoria || 'Prodotti', page: 'prodotti.html' };
  const nome = p.nome || p.titolo || '';
  const titolo = p.titolo || p.nome || 'Prodotto';
  const desc = paragrafi(p.descrizione);
  const src = imgSrc(p);

  const shot = src
    ? `<div class="pshot"${dc('immagine_upload')}><img src="${esc(asset(src))}" alt="${esc(nome)}"></div>`
    : `<div class="pshot pshot-empty"${dc('immagine_upload')}><span>Immagine non disponibile</span></div>`;

  let righe = (p.caratteristiche || [])
    .filter(c => c && String(c.etichetta || '').trim() && String(c.valore || '').trim())
    .map(c => `<div class="row"><span class="lb">${esc(c.etichetta)}</span><span class="vl">${esc(c.valore)}</span></div>`)
    .join('');
  const colori = (p.colori || []).map(c => (c && typeof c === 'object') ? (c.colore || '') : c).filter(Boolean);
  if (colori.length)
    righe += `<div class="row"${dc('colori')}><span class="lb">Colori</span><span class="vl">${esc(colori.join(' · '))}</span></div>`;
  const spec = righe ? `<div class="spec"${dc('caratteristiche')}>${righe}</div>` : '';

  const docs = (p.documenti || []).filter(d => d && (d.file || d.url));
  const docsHtml = docs.length ? `  <section class="section docs-sec">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">Documentazione</span>
        <h2 class="title">Schede, manuali e certificazioni.</h2>
      </div>
      <div class="doc-grid"${dc('documenti')}>
${docs.map(d => `        <a class="doc-card" href="${esc(asset(d.file || d.url))}" target="_blank" rel="noopener">
          ${PDF_ICON}
          <span class="t"><b>${esc(d.titolo || 'Documento PDF')}</b><span>PDF</span></span>
          <span class="go">&darr;</span>
        </a>\n`).join('')}      </div>
    </div>
  </section>

` : '';

  let videoHtml = '';
  const emb = embedUrl(p.videoguida_url);
  const fileVideo = p.videoguida_file || ((p.videoguida_url && /\.(mp4|webm|mov)(\?|$)/i.test(p.videoguida_url)) ? p.videoguida_url : '');
  if (emb && opts.anteprima) {
    videoHtml = `  <section class="section video-sec">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Videoguida</span><h2 class="title">Installazione passo passo.</h2></div>
      <div class="video-wrap video-finto"${dc('videoguida_url')}><span>&#9654; Video incorporato<br><small>${esc(p.videoguida_url)}</small></span></div>
    </div>
  </section>

`;
  } else if (emb) {
    videoHtml = `  <section class="section video-sec">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Videoguida</span><h2 class="title">Installazione passo passo.</h2></div>
      <div class="video-wrap"${dc('videoguida_url')}><iframe src="${esc(emb)}" title="Videoguida ${esc(nome)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    </div>
  </section>

`;
  } else if (fileVideo) {
    videoHtml = `  <section class="section video-sec">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Videoguida</span><h2 class="title">Installazione passo passo.</h2></div>
      <div class="video-wrap"${dc('videoguida_file')}><video src="${esc(asset(fileVideo))}" controls preload="metadata"></video></div>
    </div>
  </section>

`;
  }

  return `  <section class="page-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="${link('index.html')}">Home</a><span class="sep">/</span><a href="${link('prodotti.html')}">Prodotti</a><span class="sep">/</span><a href="${link(cat.page)}">${esc(cat.nome)}</a><span class="sep">/</span> ${esc(nome)}</div>
      <span class="eyebrow"${dc('categoria')}>${esc(cat.nome)}</span>
      <h1${dc('titolo')}>${esc(titolo)}</h1>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="pdetail">
        ${shot}
        <div class="pinfo">
          <h2${dc('nome')}>${esc(nome)}</h2>
${desc.length ? desc.map(t => `          <p class="pdesc"${dc('descrizione')}>${esc(t)}</p>`).join('\n')
             : (opts.anteprima ? `          <p class="pdesc pdesc-vuota"${dc('descrizione')}>Nessuna descrizione: clicca qui per scriverla.</p>` : '')}
          ${spec}
          <div class="pactions">
            <a href="#richiedi" class="btn btn-pri">Richiedi informazioni</a>
            <a href="${link(cat.page)}" class="btn btn-ghost">Tutta la categoria</a>
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
        <h3>Richiedi informazioni su ${esc(nome)}</h3>
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
          <div class="field"><label for="msg">Messaggio</label><textarea id="msg" placeholder="Richiesta su ${esc(nome)}…"></textarea></div>
          <button type="submit" class="btn btn-pri">Invia richiesta ${ARROW}</button>
          <p class="privacy-mini">Inviando accetti la Privacy Policy. Ti rispondiamo entro 1 giorno lavorativo.</p>
        </form>
      </div>
    </div>
  </section>
`;
}

/** card della griglia prodotti (pagine categoria e home) */
export function cardHTML(p) {
  const src = imgSrc(p);
  const ph = src
    ? `<span class="ph"><img src="${esc(src)}" alt="${esc(p.nome || p.titolo)}" loading="lazy"></span>`
    : '<span class="ph ph-empty"></span>';
  return `        <a class="pcard" href="${esc(p.slug)}.html">
          ${ph}
          <span class="pb">
            <span class="ptag">${esc((p.nome || '').toUpperCase().slice(0, 28))}</span>
            <h3>${esc(p.titolo)}</h3>
            <span class="pd">${esc(short(paragrafi(p.descrizione)[0] || ''))}</span>
            <span class="pmore">Scheda prodotto &rarr;</span>
          </span>
        </a>\n`;
}
