// ─── STATE & INIT ───
let sel = {};
let currentLang = 'en';

function safeGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } 
  catch(e) { return fallback; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } 
  catch(e) { /* Silent fail if storage is full or blocked */ }
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    sel = safeGet('ga_sel', {});
    currentLang = safeGet('ga_lang', 'en');
    setLang(currentLang, true); 
    syncUI();
  } catch (e) {
    console.error("Init error:", e);
  }
});

// ─── MENU VALIDATION (Check before proceeding) ───
function checkProceed(e) {
  if (Object.keys(sel).length === 0) {
    e.preventDefault();
    showToast('Please select at least one item from the menu before proceeding.');
  }
}

// ─── MENU TOGGLE & QUANTITY ───
function toggleItem(card) {
  try {
    const id = card.dataset.id;
    if (!id) return;
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
    save();
    updateSummary();
    updateCartBadge();
  } catch (e) { showToast('Error updating quantity.'); }
}

// ─── SAVE & SYNC UI ───
function save() { 
  safeSet('ga_sel', sel); 
  syncUI(); 
}

function syncUI() {
  try {
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
  } catch (e) { console.error("UI Sync error:", e); }
}

function updateSummary() {
  const container = document.getElementById('summary-items');
  if (!container) return;
  try {
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
    const total = calcTotal();
    if (total > 0) {
      html += '<div class="sum-item" style="border-top:1px solid rgba(253,250,243,0.2); margin-top:8px; padding-top:12px; font-weight:500; color:var(--gold2);">'
        + '<span>Total (+ 10% tip)</span>'
        + '<span>' + total + ' MAD</span>'
        + '</div>';
    }
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
      const priceNum = parseInt(item.price.replace(/\D/g, '')) || 0; 
      sum += priceNum * item.qty;
    }
  });
  return Math.round(sum * 1.1);
}

// ─── STRICT VALIDATION GATEKEEPER ───
function validateBooking() {
  // 1. Check Items
  if (Object.keys(sel).length === 0) {
    showToast('Please select items from the menu first.');
    return false;
  }
  // 2. Check Name
  if (!getField('contact-name')) {
    showToast('Please enter the Contact Name.');
    // Optional: focus on the missing field
    document.getElementById('contact-name').focus();
    return false;
  }
  // 3. Check Group Size
  const size = parseInt(getField('group-size'));
  if (!size || size < 1) {
    showToast('Please enter a valid Group Size.');
    document.getElementById('group-size').focus();
    return false;
  }
  // 4. Check Date
  if (!getField('arrival-date')) {
    showToast('Please select an Arrival Date.');
    document.getElementById('arrival-date').focus();
    return false;
  }
  // 5. Check Time
  if (!getField('arrival-time')) {
    showToast('Please select an Arrival Time.');
    document.getElementById('arrival-time').focus();
    return false;
  }
  
  return true; // All checks passed
}

// ─── CLEAN MESSAGE BUILDER ───
function buildWAMsg() {
  const n     = getField('contact-name');
  const s     = getField('group-size');
  const d     = formatDate(getField('arrival-date'));
  const t     = formatTime(getField('arrival-time'));
  const nt    = getField('notes');
  const total = calcTotal();

  const sep   = '\n─────────────────────';
  
  let orderLines = '';
  Object.keys(sel).forEach(function(id) {
    orderLines += '\n- ' + sel[id].name + (sel[id].price ? ' (' + sel[id].price + ')' : '') + ' x' + sel[id].qty;
  });

  let msg = 'Golden Afouss - Group Booking'
    + sep
    + '\nContact: ' + n
    + '\nGroup: '   + s + ' people'
    + '\nDate: '    + d
    + '\nTime: '    + t
    + sep
    + '\nORDER:' + (orderLines || '\n- No items selected')
    + sep;

  if (total > 0) {
    msg += '\nTOTAL: ' + total + ' MAD (Includes 10% service tip)';
  }
  if (nt) {
    msg += sep + '\nNotes: ' + nt;
  }
  msg += sep + '\nSent from goldenafouss.com';
  return msg;
}

