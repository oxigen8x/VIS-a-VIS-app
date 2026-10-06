/*
 * Logica pura (senza DOM): occorrenze degli eventi, orari, generazione .ics.
 * Funziona sia nel browser (window.VisaviCore) sia in Node (per i test).
 */
(function (root) {
  // Il festival si svolge dal 12 al 18 ottobre 2026: ora legale (CEST, UTC+2).
  // L'ora legale termina il 25 ottobre 2026, quindi l'offset è costante per tutto il programma.
  var TZ_OFFSET_H = 2;
  var DEFAULT_MIN = 60;

  function startMs(d, t) {
    var p = d.split('-'), q = t.split(':');
    return Date.UTC(+p[0], +p[1] - 1, +p[2], +q[0] - TZ_OFFSET_H, +q[1]);
  }

  function buildOccurrences(data) {
    var byId = {};
    data.events.forEach(function (e) { byId[e.id] = e; });
    var occ = [];
    data.events.forEach(function (ev) {
      if (ev.child || !ev.sessions) return;
      ev.sessions.forEach(function (s) {
        var minutes = ev.icsMin || ev.dur || DEFAULT_MIN;
        var start = startMs(s.d, s.t);
        occ.push({
          key: ev.id + '@' + s.d,
          ev: ev, d: s.d, t: s.t, v: s.v,
          start: start, end: start + minutes * 60000,
          durKnown: !!ev.dur
        });
      });
    });
    occ.sort(function (a, b) { return a.start - b.start || a.ev.id.localeCompare(b.ev.id); });
    var map = {};
    occ.forEach(function (o) { map[o.key] = o; });
    return { list: occ, map: map, byId: byId };
  }

  function uniqueDays(list) {
    var seen = {}, out = [];
    list.forEach(function (o) { if (!seen[o.d]) { seen[o.d] = 1; out.push(o.d); } });
    return out;
  }

  // ---------- iCalendar ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtUtc(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function icsEsc(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }
  // RFC 5545: righe max 75 ottetti, continuazione con CRLF + spazio. Piega per caratteri
  // senza spezzare coppie surrogate né sequenze multi-byte.
  function fold(line) {
    var enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    function bytes(s) { return enc ? enc.encode(s).length : s.length; }
    var out = [], cur = '', limit = 74;
    var chars = Array.from(line);
    for (var i = 0; i < chars.length; i++) {
      if (bytes(cur + chars[i]) > limit) { out.push(cur); cur = ' ' + chars[i]; limit = 74; }
      else cur += chars[i];
    }
    out.push(cur);
    return out.join('\r\n');
  }

  /*
   * items: [{ uid, summary, start, end?, location, description, url, leadMin?, alarmText? }]
   * `end` omesso => nessun DTEND (evento istantaneo, usato per le corse della navetta).
   */
  function buildICS(items, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Visavi Gorizia Dance Festival//Programma 2026//IT',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEsc(opts.calName || 'Visavì Gorizia Dance Festival 2026'),
      'X-WR-TIMEZONE:Europe/Rome'];
    items.forEach(function (it) {
      L.push('BEGIN:VEVENT');
      L.push('UID:' + it.uid + '@visavi2026.goriziadancefestival');
      L.push('DTSTAMP:' + fmtUtc(now));
      L.push('DTSTART:' + fmtUtc(it.start));
      if (it.end) L.push('DTEND:' + fmtUtc(it.end));
      L.push('SUMMARY:' + icsEsc(it.summary));
      if (it.location) L.push('LOCATION:' + icsEsc(it.location));
      if (it.description) L.push('DESCRIPTION:' + icsEsc(it.description));
      if (it.url) L.push('URL:' + it.url);
      if (it.leadMin != null) {
        L.push('BEGIN:VALARM');
        L.push('TRIGGER:-PT' + it.leadMin + 'M');
        L.push('ACTION:DISPLAY');
        L.push('DESCRIPTION:' + icsEsc(it.alarmText || it.summary));
        L.push('END:VALARM');
      }
      L.push('END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  function googleCalUrl(it) {
    var q = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent(it.summary),
      'dates=' + fmtUtc(it.start) + '/' + fmtUtc(it.end || it.start + 30 * 60000),
      'location=' + encodeURIComponent(it.location || ''),
      'details=' + encodeURIComponent((it.description || '') + (it.url ? '\n' + it.url : ''))
    ];
    return 'https://calendar.google.com/calendar/render?' + q.join('&');
  }

  // Le sovrapposizioni si segnalano solo se la durata di entrambi è comunicata ufficialmente:
  // con durate stimate si rischierebbero falsi avvisi.
  function overlaps(a, b) {
    if (!a.durKnown || !b.durKnown) return false;
    return a.start < b.end && b.start < a.end;
  }

  var api = {
    startMs: startMs, buildOccurrences: buildOccurrences, uniqueDays: uniqueDays,
    buildICS: buildICS, googleCalUrl: googleCalUrl, overlaps: overlaps, fmtUtc: fmtUtc,
    DEFAULT_MIN: DEFAULT_MIN
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VisaviCore = api;
})(typeof window !== 'undefined' ? window : this);
