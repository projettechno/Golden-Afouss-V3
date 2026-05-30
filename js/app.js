// ─── GOLDEN AFOUSS — Shared Logic ───
const WA       = '212639339952';
const EM       = 'goldenafouss@gmail.com';
const CART_KEY = 'golden_afouss_cart';
const LANG_KEY = 'golden_afouss_lang';

let lang = 'en';
let sel  = {};

// ── Language strings ──
const T = {
  en: {
    'nav-menu': 'Menu', 'nav-argan': 'Argan', 'nav-book': 'Book Now', 'nav-about': 'About',
    'sum-title':    'Your Selection',
    'sum-empty':    'No items selected yet.<br>Go to the Menu to choose.',
    'wa-lbl':       'Send via WhatsApp',
    'em-lbl':       'Send via Email',
    'clear-lbl':    'Clear all selections',
    'toast-empty':  '⚠ Please select at least one item.',
    'toast-cleared':'✓ Selection cleared.',
    'toast-sent':   '✓ Order sent! Cart has been reset.',
    'footer-hours': 'Open to visitors — contact us for details',
    'footer-rights':'© 2026 Golden Afouss. All rights reserved.',
    'footer-built': 'Built with love in the Atlas Mountains.',
    'err-name':     '⚠ Please enter the contact name.',
    'err-size':     '⚠ Please enter the group size.',
    'err-date':     '⚠ Please select the arrival date.',
    'err-time':     '⚠ Please select the arrival time.',
    'err-items':    '⚠ Please select at least one dish from the menu.'
  },
  fr: {
    'nav-menu': 'Menu', 'nav-argan': 'Argan', 'nav-book': 'Réserver', 'nav-about': 'À Propos',
    'sum-title':    'Votre Sélection',
    'sum-empty':    'Aucun article sélectionné.<br>Allez au Menu pour choisir.',
    'wa-lbl':       'Envoyer par WhatsApp',
    'em-lbl':       'Envoyer par Email',
    'clear-lbl':    'Effacer la sélection',
    'toast-empty':  '⚠ Sélectionnez au moins un plat.',
    'toast-cleared':'✓ Sélection effacée.',
    'toast-sent':   '✓ Commande envoyée ! Panier réinitialisé.',
    'footer-hours': 'Ouvert aux visiteurs — contactez-nous pour les détails',
    'footer-rights':'© 2026 Golden Afouss. Tous droits réservés.',
    'footer-built': 'Fait avec amour dans les montagnes de l\'Atlas.',
    'err-name':     '⚠ Veuillez entrer le nom du contact.',
    'err-size':     '⚠ Veuillez entrer la taille du groupe.',
    'err-date':     '⚠ Veuillez sélectionner la date d\'arrivée.',
    'err-time':     '⚠ Veuillez sélectionner l\'heure d\'arrivée.',
    'err-items':    '⚠ Veuillez sélectionner au moins un plat.'
  }
};

// ── CART: save & load ──
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(sel)); } catch(e) {}
}
function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) sel = JSON.parse(stored);
  } catch(e) { sel = {}; }
}

// Clear cart from storage and UI completely
function resetCart() {
  sel = {};
  try { localStorage.removeItem(CART_KEY); } catch(e) {}
  document.querySelectorAll('.menu-card.selected').forEach(c => {
    c.classList.remove('selected');
    const qr = c.querySelector('.qty-row'); if (qr) qr.style.display = 'none';
    const qv = c.querySelector('.qty-val'); if (qv) qv.textContent = '1';
  });
  updateSummary();
  updateCartBadge();
}

// Restore card UI from saved cart (menu/argan pages)
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

// ── Language ──
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
  const qv  = btn.parentElement.querySelector('.qty-val');
  const card = btn.closest('.menu-card');
  const id   = card.dataset.id;
  let q = Math.max(1, parseInt(qv.textContent) + d);
  qv.textContent = q;
  if (sel[id]) sel[id].qty = q;
  saveCart();
  updateSummary();
  updateCartBadge();
}

// ── Summary with live total ──
function updateSummary() {
  const container = document.getElementById('summary-items');
  if (!container) return;
  const keys = Object.keys(sel);
  if (!keys.length) {
    container.innerHTML = '<div class="sum-empty">' + T[lang]['sum-empty'] + '</div>';
    return;
  }

  const itemsHTML = keys.map(id => {
    const it  = sel[id];
    const n   = lang === 'fr' && it.namefr ? it.namefr : it.name;
    const num = parseFloat((it.price || '').replace(/[^\d.]/g, ''));
    const lineTotal = !isNaN(num) ? num * it.qty : 0;
    return '<div class="sum-item">'
      + '<span>' + n + (it.price ? ' <span style="opacity:.4;font-size:11px">' + it.price + '</span>' : '') + '</span>'
      + '<span style="display:flex;align-items:center;gap:6px">'
      + '<span class="sum-qty">x' + it.qty + '</span>'
      + (lineTotal ? '<span style="font-size:11px;color:var(--gold2);opacity:.8">' + lineTotal + ' MAD</span>' : '')
      + '</span>'
      + '</div>';
  }).join('');

  const total = calcTotal();
  const totalHTML = total > 0
    ? '<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(184,135,58,0.3);display:flex;justify-content:space-between;align-items:center;">'
      + '<span style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold2);">Total</span>'
      + '<span style="font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:400;color:var(--gold2);">' + total + ' MAD</span>'
      + '</div>'
      + '<div style="font-size:11px;color:rgba(253,250,243,0.3);text-align:right;margin-top:3px;">+ 10% service tip</div>'
    : '';

  container.innerHTML = itemsHTML + totalHTML;
}