// ─── SEND ACTIONS (Now using Validation) ───
function sendWA(e) {
  e.preventDefault();
  if (!navigator.onLine) return showToast('You are offline. Please check your internet connection.');
  if (!validateBooking()) return; // Gatekeeper
  
  try {
    const msg = buildWAMsg();
    const phone = '212639339952'; 
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
  } catch (e) {
    showToast('Error opening WhatsApp.');
  }
}

function sendEM(e) {
  e.preventDefault();
  if (!navigator.onLine) return showToast('You are offline. Please check your internet connection.');
  if (!validateBooking()) return; // Gatekeeper
  
  try {
    const msg = buildWAMsg();
    const subject = 'New Group Booking from Golden Afouss Website';
    window.location.href = 'mailto:goldenafouss@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
  } catch (e) {
    showToast('Error opening Email app.');
  }
}

// ─── PRINT RECEIPT (Clean Format) ───
function printReceipt() {
  if (!validateBooking()) return; // Gatekeeper

  try {
    const n  = getField('contact-name');
    const s  = getField('group-size');
    const d  = formatDate(getField('arrival-date'));
    const t  = formatTime(getField('arrival-time'));
    const nt = getField('notes');
    const total = calcTotal();

    let orderLines = '';
    Object.keys(sel).forEach(function(id) {
        orderLines += '<tr><td style="padding:6px 0; border-bottom:1px solid #eee;">' + sel[id].name + (sel[id].price ? ' (' + sel[id].price + ')' : '') + '</td><td style="text-align:right; padding:6px 0; border-bottom:1px solid #eee;">x' + sel[id].qty + '</td></tr>';
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Golden Afouss - Booking Receipt</title>
      <style>body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;color:#333;}h2{color:#B8873A;margin-bottom:5px;}p{font-size:14px;line-height:1.5;}table{width:100%;border-collapse:collapse;margin:20px 0;} .total{font-weight:bold;font-size:18px;border-top:2px solid #333;padding-top:10px;} .notes{margin-top:20px;padding:10px;background:#f9f9f9;border-left:3px solid #B8873A;}</style>
      </head><body>
      <h2>Golden Afouss</h2>
      <p><strong>Booking Receipt</strong></p>
      <hr>
      <p><strong>Contact:</strong> ${n}<br><strong>Group Size:</strong> ${s} people<br><strong>Date:</strong> ${d}<br><strong>Time:</strong> ${t}</p>
      <table>${orderLines}</table>
      <div class="total">Total: ${total} MAD <br><span style="font-size:12px;font-weight:normal;">(Includes 10% service tip)</span></div>
      ${nt ? '<div class="notes"><strong>Notes:</strong><br>' + nt + '</div>' : ''}
      <hr><p style="text-align:center;font-size:12px;color:#888;">Golden Afouss - Atlas Mountains Road</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (e) {
    showToast('Error generating print receipt.');
  }
}

function clearAll() {
  if (!confirm('Clear all selected items?')) return; 
  sel = {};
  save();
  showToast('Selection cleared.');
}

// ─── LANGUAGE TOGGLE ───
function setLang(lang, isInit) {
  currentLang = lang;
  if (!isInit) safeSet('ga_lang', lang);
  
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('.en').forEach(function(el) { el.style.display = lang === 'en' ? '' : 'none'; });
  document.querySelectorAll('.fr').forEach(function(el) { el.style.display = lang === 'fr' ? '' : 'none'; });

  document.querySelectorAll('.menu-card').forEach(function(card) {
    const id = card.dataset.id;
    if (sel[id]) {
      sel[id].name = lang === 'fr' ? card.dataset.namefr : card.dataset.name;
      safeSet('ga_sel', sel);
    }
  });
  updateSummary();
}

// ─── MOBILE MENU ───
function toggleMobileMenu() {
  const nav = document.getElementById('nav-links');
  if(nav) nav.classList.toggle('open');
}

// ─── TOAST NOTIFICATION ───
function showToast(msg) {
  try {
    const t = document.getElementById('toast');
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 3500);
  } catch (e) {
    alert(msg);
  }
}
