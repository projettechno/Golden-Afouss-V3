// ─── CONFIGURATION ───
const WA_PHONE = '212661051782';

// ─── STATE & INIT ───
let sel = {};
let currentLang = 'en';

function safeGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch(e) { return fallback; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    sel = safeGet('ga_sel', {});
    currentLang = safeGet('ga_lang', 'en');
    setLang(currentLang, true); 
    syncUI();
    checkForRepeatOrder();
    restoreFormData();
    initFormAutosave();
  } catch (e) {
    console.error("Init error:", e);
  }
});

// ─── REPEAT LAST ORDER LOGIC ───
function checkForRepeatOrder() {
  const lastOrder = safeGet('ga_last_order', null);
  const wrap = document.getElementById('repeat-order-wrap');
  if (wrap && lastOrder && Object.keys(lastOrder).length > 0) {
    wrap.style.display = 'block';
  }
}

function repeatLastOrder() {
  const lastOrder = safeGet('ga_last_order', null);
  if (!lastOrder || Object.keys(lastOrder).length === 0) return showToast(currentLang === 'fr' ? "Aucune commande précédente." : 'No previous order found.');
  sel = JSON.parse(JSON.stringify(lastOrder));
  save();
  syncUI();
  showToast(currentLang === 'fr' ? "Commande précédente chargée !" : 'Previous order loaded!');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── FORM MEMORY (The Edit Flow) ───
function restoreFormData() {
  const data = safeGet('ga_form_data', null);
  if (!data) return;
  ['contact-name', 'group-size', 'arrival-date', 'arrival-time', 'notes'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el && data[id]) el.value = data[id];
  });
}

function initFormAutosave() {
  const formCard = document.querySelector('.booking-form-card');
  if (!formCard) return;
  formCard.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      let data = safeGet('ga_form_data', {});
      data[e.target.id] = e.target.value;
      safeSet('ga_form_data', data);
    }
  });
}

