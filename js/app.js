// ─── AFOUSSE CAFÉ — Shared Logic ───
const WA = '212639339952';
const EM = 'afoussecafe@gmail.com';
const CART_KEY = 'golden_afouss_cart';
const LANG_KEY = 'golden_afouss_lang';

let lang = 'en';
let sel = {};

// ── Language strings ──
const T = {
  en: {
    'nav-menu': 'Menu', 'nav-argan': 'Argan Boutique', 'nav-book': 'Book Now', 'nav-about': 'About',
    'sum-title': 'Your Selection',
    'sum-empty': 'No items selected yet.<br>Go to Menu or Argan Boutique.',
    'wa-lbl': 'Send via WhatsApp', 'em-lbl': 'Send via Email', 'clear-lbl': 'Clear all selections',
    'toast-empty': '⚠ Please select at least one item.',
    'toast-cleared': '✓ Selection cleared.',
    'footer-hours': 'Open daily: 8:00 AM – 7:00 PM',
    'footer-rights': '© 2025 Golden Afouss. All rights reserved.',
    'footer-built': 'Built with love in the Atlas Mountains.'
  },
  fr: {
    'nav-menu': 'Menu', 'nav-argan': 'Boutique Argan', 'nav-book': 'Réserver', 'nav-about': 'À Propos',
    'sum-title': 'Votre Sélection',
    'sum-empty': 'Aucun article sélectionné.<br>Allez au Menu ou à la Boutique.',
    'wa-lbl': 'Envoyer par WhatsApp', 'em-lbl': 'Envoyer par Email', 'clear-lbl': 'Effacer la sélection',
    'toast-empty': '⚠ Sélectionnez au moins un article.',
    'toast-cleared': '✓ Sélection effacée.',
    'footer-hours': 'Ouvert tous les jours : 8h00 – 19h00',
    'footer-rights': '© 2025 Golden Afouss. Tous droits réservés.',
    'footer-built': 'Fait avec amour dans les montagnes de l\'Atlas.'
  }
};

// ── CART: save & load from localStorage ──
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(sel)); } catch(e) {}
}
function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) sel = JSON.parse(stored);
  } catch(e) { sel = {}; }
}

// Reflect saved cart on card UI (for menu.html / argan.html)
function restoreCardStates() {
  document.querySelectorAll('.menu-card').forEach(card => {
    const id = card.dataset.id;
    if (sel[id]) {
      card.classList.add('selected');
      const qr = card.querySelector('.qty-row');
      const qv = card.querySelector('.qty-val');
      if (qr) qr.style.display = 'flex';
      if (qv) qv.textContent = sel[id].qty;
    }
  });
}

// ── Language: save & load ──
function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch(e) {} }
function loadLang()  { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch(e) { return 'en'; } }

function setLang(l) {
  lang = l;
  saveLang(l);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
  document.querySelectorAll('.en').forEach(e => e.style.display = l === 'en' ? '' : 'none');
  document.querySelectorAll('.fr').forEach(e => e.style.display = l === 'fr' ? '' : 'none');
  Object.keys(T[l]).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = T[l][id];
  });
  updateSummary();
}

// ── Cart actions ──
function toggleItem(card) {
  const id = card.dataset.id;
  const qr = card.querySelector('.qty-row');
  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    if (qr) qr.style.display = 'none';
    delete sel[id];
  } else {
    card.classList.add('selected');
    if (qr) qr.style.display = 'flex';
    sel[id] = {
      name:   card.dataset.name,
      namefr: card.dataset.namefr || card.dataset.name,
      price:  card.dataset.price || '',
      qty:    parseInt(card.querySelector('.qty-val')?.textContent) || 1
    };
  }
  saveCart();
  updateSummary();
  updateCartBadge();
}

function chQty(e, btn, d) {
  e.stopPropagation();
  const qv   = btn.parentElement.querySelector('.qty-val');
  const card  = btn.closest('.menu-card');
  const id    = card.dataset.id;
  let q = Math.max(1, parseInt(qv.textContent) + d);
  qv.textContent = q;
  if (sel[id]) sel[id].qty = q;
  saveCart();
  updateSummary();
  updateCartBadge();
}

