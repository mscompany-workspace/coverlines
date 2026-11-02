/* Coverlines — header/footer condivisi + interazioni
   Modifica QUI il menu o il footer: vale per tutte le pagine. */
(function () {
  var headerHTML = `
<div class="strip">
  <div class="wrap"><span><b>Produzione 100% Made in Italy</b></span></div>
</div>
<header class="nav">
  <div class="wrap">
    <a href="index.html" class="brand" aria-label="Coverlines — home">
      <img class="brand-logo" src="coverlines-logo.png" alt="">
    </a>
    <nav aria-label="Principale">
      <ul class="menu" id="menu">
        <li class="has-drop">
          <a href="prodotti.html" class="drop-btn" data-nav="prodotti">Prodotti
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <ul class="drop">
            <li><a href="zanzariere.html"><span class="ico">&#9638;</span> Zanzariere</a></li>
            <li><a href="tapparelle.html"><span class="ico">&#8801;</span> Tapparelle</a></li>
            <li><a href="frangisole.html"><span class="ico">&#10934;</span> Frangisole</a></li>
            <li><a href="cassonetti.html"><span class="ico">&#9636;</span> Cassonetti coibentati</a></li>
            <li><a href="complementi.html"><span class="ico">&#9707;</span> Complementi d'arredo</a></li>
            <li><a href="automazioni.html"><span class="ico">&#9881;</span> Automazioni</a></li>
            <li><a href="accessori.html"><span class="ico">&#9881;</span> Accessori tapparelle</a></li>
          </ul>
        </li>
        <li><a href="contatti.html" data-nav="contatti">Contatti</a></li>
        <li><a href="faq.html" data-nav="faq">FAQ</a></li>
        <li><a href="https://shop.coverlines.it" target="_blank" rel="noopener">Shop <span class="ext">&#8599;</span></a></li>
        <li class="has-drop">
          <button class="drop-btn" aria-haspopup="true" aria-expanded="false">Download
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <ul class="drop">
            <li><a href="catalogo-coverlines.pdf" download><span class="ico">&#8595;</span> Scarica catalogo Coverlines</a></li>
            <li><a href="catalogo-accessori.pdf" download><span class="ico">&#8595;</span> Scarica catalogo accessori</a></li>
          </ul>
        </li>
      </ul>
    </nav>
    <a href="diventa-rivenditore.html" class="nav-cta">Diventa rivenditore</a>
    <button class="burger" id="burger" aria-label="Apri menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>`;

  var footerHTML = `
<footer class="ft">
  <div class="wrap">
    <div class="ft-top">
      <div class="ft-brand">
        <div class="brand"><img class="brand-logo" src="coverlines-logo-white.png" alt="Coverlines"></div>
        <p>Soluzioni Made in Italy per schermatura, protezione e isolamento. Qualità produttiva e supporto concreto al mercato B2B.</p>
        <span class="ft-made">&#9733; 100% MADE IN ITALY</span>
      </div>
      <div class="ft-col">
        <h4>Prodotti</h4>
        <ul>
          <li><a href="zanzariere.html">Zanzariere</a></li>
          <li><a href="tapparelle.html">Tapparelle</a></li>
          <li><a href="frangisole.html">Frangisole</a></li>
          <li><a href="cassonetti.html">Cassonetti e pretelai</a></li>
          <li><a href="complementi.html">Complementi d'arredo</a></li>
          <li><a href="automazioni.html">Automazioni</a></li>
          <li><a href="accessori.html">Accessori tapparelle</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h4>Servizio Clienti</h4>
        <ul>
          <li><a href="zanzariere.html">Guida zanzariere</a></li>
          <li><a href="tapparelle.html">Guida tapparelle</a></li>
          <li><a href="frangisole.html">Guida frangisole</a></li>
          <li><a href="cassonetti.html">Guida cassonetti</a></li>
          <li><a href="prodotti.html">Guida automazioni</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contatti.html">Contatti</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h4>Professionisti</h4>
        <ul>
          <li><a href="diventa-rivenditore.html">Diventa Rivenditore</a></li>
          <li><a href="https://shop.coverlines.it" target="_blank" rel="noopener">Shop <span class="ext">&#8599;</span></a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h4>Privacy</h4>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Cookie policy</a></li>
        </ul>
      </div>
    </div>
    <div class="ft-bottom">
      <span class="mono">&copy; 2026 Coverlines S.r.l. &mdash; P.IVA 00000000000</span>
      <span class="mono">Schermatura &middot; Protezione &middot; Isolamento</span>
    </div>
  </div>
</footer>`;

  var h = document.getElementById('site-header');
  var f = document.getElementById('site-footer');
  if (h) h.innerHTML = headerHTML;
  if (f) f.innerHTML = footerHTML;

  // active nav highlight
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var map = {
    'prodotti.html': 'prodotti', 'zanzariere.html': 'prodotti', 'tapparelle.html': 'prodotti',
    'frangisole.html': 'prodotti', 'cassonetti.html': 'prodotti', 'complementi.html': 'prodotti',
    'automazioni.html': 'prodotti', 'accessori.html': 'prodotti',
    'contatti.html': 'contatti', 'faq.html': 'faq'
  };
  var key = map[page];
  if (key) { var el = document.querySelector('[data-nav="' + key + '"]'); if (el) el.classList.add('active'); }

  // mobile menu toggle
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('show');
      burger.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('show'); burger.setAttribute('aria-expanded', false); });
    });
  }

  // hero: tapparella avvolgibile (home only)
  var sh = document.getElementById('shutter');
  if (sh) {
    var inner = document.createElement('div');
    inner.className = 'shutter-inner';
    for (var i = 0; i < 26; i++) {
      var d = document.createElement('div');
      d.className = 'shutter-slat';
      inner.appendChild(d);
    }
    sh.appendChild(inner);
    var bar = document.createElement('div');
    bar.className = 'shutter-bar';
    sh.appendChild(bar);
  }

  // FAQ accordion (any page with .faq-q)
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.parentElement, ans = item.querySelector('.faq-a'), isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
      if (!isOpen) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });
})();
