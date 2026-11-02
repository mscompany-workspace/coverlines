/**
 * Anteprima dal vivo nel pannello.
 * La scheda viene disegnata in una finestra a sé (iframe) con lo stesso codice e
 * lo stesso foglio di stile del sito, quindi:
 *  - lo scroll è indipendente dall'editor
 *  - si può vedere a larghezza desktop (1280 px, ridotta in scala) o telefono (390 px)
 *  - cliccando un elemento, il cursore va nel campo corrispondente dell'editor
 */
(async function () {
  if (!window.CMS) return;
  var CMS = window.CMS, h = window.h, createClass = window.createClass;

  CMS.registerPreviewStyle('/admin/preview.css');

  var mod;
  try { mod = await import('/scheda.mjs'); }
  catch (e) { console.error('Anteprima non disponibile:', e); return; }

  var FONTS = 'https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  var LARGHEZZE = { desktop: 1280, mobile: 390 };

  // nome del campo nell'anteprima -> etichetta del campo nell'editor
  var ETICHETTE = {
    titolo: 'Titolo del prodotto', nome: 'Nome commerciale', categoria: 'Categoria',
    descrizione: 'Descrizione', caratteristiche: 'Caratteristiche tecniche', colori: 'Colori disponibili',
    immagine_upload: 'Foto del prodotto', documenti: 'Documenti PDF',
    videoguida_url: 'Videoguida — link YouTube o Vimeo', videoguida_file: 'Videoguida — file video'
  };

  /** porta il cursore sul campo dell'editor con quell'etichetta */
  function vaiAlCampo(campo) {
    var testo = ETICHETTE[campo]; if (!testo) return;
    var labels = Array.prototype.slice.call(document.querySelectorAll('label'));
    var label = labels.find(function (l) { return (l.textContent || '').trim().indexOf(testo) === 0; });
    if (!label) return;
    var blocco = label.parentElement;
    var ctrl = (label.htmlFor && document.getElementById(label.htmlFor)) ||
               (blocco && blocco.querySelector('input:not([type=hidden]), textarea, select, [contenteditable="true"], button'));
    (blocco || label).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (ctrl && ctrl.focus) { try { ctrl.focus({ preventScroll: true }); } catch (e) { ctrl.focus(); } }
    // breve evidenziazione
    var target = blocco || label;
    target.style.transition = 'box-shadow .2s';
    target.style.boxShadow = '0 0 0 3px #00a8ff';
    setTimeout(function () { target.style.boxShadow = ''; }, 1400);
  }

  function datiDa(entry) {
    try { return entry.get('data').toJS() || {}; } catch (e) { return {}; }
  }

  function creaAsset(getAsset) {
    return function (v) {
      if (!v) return '';
      v = String(v);
      if (/^https?:\/\//.test(v)) return v;
      if (/^\/?uploads\//.test(v)) {
        try { var a = getAsset(v); return a ? a.toString() : v; } catch (e) { return v; }
      }
      return v.charAt(0) === '/' ? v : '/' + v;
    };
  }

  function htmlScheda(props) {
    return mod.schedaHTML(datiDa(props.entry), {
      asset: creaAsset(props.getAsset), link: function () { return '#'; }, campi: true, anteprima: true
    });
  }

  var Anteprima = createClass({
    getInitialState: function () { return { vista: 'desktop', scala: 1 }; },

    componentDidMount: function () {
      this.scriviDocumento();
      var self = this, view = this.view;
      var W = view && view.ownerDocument.defaultView;
      if (W && W.ResizeObserver) {
        this.ro = new W.ResizeObserver(function () { self.aggiornaScala(); });
        this.ro.observe(view);
      }
      this.aggiornaScala();
    },
    componentWillUnmount: function () { if (this.ro) this.ro.disconnect(); },

    componentDidUpdate: function (prevProps, prevState) {
      if (prevState.vista !== this.state.vista) { this.aggiornaScala(); }
      this.aggiornaContenuto();
    },

    /** crea il documento interno una volta sola: così lo scroll non si perde mentre si scrive */
    scriviDocumento: function () {
      var f = this.frame; if (!f) return;
      var doc = f.contentDocument; if (!doc) return;
      var html = htmlScheda(this.props); this.ultimoHtml = html;
      doc.open();
      doc.write('<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<link rel="stylesheet" href="' + FONTS + '">' +
        '<link rel="stylesheet" href="/styles.css">' +
        '<link rel="stylesheet" href="/admin/preview-pagina.css">' +
        '</head><body><main>' + html + '</main></body></html>');
      doc.close();
      doc.addEventListener('click', function (e) {
        e.preventDefault();
        var t = e.target && e.target.closest ? e.target.closest('[data-campo]') : null;
        if (t) vaiAlCampo(t.getAttribute('data-campo'));
      });
    },

    aggiornaContenuto: function () {
      var f = this.frame; if (!f || !f.contentDocument) return;
      var html = htmlScheda(this.props);
      if (html === this.ultimoHtml) return;
      this.ultimoHtml = html;
      var main = f.contentDocument.querySelector('main');
      if (main) main.innerHTML = html; else this.scriviDocumento();
    },

    /** in modalità desktop la pagina è larga 1280 px e viene ridotta in scala per entrare nel riquadro */
    aggiornaScala: function () {
      var view = this.view; if (!view) return;
      var disp = view.clientWidth - 32;
      var w = LARGHEZZE[this.state.vista];
      var scala = Math.min(1, disp / w);
      if (Math.abs(scala - this.state.scala) > 0.001) this.setState({ scala: scala });
    },

    render: function () {
      var self = this, vista = this.state.vista, scala = this.state.scala;
      var w = LARGHEZZE[vista];
      var stileFrame = {
        width: w + 'px',
        height: (100 / scala) + '%',
        transform: 'scale(' + scala + ')',
        transformOrigin: 'top center'
      };
      var bottone = function (v, testo) {
        return h('button', {
          type: 'button', className: 'ant-btn' + (vista === v ? ' on' : ''),
          onClick: function () { self.setState({ vista: v }); }
        }, testo);
      };
      return h('div', { className: 'ant-shell ' + vista },
        h('div', { className: 'ant-bar' },
          h('span', { className: 'ant-title' }, 'Anteprima'),
          bottone('desktop', 'Desktop'),
          bottone('mobile', 'Telefono'),
          h('span', { className: 'ant-hint' }, 'Clicca un elemento della pagina per modificarlo')
        ),
        h('div', { className: 'ant-view', ref: function (el) { self.view = el; } },
          h('iframe', { className: 'ant-frame', style: stileFrame, title: 'Anteprima della scheda',
                        ref: function (el) { self.frame = el; } })
        )
      );
    }
  });

  ['zanzariere', 'tapparelle', 'frangisole', 'cassonetti', 'automazioni', 'accessori']
    .forEach(function (nome) { CMS.registerPreviewTemplate(nome, Anteprima); });
})();
