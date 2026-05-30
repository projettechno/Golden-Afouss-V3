// ─── GLOBAL BUSINESS INFO (CHANGE ONCE, UPDATES EVERYWHERE) ───
const BUSINESS_PHONE_DISPLAY = '+212 661-051782';
const BUSINESS_PHONE_RAW = '212661051782'; // Used for WhatsApp links
const BUSINESS_EMAIL = 'goldenafouss@gmail.com';
const CURRENT_YEAR = new Date().getFullYear(); // Auto-updates every year!

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

  // Ensure language preference applies to the new footer immediately
  if (typeof setLang === 'function') {
    setLang(localStorage.getItem('ga_lang') || 'en', true);
  }
}

// Inject footer when page loads
document.addEventListener('DOMContentLoaded', loadFooter);