function clearFormData() {
  safeSet('ga_form_data', null);
  ['contact-name', 'group-size', 'arrival-date', 'arrival-time', 'notes'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ─── MENU VALIDATION ───
function checkProceed(e) {
  if (Object.keys(sel).length === 0) {
    e.preventDefault();
    showToast(currentLang === 'fr' ? "Sélectionnez au moins un article." : 'Please select at least one item from the menu before proceeding.');
  }
}

// ─── MENU TOGGLE & QUANTITY ───
function toggleItem(card) {
  try {
    const id = card.dataset.id;
    if (!id) return;
    if (sel[id]) { delete sel[id]; } 
    else { sel[id] = { name: currentLang === 'fr' ? card.dataset.namefr : card.dataset.name, price: card.dataset.price, qty: 1 }; }
    save();
  } catch (e) { showToast('Error selecting item.'); }
}

function chQty(event, btn, delta) {
  event.stopPropagation(); 
  try {
    const card = btn.closest('.menu-card');
    if (!card) return;
    const id = card.dataset.id;
    if (!sel[id]) return;
    sel[id].qty = Math.max(1, sel[id].qty + delta);
    card.querySelector('.qty-val').textContent = sel[id].qty;
    save(); updateSummary(); updateCartBadge();
  } catch (e) { showToast('Error updating quantity.'); }
}

// ─── SAVE & SYNC UI ───
function save() { safeSet('ga_sel', sel); syncUI(); }

function syncUI() {
  try {
    document.querySelectorAll('.menu-card').forEach(function(card) {
      const id = card.dataset.id;
      const isSelected = !!sel[id];
      card.classList.toggle('selected', isSelected);
      const qtyRow = card.querySelector('.qty-row');
      if (qtyRow) { qtyRow.style.display = isSelected ? 'flex' : 'none'; if (isSelected) qtyRow.querySelector('.qty-val').textContent = sel[id].qty; }
    });
    updateSummary(); updateCartBadge();
  } catch (e) { console.error("UI Sync error:", e); }
}

function updateSummary() {
  const container = document.getElementById('summary-items');
  if (!container) return;
  try {
    const keys = Object.keys(sel);
    if (keys.length === 0) { container.innerHTML = '<div class="sum-empty" id="sum-empty">No dishes selected yet.<br>Go to the Menu to choose.</div>'; return; }
    let html = '';
    keys.forEach(function(id) {
      const item = sel[id];
      html += '<div class="sum-item"><span>' + item.name + (item.price ? ' (' + item.price + ')' : '') + '</span><span class="sum-qty">x' + item.qty + '</span></div>';
    });
    const total = calcTotal();
    if (total > 0) { html += '<div class="sum-item" style="border-top:1px solid rgba(253,250,243,0.2); margin-top:8px; padding-top:12px; font-weight:500; color:var(--gold2);"><span>Total (+ 10% tip)</span><span>' + total + ' MAD</span></div>'; }
    container.innerHTML = html;
  } catch (e) { console.error("Summary error:", e); }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = Object.keys(sel).length;
  badge.style.display = count > 0 ? 'flex' : 'none';
  badge.textContent = count;
}

// ─── FORM HELPERS ───
function getField(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(str) {
  if (!str) return '-';
  const [h, m] = str.split(':');
  if (currentLang === 'fr') { return h + ':' + m; } 
  else { const hour = parseInt(h); return (hour % 12 || 12) + ':' + m + ' ' + (hour >= 12 ? 'PM' : 'AM'); }
}

function calcTotal() {
  let sum = 0;
  Object.values(sel).forEach(function(item) { if (item.price) { sum += (parseInt(item.price.replace(/\D/g, '')) || 0) * item.qty; } });
  return Math.round(sum * 1.1);
}

// ─── STRICT VALIDATION GATEKEEPER (With Date/Time Checks) ───
function validateBooking() {
  const isFr = currentLang === 'fr';

  if (Object.keys(sel).length === 0) {
    showToast(isFr ? "Sélectionnez des articles." : 'Please select items from the menu first.'); return false;
  }
  if (!getField('contact-name')) {
    showToast(isFr ? "Entrez le nom de contact." : 'Please enter the Contact Name.');
    document.getElementById('contact-name').focus(); return false;
  }
  const size = parseInt(getField('group-size'));
  if (!size || size < 1) {
    showToast(isFr ? "Entrez une taille de groupe valide." : 'Please enter a valid Group Size.');
    document.getElementById('group-size').focus(); return false;
  }
  
  const dateVal = getField('arrival-date');
  if (!dateVal) {
    showToast(isFr ? "Sélectionnez une date." : 'Please select an Arrival Date.');
    document.getElementById('arrival-date').focus(); return false;
  }
  
  const today = new Date(); today.setHours(0,0,0,0);
  const selectedDate = new Date(dateVal + 'T00:00:00');
  
  if (selectedDate < today) {
    showToast(isFr ? "La date ne peut pas être dans le passé." : 'Date cannot be in the past.');
    document.getElementById('arrival-date').focus(); return false;
  }

  const timeVal = getField('arrival-time');
  if (!timeVal) {
    showToast(isFr ? "Sélectionnez une heure." : 'Please select an Arrival Time.');
    document.getElementById('arrival-time').focus(); return false;
  }

  if (selectedDate.getTime() === today.getTime()) {
    const now = new Date();
    const [h, m] = timeVal.split(':');
    const selectedDateTime = new Date();
    selectedDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    selectedDateTime.setMinutes(selectedDateTime.getMinutes() - 15); 

    if (selectedDateTime <= now) {
      showToast(isFr ? "L'heure est déjà passée pour aujourd'hui." : 'Time has already passed for today. Please select a future time.');
      document.getElementById('arrival-time').focus(); return false;
    }
  }

  return true; 
}

// ─── AUTO-TRANSLATE MESSAGE BUILDER ───
function buildWAMsg() {
  const n = getField('contact-name'), s = getField('group-size'), d = formatDate(getField('arrival-date')), t = formatTime(getField('arrival-time')), nt = getField('notes'), total = calcTotal();
  const sep = '\n─────────────────────';
  let orderLines = '';
  Object.keys(sel).forEach(function(id) { orderLines += '\n- ' + sel[id].name + (sel[id].price ? ' (' + sel[id].price + ')' : '') + ' x' + sel[id].qty; });
  let msg = '';
  
  if (currentLang === 'fr') {
    msg = 'Golden Afouss - Réservation de Groupe' + sep + '\nContact : ' + n + '\nGroupe : ' + s + ' personnes' + '\nDate : ' + d + '\nHeure : ' + t + sep + '\nCOMMANDE :' + (orderLines || '\n- Aucun article') + sep;
    if (total > 0) msg += '\nTOTAL : ' + total + ' MAD (Inclut 10% de pourboire)';
    if (nt) msg += sep + '\nNotes : ' + nt;
  } else {
    msg = 'Golden Afouss - Group Booking' + sep + '\nContact: ' + n + '\nGroup: ' + s + ' people' + '\nDate: ' + d + '\nTime: ' + t + sep + '\nORDER:' + (orderLines || '\n- No items selected') + sep;
    if (total > 0) msg += '\nTOTAL: ' + total + ' MAD (Includes 10% service tip)';
    if (nt) msg += sep + '\nNotes: ' + nt;
  }
  msg += sep + '\n' + (currentLang === 'fr' ? 'Envoyé depuis goldenafouss.com' : 'Sent from goldenafouss.com');
  return msg;
}

// ─── SEND ACTIONS ───
function sendWA(e) {
  e.preventDefault();
  const isFr = currentLang === 'fr';
  if (!navigator.onLine) return showToast(isFr ? "Hors ligne." : 'You are offline.');
  if (!validateBooking()) return;
  
  try {
    safeSet('ga_last_order', sel);
    clearFormData(); 
    
    const msg = buildWAMsg();
    window.open('https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  } catch (e) { showToast('Error opening WhatsApp.'); }
}

function sendEM(e) {
  e.preventDefault();
  const isFr = currentLang === 'fr';
  if (!navigator.onLine) return showToast(isFr ? "Hors ligne." : 'You are offline.');
  if (!validateBooking()) return;
  
  try {
    safeSet('ga_last_order', sel);
    clearFormData(); 
    
    const msg = buildWAMsg();
    const subject = isFr ? 'Nouvelle Réservation - Golden Afouss' : 'New Group Booking - Golden Afouss';
    window.location.href = 'mailto:goldenafouss@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
  } catch (e) { showToast('Error opening Email.'); }
}

// ─── PRINT RECEIPT ───
function printReceipt() {
  if (!validateBooking()) return;
  try {
    const n = getField('contact-name'), s = getField('group-size'), d = formatDate(getField('arrival-date')), t = formatTime(getField('arrival-time')), nt = getField('notes'), total = calcTotal();
    let orderLines = '';
    Object.keys(sel).forEach(function(id) { orderLines += '<tr><td style="padding:6px 0; border-bottom:1px solid #eee;">' + sel[id].name + (sel[id].price ? ' (' + sel[id].price + ')' : '') + '</td><td style="text-align:right; padding:6px 0; border-bottom:1px solid #eee;">x' + sel[id].qty + '</td></tr>'; });
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Golden Afouss</title><style>body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;color:#333;}h2{color:#B8873A;}table{width:100%;border-collapse:collapse;margin:20px 0;}.total{font-weight:bold;font-size:18px;border-top:2px solid #333;padding-top:10px;}.notes{margin-top:20px;padding:10px;background:#f9f9f9;border-left:3px solid #B8873A;}</style></head><body><h2>Golden Afouss</h2><p><strong>${currentLang==='fr'?'Reçu de Réservation':'Booking Receipt'}</strong></p><hr><p><strong>${currentLang==='fr'?'Contact':'Contact'}:</strong> ${n}<br><strong>${currentLang==='fr'?'Groupe':'Group'}:</strong> ${s}<br><strong>${currentLang==='fr'?'Date':'Date'}:</strong> ${d}<br><strong>${currentLang==='fr'?'Heure':'Time'}:</strong> ${t}</p><table>${orderLines}</table><div class="total">${total} MAD</div>${nt ? '<div class="notes"><strong>Notes:</strong><br>'+nt+'</div>' : ''}<hr><p style="text-align:center;font-size:12px;color:#888;">Golden Afouss</p></body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close();
  } catch (e) { showToast('Error printing.'); }
}

function clearAll() {
  if (!confirm(currentLang === 'fr' ? "Tout effacer ?" : 'Clear all selected items?')) return; 
  sel = {}; clearFormData(); save();
  showToast(currentLang === 'fr' ? "Effacé." : 'Selection cleared.');
}

// ─── LANGUAGE TOGGLE ───
function setLang(lang, isInit) {
  currentLang = lang;
  if (!isInit) safeSet('ga_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.lang === lang); });
  document.querySelectorAll('.en').forEach(function(el) { el.style.display = lang === 'en' ? '' : 'none'; });
  document.querySelectorAll('.fr').forEach(function(el) { el.style.display = lang === 'fr' ? '' : 'none'; });
  document.querySelectorAll('.menu-card').forEach(function(card) { const id = card.dataset.id; if (sel[id]) { sel[id].name = lang === 'fr' ? card.dataset.namefr : card.dataset.name; safeSet('ga_sel', sel); } });
  updateSummary();
}

// ─── MOBILE MENU ───
function toggleMobileMenu() { const nav = document.getElementById('nav-links'); if(nav) nav.classList.toggle('open'); }

// ─── TOAST ───
function showToast(msg) {
  try { const t = document.getElementById('toast'); if (!t) return alert(msg); t.textContent = msg; t.classList.add('show'); setTimeout(function() { t.classList.remove('show'); }, 3500); } catch (e) { alert(msg); }
}