function updateSummary() {
  const container = document.getElementById('summary-items');
  if (!container) return;
  const keys = Object.keys(sel);
  if (!keys.length) {
    container.innerHTML = '<div class="sum-empty">' + T[lang]['sum-empty'] + '</div>';
    return;
  }
  container.innerHTML = keys.map(id => {
    const it = sel[id];
    const n  = lang === 'fr' && it.namefr ? it.namefr : it.name;
    return `<div class="sum-item">
      <span>${n}${it.price ? ` <span style="opacity:.4;font-size:11px">${it.price}</span>` : ''}</span>
      <span class="sum-qty">×${it.qty}</span>
    </div>`;
  }).join('');
}

function clearAll() {
  sel = {};
  saveCart();
  document.querySelectorAll('.menu-card.selected').forEach(c => {
    c.classList.remove('selected');
    const qr = c.querySelector('.qty-row'); if (qr) qr.style.display = 'none';
    const qv = c.querySelector('.qty-val'); if (qv) qv.textContent = '1';
  });
  updateSummary();
  updateCartBadge();
  showToast(T[lang]['toast-cleared']);
}

// ── Floating cart badge ──
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = Object.values(sel).reduce((a, i) => a + i.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ── Message builders ──
function buildWAMsg() {
  const n  = document.getElementById('contact-name')?.value.trim() || '—';
  const s  = document.getElementById('group-size')?.value.trim()   || '—';
  const d  = document.getElementById('arrival-date')?.value         || '—';
  const t  = document.getElementById('arrival-time')?.value         || '—';
  const nt = document.getElementById('notes')?.value.trim()         || '';
  const order = Object.keys(sel).map(id =>
    `• ${sel[id].name}${sel[id].price ? ' (' + sel[id].price + ')' : ''} × ${sel[id].qty}`
  ).join('\n');
  return `🌿 *Golden Afouss — Group Booking*\n───────────────────\n👤 Contact: ${n}\n👥 Group: ${s} people\n📅 Date: ${d}\n⏰ Time: ${t}\n───────────────────\n🛒 Order:\n${order || 'No items'}${nt ? '\n───────────────────\n📝 Notes: ' + nt : ''}\n───────────────────\nSent from goldenafouss.com`;
}

function sendWA(e) {
  if (e) e.preventDefault();
  if (!Object.keys(sel).length) { showToast(T[lang]['toast-empty']); return; }
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(buildWAMsg()), '_blank');
}

function sendEM(e) {
  if (e) e.preventDefault();
  if (!Object.keys(sel).length) { showToast(T[lang]['toast-empty']); return; }
  const n  = document.getElementById('contact-name')?.value.trim() || '—';
  const s  = document.getElementById('group-size')?.value.trim()   || '—';
  const d  = document.getElementById('arrival-date')?.value         || '—';
  const t  = document.getElementById('arrival-time')?.value         || '—';
  const nt = document.getElementById('notes')?.value.trim()         || '';
  const order = Object.keys(sel).map(id =>
    `- ${sel[id].name}${sel[id].price ? ' (' + sel[id].price + ')' : ''} x${sel[id].qty}`
  ).join('\n');
  const subj = `Group Booking – Golden Afouss – ${d}`;
  const body = `Golden Afouss – Group Booking\n\nContact: ${n}\nGroup size: ${s}\nDate: ${d}\nTime: ${t}\n\nORDER:\n${order}${nt ? '\n\nNotes: ' + nt : ''}\n\nSent from goldenafouss.com`;
  window.location.href = `mailto:${EM}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Mobile nav toggle ──
function toggleMobileMenu() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.toggle('open');
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  lang = loadLang();

  // Set today's date on booking page
  const dateInput = document.getElementById('arrival-date');
  if (dateInput) dateInput.valueAsDate = new Date();

  // Restore card states from saved cart
  restoreCardStates();

  // Apply language
  setLang(lang);

  // Render summary (booking page)
  updateSummary();

  // Cart badge
  updateCartBadge();

  // Highlight active nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      const links = document.getElementById('nav-links');
      if (links) links.classList.remove('open');
    });
  });
});
