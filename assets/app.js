/* Visavì Gorizia Dance Festival 2026 — web app del programma. */
(function () {
  'use strict';

  var DATA = window.VISAVI_DATA, I18N = window.VISAVI_I18N, Core = window.VisaviCore;
  var OCC = Core.buildOccurrences(DATA);
  var DAYS = Core.uniqueDays(OCC.list);
  var LEADS = [15, 30, 60, 120, 1440];
  var LOCALES = { it: 'it-IT', en: 'en-GB', sl: 'sl-SI' };
  var TABS = ['program', 'mine', 'shuttle', 'info'];
  var ROUTES = TABS.concat(['privacy']);

  // ---------- storage (mai bloccante) ----------
  function sget(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  function sset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modalità privata */ } }

  // ---------- tempo (con ?now=2026-10-14T19:00:00Z per provare gli avvisi) ----------
  var loadedAt = Date.now();
  // La simulazione dell'ora funziona SOLO su host di test (GitHub Pages, localhost, file locale):
  // sul sito di produzione il parametro viene ignorato.
  var TEST_HOST = /(^|\.)github\.io$|^localhost$|^127\.0\.0\.1$|^\[::1\]$|^$/;
  function isTestHost(h) { return TEST_HOST.test(h || ''); }
  var nowOverride = (function () {
    if (!isTestHost(location.hostname)) return null;
    var m = /[?&]now=([^&]+)/.exec(location.search);
    var ms = m ? Date.parse(decodeURIComponent(m[1])) : NaN;
    return isNaN(ms) ? null : ms;
  })();
  function nowMs() { return nowOverride == null ? Date.now() : nowOverride + (Date.now() - loadedAt); }

  // ---------- stato ----------
  function detectLang() {
    var p = /[?&]lang=(it|en|sl)/.exec(location.search);
    if (p) return p[1];
    var s = sget('visavi.lang', null);
    if (s && I18N[s]) return s;
    var n = (navigator.language || 'it').slice(0, 2).toLowerCase();
    return I18N[n] ? n : 'it';
  }
  var state = {
    lang: detectLang(),
    tab: 'program',
    day: 'all', city: 'all', type: 'all', free: false, q: '',
    open: {},
    favs: sget('visavi.favs', {}),
    settings: sget('visavi.settings', { lead: 60, notif: false }),
    dismissed: sget('visavi.dismissed', []),
    notified: sget('visavi.notified', {})
  };
  if (LEADS.indexOf(state.settings.lead) < 0) state.settings.lead = 60;
  function saveFavs() { sset('visavi.favs', state.favs); }
  function saveSettings() { sset('visavi.settings', state.settings); }

  // ---------- helpers ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) { return o && typeof o === 'object' ? (o[state.lang] || o.it || '') : (o || ''); }
  function t(key, vars) {
    var s = (I18N[state.lang] && I18N[state.lang][key]);
    if (s == null) s = I18N.it[key];
    if (s == null) return key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function ymd(d) { var p = d.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  function fmtDay(d, opts) {
    opts.timeZone = 'UTC';
    return new Intl.DateTimeFormat(LOCALES[state.lang], opts).format(ymd(d));
  }
  function longDay(d) { return cap(fmtDay(d, { weekday: 'long', day: 'numeric', month: 'long' })); }
  function shortDow(d) { return fmtDay(d, { weekday: 'short' }).replace('.', ''); }
  function dayNum(d) { return +d.split('-')[2]; }
  function idOf(key) { return 'c-' + key.replace(/[^a-z0-9]/gi, '_'); }
  function fold(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function leadText(min) { return t('lead_' + min); }

  var ICONS = {
    bell: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"/></svg>',
    bus: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 16V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a2 2 0 0 1-1 1.73V20a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2H8v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2.27A2 2 0 0 1 4 16Zm3-9v4h10V7H7Zm1.5 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm7 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z"/></svg>',
    ext: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59L8.3 14.29l1.41 1.42L19 6.41V10h2V3h-7ZM5 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-2v5H5V7h5V5H5Z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="m7 10 5 5 5-5H7Z"/></svg>',
    t_program: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h10v2H4v-2Z"/></svg>',
    t_mine: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.5-9.3C1.3 8.4 3.2 5 6.5 5c2 0 3.6 1 5.5 3 1.9-2 3.5-3 5.5-3 3.3 0 5.2 3.4 4 6.7C19.5 16.4 12 21 12 21Z"/></svg>',
    t_shuttle: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 16V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a2 2 0 0 1-1 1.73V20a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2H8v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2.27A2 2 0 0 1 4 16Zm3-9v4h10V7H7Zm1.5 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm7 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',
    t_info: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7Zm6-.5v11h2v-11H9Z"/></svg>'
  };

  // ---------- URL ----------
  function siteUrl(path) { return DATA.site.base + '/' + state.lang + '/' + path; }
  function evUrl(ev) { return siteUrl('evento-visavi/' + ev.slug + '/'); }
  function ticketsUrl() { return siteUrl('tickets/'); }
  function shuttleUrl() { return siteUrl(DATA.site.shuttlePath[state.lang] + '/'); }
  function mapsUrl(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }

  // ---------- venue / titoli ----------
  function cityName(c) { return L(DATA.cities[c]); }
  function venueFull(vk) { var v = DATA.venues[vk]; return L(v.name) + ', ' + cityName(v.city); }
  function venueShort(vk) { var v = DATA.venues[vk]; return v.short || L(v.name); }
  function venueMapQuery(vk) { var v = DATA.venues[vk]; return v.nomap ? null : (v.addr || (L(v.name) + ' ' + cityName(v.city))); }
  function fullTitle(ev) { return ev.title + (ev.sub ? ' – ' + L(ev.sub) : ''); }

  // ---------- seguiti / sovrapposizioni ----------
  function followed() {
    return Object.keys(state.favs).map(function (k) { return OCC.map[k]; }).filter(Boolean)
      .sort(function (a, b) { return a.start - b.start; });
  }
  function hasOverlap(o) {
    if (!state.favs[o.key]) return false;
    return followed().some(function (f) { return f.key !== o.key && Core.overlaps(o, f); });
  }
  function leadOf(key) { return (state.favs[key] && state.favs[key].lead) || state.settings.lead; }

  // ---------- calendario ----------
  function occItem(o, lead) {
    var ev = o.ev, d = [ev.by, evUrl(ev)];
    if (!o.durKnown) d.push(t('d_duration_unknown'));
    return {
      uid: o.key, summary: fullTitle(ev), start: o.start, end: o.end,
      location: venueFull(o.v), description: d.join('\n'), url: evUrl(ev),
      leadMin: lead, alarmText: t('alert_soon') + ': ' + fullTitle(ev) + ' · ' + o.t
    };
  }
  function download(name, text) {
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }
  function addOneToCalendar(key) {
    var o = OCC.map[key]; if (!o) return;
    download('visavi-' + o.ev.slug + '-' + o.d + '.ics', Core.buildICS([occItem(o, leadOf(key))], { now: Date.now() }));
  }
  function addAllToCalendar() {
    var items = followed().map(function (o) { return occItem(o, leadOf(o.key)); });
    if (items.length) download('visavi-2026-il-mio-programma.ics', Core.buildICS(items, { now: Date.now() }));
  }
  function addShuttleToCalendar(i) {
    var s = DATA.shuttle[i], a = DATA.shuttleStops[s.from], b = DATA.shuttleStops[s.to];
    var item = {
      uid: 'shuttle-' + s.d + '-' + s.t.replace(':', ''),
      summary: t('shuttle_cal_title') + ': ' + (a.short || a.name) + ' → ' + (b.short || b.name),
      start: Core.startMs(s.d, s.t),
      location: (a.short || a.name) + ', ' + cityName(a.city),
      description: (a.short || a.name) + ' (' + cityName(a.city) + ') → ' + (b.short || b.name) + ' (' + cityName(b.city) + ')\n' + shuttleUrl(),
      url: shuttleUrl(), leadMin: 30, alarmText: t('shuttle_cal_title') + ' · ' + s.t
    };
    download('visavi-navetta-' + s.d + '-' + s.t.replace(':', '') + '.ics', Core.buildICS([item], { now: Date.now() }));
  }

  // ---------- toast ----------
  function toast(html, o) {
    o = o || {};
    var box = $('#toasts'); if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast' + (o.alert ? ' toast-alert' : '');
    el.innerHTML = '<div class="toast-msg">' + html + '</div>' +
      (o.action ? '<button class="btn small" type="button" data-toast-action>' + esc(o.action.label) + '</button>' : '') +
      '<button class="toast-x" type="button" aria-label="' + esc(t('toast_close')) + '">×</button>';
    function close() { el.remove(); }
    el.querySelector('.toast-x').addEventListener('click', close);
    if (o.action) el.querySelector('[data-toast-action]').addEventListener('click', function () { o.action.run(); close(); });
    box.appendChild(el);
    if (!o.sticky) setTimeout(close, o.ms || 7000);
  }

  // ---------- promemoria in-app ----------
  function checkReminders() {
    var now = nowMs(), changed = false;
    Object.keys(state.favs).forEach(function (key) {
      var o = OCC.map[key]; if (!o) return;
      var lead = leadOf(key), nk = key + '|' + lead;
      var fireAt = o.start - lead * 60000;
      if (now >= fireAt && now < o.start + 15 * 60000 && !state.notified[nk]) {
        state.notified[nk] = 1; changed = true;
        var mins = Math.ceil((o.start - now) / 60000);
        var when = mins > 0 ? t('alert_in', { m: mins }) : t('alert_started');
        var line = '<strong>' + esc(t('alert_soon')) + ':</strong> ' + esc(fullTitle(o.ev)) + ' · ' + esc(o.t) + ' · ' + esc(venueShort(o.v)) + ' (' + esc(when) + ')';
        toast(line, { alert: true, sticky: true, action: { label: t('see_it'), run: function () { goTo(key); } } });
        if (state.settings.notif && 'Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
          try { new Notification(t('alert_soon') + ': ' + fullTitle(o.ev), { body: o.t + ' · ' + venueFull(o.v) + ' (' + when + ')', tag: nk, icon: 'assets/icons/icon-192.png' }); } catch (e) { /* non supportato */ }
        }
        if (navigator.vibrate) try { navigator.vibrate(120); } catch (e) { /* ignore */ }
      }
    });
    if (changed) sset('visavi.notified', state.notified);
  }

  // ---------- render: parti comuni ----------
  function renderTop() {
    var n = Object.keys(state.favs).filter(function (k) { return OCC.map[k]; }).length;
    var langs = ['it', 'en', 'sl'].map(function (l) {
      return '<button type="button" class="lang' + (l === state.lang ? ' on' : '') + '" data-action="lang" data-lang="' + l + '" aria-pressed="' + (l === state.lang) + '" lang="' + l + '">' + l.toUpperCase() + '</button>';
    }).join('');
    var tabs = TABS.map(function (k) {
      var on = k === state.tab;
      return '<a class="tab' + (on ? ' on' : '') + '" href="#/' + k + '"' + (on ? ' aria-current="page"' : '') + '>' +
        ICONS['t_' + k] + '<span>' + esc(t('tab_' + k)) + '</span>' +
        (k === 'mine' && n ? '<b class="badge" aria-label="' + n + '">' + n + '</b>' : '') + '</a>';
    }).join('');
    var testbar = nowOverride == null ? '' : '<div class="testbar">TEST · ora simulata · ' + esc(new Date(nowOverride).toISOString().slice(0, 16).replace('T', ' ')) + ' UTC</div>';
    $('#top').innerHTML = testbar +
      '<div class="top-in"><a class="brand" href="#/program" aria-label="Visavì Gorizia Dance Festival"><img src="assets/img/visavi-logo.png" width="42" height="42" alt=""><span class="brand-s">Gorizia Dance Festival</span></a>' +
      '<nav class="tabs" aria-label="' + esc(t('tabs_label')) + '">' + tabs + '</nav>' +
      '<div class="langs" role="group" aria-label="' + esc(t('lang_label')) + '">' + langs + '</div></div>';
  }

  function noticesHtml() {
    return (DATA.notices || []).filter(function (n) { return state.dismissed.indexOf(n.id) < 0; }).map(function (n) {
      return '<div class="notice" role="status"><p>' + esc(L(n)) + '</p><button type="button" class="toast-x" data-action="dismiss" data-id="' + esc(n.id) + '" aria-label="' + esc(t('notice_dismiss')) + '">×</button></div>';
    }).join('');
  }

  function footerHtml() {
    var d = new Intl.DateTimeFormat(LOCALES[state.lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(ymd(DATA.updated));
    return '<footer class="foot"><a class="foot-logo" href="https://www.artistiassociatigorizia.it/" target="_blank" rel="noopener"><span>' + esc(t('footer_by')) + '</span>' +
      '<img src="assets/img/artisti-associati.png" width="620" height="94" alt="Artisti Associati"></a>' +
      '<p>' + esc(t('footer_updated', { date: d })) + '</p><p>' + esc(t('footer_disclaimer')) + '</p>' +
      '<p class="foot-links"><a href="' + DATA.site.base + '/' + state.lang + '/" target="_blank" rel="noopener">goriziadancefestival.it ' + ICONS.ext + '</a>' +
      '<a href="#/privacy">' + esc(t('privacy_link')) + '</a></p></footer>';
  }

  // ---------- render: hero ----------
  function daysUntil(firstDay) {
    var n = nowMs() + 2 * 3600000; // ora italiana (CEST)
    var d = new Date(n), today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    var p = firstDay.split('-'), target = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    return Math.round((target - today) / 86400000);
  }
  function daysLabel(n) {
    if (state.lang === 'it') return n + (n === 1 ? ' giorno' : ' giorni');
    if (state.lang === 'en') return n + (n === 1 ? ' day' : ' days');
    var m = n % 100; return n + (m === 1 ? ' dan' : m === 2 ? ' dneva' : ' dni');
  }
  function nextUpHtml() {
    var now = nowMs(), list = OCC.list;
    var cur = list.filter(function (o) { return o.start <= now && now < o.end; });
    var nxt = list.filter(function (o) { return o.start > now; })[0];
    var head = '';
    if (!cur.length && !nxt) {
      return '<div class="nextup"><p class="nu-h">' + esc(t('ended_title')) + '</p><p class="nu-t">' + esc(t('ended_text')) + '</p></div>';
    }
    if (nxt && now < list[0].start) {
      var n = daysUntil(list[0].d);
      head = '<p class="nu-count">' + esc(n <= 0 ? t('starts_today') : t('starts_in', { n: daysLabel(n) })) + '</p>';
    }
    function row(o, label) {
      return '<button type="button" class="nu-row" data-action="goto" data-key="' + esc(o.key) + '"><span class="nu-l">' + esc(label) + '</span>' +
        '<span class="nu-time">' + esc(o.t) + '</span><span class="nu-main"><strong>' + esc(fullTitle(o.ev)) + '</strong>' +
        '<small>' + esc(longDay(o.d)) + ' · ' + esc(venueShort(o.v)) + '</small></span><span class="nu-go">' + esc(t('see_it')) + ' →</span></button>';
    }
    return '<div class="nextup">' + head + cur.map(function (o) { return row(o, t('now_label')); }).join('') + (nxt ? row(nxt, t('next_label')) : '') + '</div>';
  }

  // ---------- render: programma ----------
  function matches(o) {
    var ev = o.ev, v = DATA.venues[o.v];
    if (state.day !== 'all' && o.d !== state.day) return false;
    if (state.city !== 'all' && DATA.cityGroup[v.city] !== state.city) return false;
    if (state.type !== 'all' && ev.type !== state.type) return false;
    if (state.free && ev.price !== 'free' && ev.price !== 'freeBooking') return false;
    if (state.q) {
      var hay = fold([ev.title, ev.sub ? L(ev.sub) : '', ev.by, (ev.works || []).map(function (w) { return w.title + ' ' + (w.by || ''); }).join(' '), L(v.name), cityName(v.city)].join(' '));
      if (hay.indexOf(fold(state.q)) < 0) return false;
    }
    return true;
  }

  function creditLines(list) {
    return list.map(function (c) { return '<li><span>' + esc(t('c_' + c[0])) + '</span> ' + esc(c[1]) + '</li>'; }).join('');
  }
  function workCredit(obj) {
    return Object.keys(obj || {}).map(function (k) { return [k, obj[k]]; });
  }

  function detailsHtml(o) {
    var ev = o.ev, fav = state.favs[o.key], h = '';
    if (ev.note) h += '<p class="d-note">' + esc(L(ev.note)) + '</p>';
    if (ev.works) {
      h += '<h4>' + esc(t('d_works')) + '</h4><ul class="works">' + ev.works.map(function (w) {
        var meta = [w.by, w.dur ? w.dur + '’' : ''].filter(Boolean).join(' · ');
        return '<li><strong>' + esc(w.title) + '</strong>' + (w.tag ? ' <span class="chip chip-red">' + esc(t('tag_' + w.tag)) + '</span>' : '') +
          (meta ? '<small>' + esc(meta) + '</small>' : '') +
          (w.credit ? '<ul class="credits">' + creditLines(workCredit(w.credit)) + '</ul>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    if (ev.credits) h += '<ul class="credits">' + creditLines(ev.credits) + '</ul>';
    if (ev.children) {
      h += '<h4>' + esc(t('d_included')) + '</h4><ul class="works">' + ev.children.map(function (id) {
        var c = OCC.byId[id]; if (!c) return '';
        return '<li><strong>' + esc(fullTitle(c)) + '</strong><small>' + esc(c.by) + (c.dur ? ' · ' + c.dur + '’' : '') + '</small></li>';
      }).join('') + '</ul><p class="d-note">' + esc(t('d_included_note')) + '</p>';
    }
    var facts = [];
    if (ev.dur) facts.push(esc(t('d_duration')) + ': ' + ev.dur + '’' + (ev.durNote ? ' ' + esc(L(ev.durNote)) : ''));
    facts.push(esc(t('d_price')) + ': ' + esc(t('price_' + ev.price)));
    h += '<p class="d-facts">' + facts.join(' · ') + '</p>';
    if (ev.shuttle) h += '<p class="d-shuttle">' + ICONS.bus + ' ' + esc(t('d_shuttle')) + ' <a href="#/shuttle">' + esc(t('d_shuttle_link')) + '</a></p>';
    if (!o.durKnown) h += '<p class="d-small">' + esc(t('d_duration_unknown')) + '</p>';

    var item = occItem(o, leadOf(o.key));
    var mq = venueMapQuery(o.v);
    h += '<div class="d-actions">';
    if (fav) {
      h += '<label class="lead-sel"><span>' + esc(t('lead_label')) + '</span><select data-action="lead" data-key="' + esc(o.key) + '">' +
        LEADS.map(function (m) { return '<option value="' + m + '"' + (m === leadOf(o.key) ? ' selected' : '') + '>' + esc(leadText(m)) + '</option>'; }).join('') + '</select></label>';
    }
    h += '<button type="button" class="btn" data-action="ics" data-key="' + esc(o.key) + '">' + ICONS.cal + ' ' + esc(t('btn_cal')) + '</button>' +
      '<a class="btn ghost" href="' + esc(Core.googleCalUrl(item)) + '" target="_blank" rel="noopener">' + esc(t('btn_gcal')) + ' ' + ICONS.ext + '</a>';
    h += '</div><div class="d-links">' +
      '<a href="' + esc(evUrl(ev)) + '" target="_blank" rel="noopener">' + esc(t('btn_official')) + ' ' + ICONS.ext + '</a>' +
      (mq ? '<a href="' + esc(mapsUrl(mq)) + '" target="_blank" rel="noopener">' + ICONS.pin + ' ' + esc(t('btn_map')) + '</a>' : '') +
      (ev.price !== 'free' && ev.price !== 'freeBooking' ? '<a href="' + esc(ticketsUrl()) + '" target="_blank" rel="noopener">' + esc(t('btn_tickets')) + ' ' + ICONS.ext + '</a>' : '') +
      '</div>';
    return h;
  }

  function cardHtml(o) {
    var ev = o.ev, fav = state.favs[o.key], open = !!state.open[o.key], id = idOf(o.key);
    var chips = '<span class="chip">' + esc(t('type_' + ev.type)) + '</span>';
    if (ev.tag) chips += '<span class="chip chip-red">' + esc(t('tag_' + ev.tag)) + '</span>';
    if (ev.shuttle) chips += '<span class="chip chip-line">' + ICONS.bus + ' ' + esc(t('tag_shuttle')) + '</span>';
    var dur = ev.dur ? ev.dur + '’' : '';
    var ov = hasOverlap(o);
    return '<article class="card' + (fav ? ' is-fav' : '') + '" id="' + id + '" aria-labelledby="' + id + '-t">' +
      '<div class="c-time"><span class="c-t">' + esc(o.t) + '</span>' + (dur ? '<span class="c-d">' + esc(dur) + '</span>' : '') + '</div>' +
      '<div class="c-main"><div class="chips">' + chips + '</div>' +
      '<h3 id="' + id + '-t">' + esc(ev.title) + (ev.sub ? '<span class="c-sub"> – ' + esc(L(ev.sub)) + '</span>' : '') + '</h3>' +
      '<p class="c-by">' + esc(ev.by) + '</p>' +
      '<p class="c-where">' + ICONS.pin + ' ' + esc(venueShort(o.v)) + ' · ' + esc(cityName(DATA.venues[o.v].city)) + '</p>' +
      '<p class="c-price">' + esc(t('price_' + ev.price)) + '</p>' +
      (fav ? '<p class="c-rem">' + ICONS.bell + ' ' + esc(t('reminder_on', { lead: leadText(leadOf(o.key)) })) + '</p>' : '') +
      (ov ? '<p class="c-warn">⚠ ' + esc(t('overlap')) + '</p>' : '') +
      '<div class="c-actions"><button type="button" class="btn ' + (fav ? 'primary' : 'outline') + '" data-action="follow" data-key="' + esc(o.key) + '" aria-pressed="' + (!!fav) + '">' + ICONS.bell + ' ' + esc(fav ? t('btn_reminding') : t('btn_remind')) + '</button>' +
      '<button type="button" class="btn ghost" data-action="toggle" data-key="' + esc(o.key) + '" aria-expanded="' + open + '" aria-controls="' + id + '-d">' + esc(open ? t('btn_less') : t('btn_details')) + '<span class="chev' + (open ? ' up' : '') + '">' + ICONS.chev + '</span></button></div>' +
      '<div class="c-details" id="' + id + '-d"' + (open ? '' : ' hidden') + '>' + (open ? detailsHtml(o) : '') + '</div></div></article>';
  }

  function groupedCards(list) {
    var out = '', cur = '';
    list.forEach(function (o) {
      if (o.d !== cur) { cur = o.d; out += '<h2 class="day-h">' + esc(longDay(o.d)) + '</h2>'; }
      out += cardHtml(o);
    });
    return out;
  }

  function renderList() {
    var el = $('#list'); if (!el) return;
    var list = OCC.list.filter(matches);
    if (!list.length) {
      el.innerHTML = '<div class="empty"><p>' + esc(t('no_results')) + '</p><button type="button" class="btn outline" data-action="clear">' + esc(t('clear_filters')) + '</button></div>';
      return;
    }
    el.innerHTML = '<p class="count">' + esc(t('events_count', { n: list.length })) + '</p>' + groupedCards(list);
  }

  function filtersHtml() {
    var chips = '<button type="button" class="day' + (state.day === 'all' ? ' on' : '') + '" data-action="day" data-day="all"><span class="dow">&nbsp;</span><span class="dn">' + esc(t('all')) + '</span></button>' +
      DAYS.map(function (d) {
        return '<button type="button" class="day' + (state.day === d ? ' on' : '') + '" data-action="day" data-day="' + d + '" aria-pressed="' + (state.day === d) + '"><span class="dow">' + esc(shortDow(d)) + '</span><span class="dn">' + dayNum(d) + '</span></button>';
      }).join('');
    var cities = ['gorizia', 'novagorica', 'gradisca', 'cormons', 'other'];
    var types = ['show', 'family', 'academy', 'workshop', 'tour', 'breakfast', 'contest'];
    return '<div class="daystrip" role="group" aria-label="' + esc(t('tab_program')) + '"><div class="days">' + chips + '</div></div>' +
      '<div class="filters"><label class="f-search"><span class="sr">' + esc(t('search_label')) + '</span><input type="search" id="q" placeholder="' + esc(t('search_ph')) + '" value="' + esc(state.q) + '" autocomplete="off"></label>' +
      '<label class="f-sel"><span>' + esc(t('filter_city')) + '</span><select data-action="city"><option value="all">' + esc(t('city_all')) + '</option>' +
      cities.map(function (c) { return '<option value="' + c + '"' + (state.city === c ? ' selected' : '') + '>' + esc(t('city_' + c)) + '</option>'; }).join('') + '</select></label>' +
      '<label class="f-sel"><span>' + esc(t('filter_type')) + '</span><select data-action="type"><option value="all">' + esc(t('type_all')) + '</option>' +
      types.map(function (c) { return '<option value="' + c + '"' + (state.type === c ? ' selected' : '') + '>' + esc(t('type_' + c)) + '</option>'; }).join('') + '</select></label>' +
      '<label class="f-free"><input type="checkbox" data-action="free"' + (state.free ? ' checked' : '') + '> <span>' + esc(t('filter_free')) + '</span></label></div>';
  }

  function viewProgram() {
    return noticesHtml() +
      '<section class="hero"><p class="kicker">' + esc(t('hero_kicker')) + '</p>' +
      '<h1><span class="h1-a">Visavì</span><span class="h1-b">Gorizia Dance Festival</span></h1>' +
      '<p class="hero-dates">' + esc(t('hero_dates')) + '</p><p class="hero-tag">' + esc(t('hero_tagline')) + '</p>' +
      '<p class="hero-cities">' + esc(t('hero_cities')) + '</p>' +
      '<a class="btn primary big" href="' + esc(DATA.site.passUrl) + '" target="_blank" rel="noopener">' + esc(t('hero_pass')) + '</a>' +
      nextUpHtml() + '</section>' +
      filtersHtml() + '<div id="list" class="list"></div>' + footerHtml();
  }

  // ---------- render: i miei ----------
  function viewMine() {
    var list = followed(), h = noticesHtml() + '<h1 class="page-h">' + esc(t('mine_title')) + '</h1>';
    if (!list.length) {
      h += '<div class="empty big"><h2>' + esc(t('mine_empty_title')) + '</h2><p>' + esc(t('mine_empty')) + '</p>' +
        '<a class="btn primary" href="#/program">' + esc(t('mine_empty_cta')) + '</a></div>';
    } else {
      h += '<div class="panel"><label class="lead-sel"><span>' + esc(t('mine_lead')) + '</span><select data-action="defaultLead">' +
        LEADS.map(function (m) { return '<option value="' + m + '"' + (m === state.settings.lead ? ' selected' : '') + '>' + esc(leadText(m)) + '</option>'; }).join('') + '</select></label>' +
        '<button type="button" class="btn primary" data-action="icsAll">' + ICONS.cal + ' ' + esc(t('mine_add_all')) + '</button></div>';
      h += '<div class="list">' + groupedCards(list) + '</div>';
    }
    var notifBlock = '';
    if ('Notification' in window) {
      var perm = Notification.permission, on = state.settings.notif && perm === 'granted';
      notifBlock = '<div class="notif"><div><strong>' + esc(t('mine_notif')) + '</strong><small>' +
        esc(perm === 'denied' ? t('mine_notif_denied') : on ? t('mine_notif_on') : '') + '</small></div>' +
        (perm === 'denied' ? '' : '<button type="button" class="btn ' + (on ? 'primary' : 'outline') + '" data-action="notif" aria-pressed="' + on + '">' + esc(on ? t('btn_reminding') : t('mine_notif_off')) + '</button>') + '</div>';
    }
    h += '<aside class="panel info-panel"><h2>' + esc(t('mine_reliable_title')) + '</h2><p>' + esc(t('mine_reliable')) + '</p>' + notifBlock + '</aside>' + footerHtml();
    return h;
  }

  // ---------- render: navetta ----------
  function stopLink(id) {
    var s = DATA.shuttleStops[id];
    return '<a href="' + esc(mapsUrl(s.q)) + '" target="_blank" rel="noopener">' + esc(s.short || s.name) + '</a><small>' + esc(cityName(s.city)) + '</small>';
  }
  function shuttleMapSvg() {
    function stop(id, x, y, anchor, lx, ly) {
      var s = DATA.shuttleStops[id];
      return '<a href="' + esc(mapsUrl(s.q)) + '" target="_blank" rel="noopener"><circle class="m-stop" cx="' + x + '" cy="' + y + '" r="7"/>' +
        '<text class="m-lbl" x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '">' + esc(s.short || s.name) + '</text></a>';
    }
    function city(name, x, y, anchor) { return '<text class="m-city" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '">' + esc(name) + '</text>'; }
    return '<svg class="m-svg" viewBox="0 0 360 230" role="img" aria-label="' + esc(t('shuttle_map_title')) + '">' +
      '<line class="m-l1" x1="196" y1="122" x2="296" y2="76"/>' +
      '<line class="m-l2" x1="196" y1="122" x2="58" y2="178"/><line class="m-l2" x1="240" y1="164" x2="58" y2="178"/>' +
      city(cityName('novagorica'), 352, 30, 'end') + city(cityName('gorizia'), 196, 62, 'middle') + city(cityName('gradisca'), 8, 224, 'start') +
      stop('sng', 296, 76, 'end', 352, 104) + stop('sa', 196, 122, 'end', 184, 112) + stop('verdi', 240, 164, 'start', 252, 168) +
      stop('gnuovo', 58, 178, 'start', 8, 204) + '</svg>';
  }
  function viewShuttle() {
    var byDay = {};
    DATA.shuttle.forEach(function (s, i) { (byDay[s.d] = byDay[s.d] || []).push({ s: s, i: i }); });
    var h = noticesHtml() + '<h1 class="page-h">' + esc(t('shuttle_title')) + '</h1><p class="lead">' + esc(t('shuttle_intro')) + '</p>';
    h += '<section class="panel"><h2>' + esc(t('shuttle_map_title')) + '</h2>' + shuttleMapSvg() +
      '<ul class="legend"><li><i class="k1"></i>' + esc(t('leg_ng')) + '</li><li><i class="k2"></i>' + esc(t('leg_gr')) + '</li></ul>' +
      '<p class="d-small">' + esc(t('shuttle_map_note')) + '</p></section>';
    Object.keys(byDay).sort().forEach(function (d) {
      h += '<h2 class="day-h">' + esc(longDay(d)) + '</h2>';
      byDay[d].forEach(function (x) {
        h += '<div class="trip"><div class="trip-t"><span class="c-t">' + esc(x.s.t) + '</span><span class="c-d">' + esc(t('shuttle_depart')) + '</span></div>' +
          '<div class="trip-r"><div class="stop">' + stopLink(x.s.from) + '</div><span class="arrow" aria-hidden="true">→</span><div class="stop">' + stopLink(x.s.to) + '</div></div>' +
          '<button type="button" class="btn ghost small" data-action="icsShuttle" data-i="' + x.i + '">' + ICONS.cal + ' ' + esc(t('shuttle_cal')) + '</button></div>';
      });
    });
    var sh = OCC.list.filter(function (o) { return o.ev.shuttle; });
    if (sh.length) {
      h += '<h2 class="day-h">' + esc(t('shuttle_events')) + '</h2><div class="panel plain"><ul class="shl">' + sh.map(function (o) {
        return '<li><button type="button" class="linkbtn" data-action="goto" data-key="' + esc(o.key) + '"><span class="shl-when">' + esc(fmtDay(o.d, { day: 'numeric', month: 'short' })) + ' · ' + esc(o.t) + '</span> <strong>' + esc(o.ev.title) + '</strong> <small>' + esc(venueShort(o.v)) + '</small></button></li>';
      }).join('') + '</ul></div>';
    }
    h += '<p class="more"><a class="btn outline" href="' + esc(shuttleUrl()) + '" target="_blank" rel="noopener">' + esc(t('shuttle_official')) + ' ' + ICONS.ext + '</a></p>' + footerHtml();
    return h;
  }

  // ---------- render: info & biglietti ----------
  function titlesFor(price) {
    var seen = {}, out = [];
    DATA.events.forEach(function (e) { if (!e.child && e.price === price && !seen[e.id]) { seen[e.id] = 1; out.push(e.title); } });
    return out.join(', ');
  }
  function viewInfo() {
    var s = DATA.site, h = noticesHtml() + '<h1 class="page-h">' + esc(t('info_title')) + '</h1>';
    h += '<section class="pass"><div><p class="kicker">' + esc(t('info_pass_title')) + '</p><p class="pass-price">' + esc(t('info_pass_price')) + '</p><p>' + esc(t('info_pass_text')) + '</p></div>' +
      '<a class="btn primary big" href="' + esc(s.passUrl) + '" target="_blank" rel="noopener">' + esc(t('info_pass_btn')) + '</a></section>';
    function row(label, price, names) {
      return '<tr><th scope="row">' + esc(label) + (names ? '<small>' + esc(names) + '</small>' : '') + '</th><td>' + esc(price) + '</td></tr>';
    }
    h += '<section class="panel"><h2>' + esc(t('info_prices')) + '</h2><table class="prices"><tbody>' +
      row(t('cat_evening'), t('price_evening'), titlesFor('evening')) +
      row(t('cat_afternoon'), t('price_afternoon'), titlesFor('afternoon')) +
      row(t('cat_single'), t('price_single'), titlesFor('single')) +
      row(t('cat_tour'), t('price_tour'), '') +
      row(t('cat_workshop'), t('cat_workshop_price'), '') +
      row(t('cat_academy'), t('cat_academy_price'), '') + '</tbody></table>' +
      '<h3>' + esc(t('info_reduced_title')) + '</h3><p>' + esc(t('info_reduced')) + '</p></section>';
    h += '<section class="panel"><h2>' + esc(t('info_where_title')) + '</h2><ul class="where">' +
      '<li><strong>' + esc(t('info_online')) + '</strong><a href="' + esc(ticketsUrl()) + '" target="_blank" rel="noopener">' + esc(t('info_online_text')) + ' ' + ICONS.ext + '</a></li>' +
      '<li><strong>' + esc(t('info_presale')) + '</strong>' +
      '<span>' + esc(t('info_presale_borgo')) + '<small>' + esc(t('info_presale_borgo_hours')) + '</small></span>' +
      '<span>' + esc(t('info_presale_sng')) + '<small>' + esc(t('info_presale_sng_hours')) + ' · <a href="tel:' + s.sngPhoneHref + '">' + esc(s.sngPhone) + '</a> · <a href="mailto:' + s.sngEmail + '">' + esc(s.sngEmail) + '</a></small></span></li>' +
      '<li>' + esc(t('info_during')) + '</li></ul></section>';
    h += '<section class="panel"><h2>' + esc(t('info_contacts')) + '</h2><ul class="where">' +
      '<li><a href="tel:' + s.bookingPhoneHref + '">' + esc(s.bookingPhone) + '</a> <small>(' + esc(t('info_whatsapp')) + ')</small></li>' +
      '<li><a href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a></li>' +
      '<li><a href="mailto:' + s.email + '">' + esc(s.email) + '</a></li></ul>' +
      '<p><a class="btn outline" href="' + esc(s.base + '/' + state.lang + '/') + '" target="_blank" rel="noopener">' + esc(t('info_site')) + ' ' + ICONS.ext + '</a></p></section>' + footerHtml();
    return h;
  }

  // ---------- render: privacy ----------
  function ph(v) { return v ? esc(v) : '<mark class="todo">' + esc(t('todo')) + '</mark>'; }
  function viewPrivacy() {
    var p = DATA.privacy || {};
    var h = noticesHtml() + '<h1 class="page-h">' + esc(t('privacy_title')) + '</h1><p class="lead">' + esc(t('priv_intro')) + '</p>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_controller_h')) + '</h2><dl class="kv">' +
      '<dt>' + esc(t('priv_controller_lbl')) + '</dt><dd>' + ph(p.controller) + '</dd>' +
      '<dt>' + esc(t('priv_address_lbl')) + '</dt><dd>' + ph(p.address) + '</dd>' +
      '<dt>' + esc(t('priv_email_lbl')) + '</dt><dd>' + (p.email ? '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>' : ph('')) + '</dd>' +
      (p.dpo ? '<dt>' + esc(t('priv_dpo_lbl')) + '</dt><dd>' + esc(p.dpo) + '</dd>' : '') + '</dl></section>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_device_h')) + '</h2><p>' + esc(t('priv_device_p')) + '</p><ul>' +
      [1, 2, 3, 4].map(function (i) { return '<li>' + esc(t('priv_i' + i)) + '</li>'; }).join('') + '</ul><p>' + esc(t('priv_device_p2')) + '</p></section>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_none_h')) + '</h2><p>' + esc(t('priv_none_p')) + '</p></section>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_hosting_h')) + '</h2><p>' + esc(t('priv_hosting_a')) + ph(p.hosting) + esc(t('priv_hosting_b')) + '</p></section>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_links_h')) + '</h2><p>' + esc(t('priv_links_p')) + '</p></section>';
    h += '<section class="panel prose"><h2>' + esc(t('priv_rights_h')) + '</h2><p>' + esc(t('priv_rights_p')) + '</p>' +
      (p.policyUrl ? '<p><a href="' + esc(p.policyUrl) + '" target="_blank" rel="noopener">' + esc(t('priv_policy')) + ' ' + ICONS.ext + '</a></p>' : '') +
      '<p class="d-small">' + esc(t('priv_updated')) + ': ' + (p.updated ? esc(new Intl.DateTimeFormat(LOCALES[state.lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(ymd(p.updated))) : ph('')) + '</p></section>';
    h += '<section class="panel"><h2>' + esc(t('priv_clear_h')) + '</h2><p>' + esc(t('priv_clear_p')) + '</p><p class="d-facts">' +
      esc(t('priv_count', { n: Object.keys(state.favs).length })) + '</p><button type="button" class="btn outline" data-action="clearData">' + esc(t('priv_clear_btn')) + '</button></section>';
    return h + footerHtml();
  }
  function clearData() {
    if (!window.confirm(t('priv_clear_confirm'))) return;
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf('visavi.') === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { /* ignore */ }
    state.favs = {}; state.settings = { lead: 60, notif: false }; state.dismissed = []; state.notified = {}; state.open = {};
    renderTop(); renderView();
    toast(esc(t('priv_cleared')), { ms: 3500 });
  }

  // ---------- render: principale ----------
  function renderView() {
    var v = $('#view');
    v.innerHTML = state.tab === 'mine' ? viewMine() : state.tab === 'shuttle' ? viewShuttle() : state.tab === 'info' ? viewInfo() : state.tab === 'privacy' ? viewPrivacy() : viewProgram();
    if (state.tab === 'program') renderList();
  }
  function renderAll() {
    document.documentElement.lang = t('htmlLang');
    document.title = t('appTitle');
    var skip = $('.skip'); if (skip) skip.textContent = t('skip');
    renderTop(); renderView();
  }

  function setTab(tab) {
    if (ROUTES.indexOf(tab) < 0) tab = 'program';
    var changed = tab !== state.tab;
    state.tab = tab; renderAll();
    if (changed) window.scrollTo(0, 0);
  }
  function goTo(key) {
    var o = OCC.map[key]; if (!o) return;
    state.day = o.d; state.city = 'all'; state.type = 'all'; state.free = false; state.q = '';
    state.open[key] = true;
    var tabChanged = state.tab !== 'program';
    if (location.hash !== '#/program') { location.hash = '#/program'; }
    state.tab = 'program'; renderAll();
    var el = document.getElementById(idOf(key));
    if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, tabChanged ? 60 : 0);
  }

  // ---------- azioni ----------
  function follow(key) {
    var o = OCC.map[key]; if (!o) return;
    if (state.favs[key]) {
      delete state.favs[key]; saveFavs();
      toast(esc(t('unfollow_toast')), { ms: 2500 });
    } else {
      state.favs[key] = { lead: state.settings.lead }; saveFavs();
      toast('<strong>' + esc(fullTitle(o.ev)) + '</strong><br>' + esc(t('follow_toast', { lead: leadText(state.settings.lead) })) + ' ' + esc(t('follow_toast_cal')),
        { ms: 9000, action: { label: t('btn_cal'), run: function () { addOneToCalendar(key); } } });
      checkReminders();
    }
    renderTop();
    if (state.tab === 'program') renderList(); else renderView();
  }

  function onClick(e) {
    var el = e.target.closest('[data-action]'); if (!el) return;
    var a = el.getAttribute('data-action'), key = el.getAttribute('data-key');
    if (a === 'follow') follow(key);
    else if (a === 'toggle') { state.open[key] = !state.open[key]; if (state.tab === 'program') renderList(); else renderView(); var c = document.getElementById(idOf(key)); if (c && state.open[key]) { var r = c.getBoundingClientRect(); if (r.bottom > window.innerHeight) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }
    else if (a === 'ics') addOneToCalendar(key);
    else if (a === 'icsAll') addAllToCalendar();
    else if (a === 'icsShuttle') addShuttleToCalendar(+el.getAttribute('data-i'));
    else if (a === 'goto') goTo(key);
    else if (a === 'day') { state.day = el.getAttribute('data-day'); renderView(); }
    else if (a === 'clear') { state.day = 'all'; state.city = 'all'; state.type = 'all'; state.free = false; state.q = ''; renderView(); }
    else if (a === 'lang') { state.lang = el.getAttribute('data-lang'); sset('visavi.lang', state.lang); renderAll(); }
    else if (a === 'dismiss') { state.dismissed.push(el.getAttribute('data-id')); sset('visavi.dismissed', state.dismissed); renderView(); }
    else if (a === 'notif') toggleNotif();
    else if (a === 'clearData') clearData();
  }
  function onChange(e) {
    var el = e.target.closest('[data-action]'); if (!el) return;
    var a = el.getAttribute('data-action');
    if (a === 'city') { state.city = el.value; renderList(); }
    else if (a === 'type') { state.type = el.value; renderList(); }
    else if (a === 'free') { state.free = el.checked; renderList(); }
    else if (a === 'lead') {
      var key = el.getAttribute('data-key');
      if (state.favs[key]) { state.favs[key].lead = +el.value; saveFavs(); if (state.tab === 'program') renderList(); else renderView(); }
    } else if (a === 'defaultLead') {
      state.settings.lead = +el.value; saveSettings();
      Object.keys(state.favs).forEach(function (k) { state.favs[k].lead = state.settings.lead; }); saveFavs(); renderView();
    }
  }
  function toggleNotif() {
    if (!('Notification' in window)) return;
    if (state.settings.notif && Notification.permission === 'granted') { state.settings.notif = false; saveSettings(); renderView(); return; }
    var done = function (p) { state.settings.notif = p === 'granted'; saveSettings(); renderView(); };
    try {
      var r = Notification.requestPermission(done);
      if (r && r.then) r.then(done);
    } catch (e) { /* ignore */ }
  }

  // ---------- init ----------
  function readHash() { var m = /^#\/(\w+)/.exec(location.hash); return m ? m[1] : 'program'; }

  function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'q') { state.q = e.target.value; renderList(); }
    });
    window.addEventListener('hashchange', function () { setTab(readHash()); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') checkReminders(); });
    window.addEventListener('focus', checkReminders);
    state.tab = readHash();
    if (ROUTES.indexOf(state.tab) < 0) state.tab = 'program';
    renderAll();
    checkReminders();
    setInterval(checkReminders, 20000);
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline non disponibile */ });
    }
  }

  window.VisaviApp = { state: state, OCC: OCC, t: t, checkReminders: checkReminders, isTestHost: isTestHost };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
