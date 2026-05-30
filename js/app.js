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
