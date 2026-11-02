/**
 * Anteprima dal vivo nel pannello: la scheda prodotto viene disegnata
 * con lo stesso codice e lo stesso foglio di stile del sito pubblicato.
 */
(async function () {
  if (!window.CMS) return;
  var CMS = window.CMS, h = window.h;

  // stile del sito dentro il riquadro di anteprima
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  CMS.registerPreviewStyle('/styles.css');
  CMS.registerPreviewStyle('/admin/preview.css');

  var mod;
  try { mod = await import('/scheda.mjs'); }
  catch (e) { console.error('Anteprima non disponibile:', e); return; }

  function Anteprima(props) {
    var entry = props.entry, getAsset = props.getAsset;
    var dati = {};
    try { dati = entry.get('data').toJS() || {}; } catch (e) {}

    // percorsi dei file: quelli caricati dal pannello passano da getAsset
    // (così si vedono anche prima del salvataggio); gli altri sono resi assoluti
    var asset = function (v) {
      if (!v) return '';
      v = String(v);
      if (/^https?:\/\//.test(v)) return v;
      if (/^\/?uploads\//.test(v)) {
        try { var a = getAsset(v); return a ? a.toString() : v; } catch (e) { return v; }
      }
      return v.charAt(0) === '/' ? v : '/' + v;
    };
    var html = '<main>' + mod.schedaHTML(dati, { asset: asset, link: function () { return '#'; } }) + '</main>';
    return h('div', { className: 'anteprima-sito', dangerouslySetInnerHTML: { __html: html } });
  }

  ['zanzariere', 'tapparelle', 'frangisole', 'cassonetti', 'automazioni', 'accessori']
    .forEach(function (nome) { CMS.registerPreviewTemplate(nome, Anteprima); });
})();