function clearAll() {
  resetCart();
  showToast(T[lang]['toast-cleared']);
}

// ── Cart badge ──
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = Object.values(sel).reduce((a, i) => a + i.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ── Format helpers ──
function formatTime(raw) {
  if (!raw || raw.trim() === '') return '—';
  try {
    const [h, m] = raw.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour   = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  } catch(e) { return raw; }
}

function formatDate(raw) {
  if (!raw || raw.trim() === '') return '—';
  try {
    const [y, mo, d] = raw.split('-');
    return `${d}/${mo}/${y}`;
  } catch(e) { return raw; }
}

function getField(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

// ── Total calculator ──
function calcTotal() {
  let total = 0;
  Object.keys(sel).forEach(id => {
    const num = parseFloat((sel[id].price || '').replace(/[^\d.]/g, ''));
    if (!isNaN(num)) total += num * sel[id].qty;
  });
  return total;
}

// ── Validation — returns null if OK, or error message string ──
function validate() {
  if (!Object.keys(sel).length)      return T[lang]['err-items'];
  if (!getField('contact-name'))     return T[lang]['err-name'];
  if (!getField('group-size'))       return T[lang]['err-size'];
  if (!getField('arrival-date'))     return T[lang]['err-date'];
  if (!getField('arrival-time'))     return T[lang]['err-time'];
  return null;
}

// Highlight the missing field visually
function highlightError(fieldId) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.style.borderColor = '#e05252';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; }, 3000);
}

function validateAndHighlight() {
  if (!Object.keys(sel).length) { showToast(T[lang]['err-items']); return false; }
  const fields = [
    { id: 'contact-name', key: 'err-name' },
    { id: 'group-size',   key: 'err-size' },
    { id: 'arrival-date', key: 'err-date' },
    { id: 'arrival-time', key: 'err-time' }
  ];
  for (const f of fields) {
    if (!getField(f.id)) {
      showToast(T[lang][f.key]);
      highlightError(f.id);
      return false;
    }
  }
  return true;
}

// ── Message builders ──
function buildWAMsg() {
  const n     = getField('contact-name') || '—';
  const s     = getField('group-size')   || '—';
  const d     = formatDate(getField('arrival-date'));
  const t     = formatTime(getField('arrival-time'));
  const nt    = getField('notes');
  const total = calcTotal();

  const order = Object.keys(sel).map(id =>
    `• ${sel[id].name}${sel[id].price ? ' (' + sel[id].price + ')' : ''} × ${sel[id].qty}`
  ).join('\n');

  const totalLine = total > 0
    ? `\n───────────────────\n💰 *TOTAL: ${total} MAD*\n   _(+ 10% service tip)_`
    : '';

  return `🌿 *Golden Afouss — Group Booking*\n───────────────────\n👤 Contact: ${n}\n👥 Group: ${s} people\n📅 Date: ${d}\n⏰ Time: ${t}\n───────────────────\n🛒 *Order:*\n${order || 'No items'}${totalLine}${nt ? '\n───────────────────\n📝 Notes: ' + nt : ''}\n───────────────────\nSent from goldenafouss.com`;
}

function sendWA(e) {
  if (e) e.preventDefault();
  if (!validateAndHighlight()) return;
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(buildWAMsg()), '_blank');
  // Reset cart after sending so next visitor starts fresh
  setTimeout(() => {
    resetCart();
    showToast(T[lang]['toast-sent']);
  }, 800);
}

function sendEM(e) {
  if (e) e.preventDefault();
  if (!validateAndHighlight()) return;

  const n     = getField('contact-name') || '—';
  const s     = getField('group-size')   || '—';
  const d     = formatDate(getField('arrival-date'));
  const t     = formatTime(getField('arrival-time'));
  const nt    = getField('notes');
  const total = calcTotal();

  const order = Object.keys(sel).map(id =>
    `- ${sel[id].name}${sel[id].price ? ' (' + sel[id].price + ')' : ''} x${sel[id].qty}`
  ).join('\n');

  const totalLine = total > 0 ? `\n\n💰 TOTAL: ${total} MAD (+ 10% service tip)` : '';
  const subj = `Group Booking – Golden Afouss – ${d} – ${total > 0 ? total + ' MAD' : ''}`;
  const body = `Golden Afouss – Group Booking\n\nContact: ${n}\nGroup size: ${s}\nDate: ${d}\nTime: ${t}\n\nORDER:\n${order}${totalLine}${nt ? '\n\nNotes: ' + nt : ''}\n\nSent from goldenafouss.com`;

  window.location.href = `mailto:${EM}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  // Reset cart after sending
  setTimeout(() => {
    resetCart();
    showToast(T[lang]['toast-sent']);
  }, 800);
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
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

  // Set default arrival time so mobile browsers don't return empty
  const timeInput = document.getElementById('arrival-time');
  if (timeInput && !timeInput.value) timeInput.value = '12:00';

  // Restore card states from saved cart
  restoreCardStates();

  // Apply language
  setLang(lang);

  // Render summary (booking page)
  updateSummary();

  // Cart badge
  updateCartBadge();

  // Highlight active nav link
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
