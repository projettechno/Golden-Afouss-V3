// ─── STATE ───
let sel = JSON.parse(localStorage.getItem('ga_sel') || '{}');
let currentLang = localStorage.getItem('ga_lang') || 'en';

// ─── INIT ON PAGE LOAD ───
document.addEventListener('DOMContentLoaded', function() {
  setLang(currentLang, true); 
  syncUI();
});

// ─── MENU TOGGLE & QUANTITY ───
function toggleItem(card) {
  const id = card.dataset.id;
  if (sel[id]) {
    delete sel[id];
  } else {
    sel[id] = {
      name: currentLang === 'fr' ? card.dataset.namefr : card.dataset.name,
      price: card.dataset.price,
      qty: 1
    };
  }
  save();
  syncUI();
}

function chQty(event, btn, delta) {
  event.stopPropagation(); // Prevents toggling the card when clicking +/-
  const card = btn.closest('.menu-card');
  const id = card.dataset.id;
  
  if (!sel[id]) return;
  
  sel[id].qty = Math.max(1, sel[id].qty + delta);
  
  // Update quantity display immediately
  card.querySelector('.qty-val').textContent = sel[id].qty;
  save();
  updateSummary();
  updateCartBadge();
}

// ─── SAVE & SYNC UI ───
function save() {
  localStorage.setItem('ga_sel', JSON.stringify(sel));
  syncUI();
}

function syncUI() {
  // Sync menu cards
  document.querySelectorAll('.menu-card').forEach(function(card) {
    const id = card.dataset.id;
    const isSelected = !!sel[id];
    card.classList.toggle('selected', isSelected);
    const qtyRow = card.querySelector('.qty-row');
    if (qtyRow) {
      qtyRow.style.display = isSelected ? 'flex' : 'none';
      if (isSelected) qtyRow.querySelector('.qty-val').textContent = sel[id].qty;
    }
  });
  updateSummary();
  updateCartBadge();
}

function updateSummary() {
  const container = document.getElementById('summary-items');
  if (!container) return;

  const keys = Object.keys(sel);
  if (keys.length === 0) {
    container.innerHTML = '<div class="sum-empty" id="sum-empty">No dishes selected yet.<br>Go to the Menu to choose.</div>';
    return;
  }

  let html = '';
  keys.forEach(function(id) {
    const item = sel[id];
    html += '<div class="sum-item">'
      + '<span>' + item.name + (item.price ? ' (' + item.price + ')' : '') + '</span>'
      + '<span class="sum-qty">x' + item.qty + '</span>'
      + '</div>';
  });

  // Add total line
  const total = calcTotal();
  if (total > 0) {
    html += '<div class="sum-item" style="border-top:1px solid rgba(253,250,243,0.2); margin-top:8px; padding-top:12px; font-weight:500; color:var(--gold2);">'
      + '<span>Total (+ 10% tip)</span>'
      + '<span>' + total + ' MAD</span>'
      + '</div>';
  }

  container.innerHTML = html;
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  
  const count = Object.keys(sel).length;
  if (count > 0) {
    badge.style.display = 'flex';
    badge.textContent = count;
  } else {
    badge.style.display = 'none';
  }
}

// ─── FORM HELPERS ───
function getField(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(str) {
  if (!str) return '-';
  const [h, m] = str.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return hour12 + ':' + m + ' ' + ampm;
}

function calcTotal() {
  let sum = 0;
  Object.values(sel).forEach(function(item) {
    if (item.price) {
      // Extracts only numbers from string like "50 MAD"
      const priceNum = parseInt(item.price.replace(/\D/g, '')) || 0; 
      sum += priceNum * item.qty;
    }
  });
  // Add 10% service tip
  return Math.round(sum * 1.1);
}

// ─── BUILD WHATSAPP MESSAGE ───
function buildWAMsg() {
  const n     = getField('contact-name') || '-';
  const s     = getField('group-size')   || '-';
  const d     = formatDate(getField('arrival-date'));
  const t     = formatTime(getField('arrival-time'));
  const nt    = getField('notes');
  const total = calcTotal();

  const sep   = '\n-------------------';
  const order = Object.keys(sel).map(function(id) {
    return '* ' + sel[id].name + (sel[id].price ? ' (' + sel[id].price + ')' : '') + ' x' + sel[id].qty;
  }).join('\n');

  const totalLine = total > 0 ? sep + '\n*TOTAL: ' + total + ' MAD* (+ 10% service tip)' : '';
  const notesLine = nt ? sep + '\nNotes: ' + nt : '';

  return '*Golden Afouss -- Group Booking*'
    + sep
    + '\nContact: ' + n
    + '\nGroup: '   + s + ' people'
    + '\nDate: '    + d
    + '\nTime: '    + t
    + sep
    + '\n*Order:*\n' + (order || 'No items')
    + totalLine
    + notesLine
    + sep
    + '\nSent from goldenafouss.com';
}

// ─── SEND ACTIONS ───
function sendWA(e) {
  e.preventDefault();
  if (Object.keys(sel).length === 0) {
    showToast('Please select items from the menu first.');
    return;
  }
  const msg = buildWAMsg();
  const phone = '212639339952'; // Your WhatsApp number
  const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

function sendEM(e) {
  e.preventDefault();
  if (Object.keys(sel).length === 0) {
    showToast('Please select items from the menu first.');
    return;
  }
  const msg = buildWAMsg();
  const subject = 'New Group Booking from Golden Afouss Website';
  const mailto = 'mailto:goldenafouss@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
  window.location.href = mailto;
}

function clearAll() {
  if (!confirm('Clear all selected items?')) return; // Simple confirmation
  sel = {};
  save();
  syncUI();
  showToast('Selection cleared.');
}

// ─── LANGUAGE TOGGLE ───
function setLang(lang, isInit) {
  currentLang = lang;
  if (!isInit) localStorage.setItem('ga_lang', lang);
  
  // Update buttons
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Toggle elements
  document.querySelectorAll('.en').forEach(function(el) {
    el.style.display = lang === 'en' ? '' : 'none';
  });
  document.querySelectorAll('.fr').forEach(function(el) {
    el.style.display = lang === 'fr' ? '' : 'none';
  });

  // Re-sync menu item names in memory if user changes language on menu page
  document.querySelectorAll('.menu-card').forEach(function(card) {
    const id = card.dataset.id;
    if (sel[id]) {
      sel[id].name = lang === 'fr' ? card.dataset.namefr : card.dataset.name;
      save(); // update localstorage with new language names
    }
  });
  updateSummary();
}

// ─── MOBILE MENU ───
function toggleMobileMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

// ─── TOAST NOTIFICATION ───
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}
