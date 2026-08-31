// ─── GLOBAL BUSINESS INFO ───
const BUSINESS_PHONE_DISPLAY = '+212 608-905-168';
const BUSINESS_PHONE_RAW = '212608905168'; 
const BUSINESS_EMAIL = 'goldenafouss@gmail.com';
const CURRENT_YEAR = new Date().getFullYear(); 

// ─── DYNAMIC FOOTER BUILDER ───
function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;
  container.innerHTML = `
    <footer>
      <div class="footer-inner">
        <div>
          <div class="footer-logo"><em>Golden</em> Afouss</div>
          <div class="footer-tagline en">A Moroccan mountain café where flavour meets stunning views.</div>
          <div class="footer-tagline fr" style="display:none">Un café marocain de montagne où saveurs et vues se rencontrent.</div>
        </div>
        <div class="footer-col">
          <h4 class="en">Pages</h4><h4 class="fr" style="display:none">Pages</h4>
          <a href="index.html" class="en">Home</a><a href="index.html" class="fr" style="display:none">Accueil</a>
          <a href="menu.html" class="en">Menu</a><a href="menu.html" class="fr" style="display:none">Menu</a>
          <a href="argan.html" class="en">Argan</a><a href="argan.html" class="fr" style="display:none">Argan</a>
          <a href="booking.html" class="en">Book Now</a><a href="booking.html" class="fr" style="display:none">Réserver</a>
          <a href="about.html" class="en">About Us</a><a href="about.html" class="fr" style="display:none">À Propos</a>
        </div>
        <div class="footer-col">
          <h4 class="en">Contact</h4><h4 class="fr" style="display:none">Contact</h4>
          <p>WhatsApp: ${BUSINESS_PHONE_DISPLAY}</p>
          <p>Email: ${BUSINESS_EMAIL}</p>
          <p>Open to visitors — contact us for details</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${CURRENT_YEAR} Golden Afouss. All rights reserved.</span>
        <span>Built with love in the Atlas Mountains.</span>
      </div>
    </footer>
  `;
  if (typeof setLang === 'function') { setLang(localStorage.getItem('ga_lang') || 'en', true); }
}

// ─── PREMIUM MOBILE BOTTOM NAVIGATION (WITH ARGAN) ───
function loadBottomNav() {
  if (document.querySelector('.mobile-bottom-nav')) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.innerHTML = `
    <a href="index.html" class="bottom-nav-item ${currentPage === 'index.html' ? 'active' : ''}">
      <span class="bottom-nav-icon">🏠</span>
      <span class="en">Home</span><span class="fr" style="display:none">Accueil</span>
    </a>
    <a href="menu.html" class="bottom-nav-item ${currentPage === 'menu.html' ? 'active' : ''}">
      <span class="bottom-nav-icon">🍽️</span>
      <span class="en">Menu</span><span class="fr" style="display:none">Menu</span>
    </a>
    <a href="argan.html" class="bottom-nav-item ${currentPage === 'argan.html' ? 'active' : ''}">
      <span class="bottom-nav-icon">🌿</span>
      <span class="en">Argan</span><span class="fr" style="display:none">Argan</span>
    </a>
    <a href="booking.html" class="bottom-nav-item ${currentPage === 'booking.html' ? 'active' : ''}">
      <span class="bottom-nav-icon">📋</span>
      <span class="en">Book</span><span class="fr" style="display:none">Réserver</span>
    </a>
    <a href="about.html" class="bottom-nav-item ${currentPage === 'about.html' ? 'active' : ''}">
      <span class="bottom-nav-icon">⛰️</span>
      <span class="en">About</span><span class="fr" style="display:none">À Propos</span>
    </a>
  `;
  document.body.appendChild(nav);
  if (typeof setLang === 'function') { setLang(localStorage.getItem('ga_lang') || 'en', true); }
}

document.addEventListener('DOMContentLoaded', function() {
  loadFooter();
  loadBottomNav();
});
