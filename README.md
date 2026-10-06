# Visavì Gorizia Dance Festival 2026 — web app del programma

App web (PWA) in italiano, inglese e sloveno: programma completo con filtri, "I miei" (eventi seguiti con avviso),
promemoria nel calendario (.ics), navetta gratuita con mappa e orari, prezzi e punti vendita, informativa privacy.
Sito statico: nessun server applicativo, nessun database, nessun cookie, nessuna statistica, nessun servizio di terzi.

## 1. Prima di pubblicare sul vostro hosting (checklist)

- [ ] **Compilare `privacy` in `assets/data.js`**: titolare, sede, email privacy, hosting, data di revisione
      (DPO solo se designato). Finché sono vuoti la pagina `#/privacy` mostra "[da inserire]" evidenziato.
- [ ] **Far validare il testo dell'informativa** (`priv_*` in `assets/i18n.js`, IT/EN/SL) dal vostro consulente privacy / DPO.
- [ ] Caricare tutti i file (`index.html`, `sw.js`, `manifest.webmanifest`, `assets/`) nella cartella pubblica del sito,
      su HTTPS (obbligatorio per installazione e service worker).
- [ ] Far applicare le intestazioni in `server-headers.example.conf` (CSP completa, nosniff, no-referrer, HSTS, cache).
- [ ] Sull'hosting di produzione `?now=` è disattivato in automatico (funziona solo su github.io / localhost / file locale);
      verificare che in alto non compaia la barra gialla "TEST".
- [ ] Provare su un iPhone e su un Android reali: aggiunta al calendario, installazione, cambio lingua.
- [ ] Aggiungere il logo ufficiale Visavì se diverso da quello incluso (`assets/img/visavi-logo.png`, quadrato; icone in `assets/icons/`).

## 2. Pubblicare su GitHub Pages (solo per test)

1. Repository su GitHub con **tutto il contenuto di questa cartella** (inclusi `.nojekyll` e `assets/`).
2. Settings → Pages → Deploy from a branch → `main` / root → Save.
3. L'app è su `https://<utente>.github.io/<repository>/`. Tutti i percorsi sono relativi: funziona anche in sottocartella.

## 3. Aggiornare il programma (variazioni, nuovi eventi)

Modifica solo **`assets/data.js`** (commentato) e ricarica il file:

- **Orario/luogo cambiato**: cambia `t` / `v` nella sessione dell'evento.
- **Nuovo evento**: copia un blocco in `events` e adatta `id`, `slug`, `sessions`, `price`…
- **Avviso in cima all'app** (variazioni dell'ultimo minuto): aggiungi un oggetto in `notices` con testo nelle 3 lingue;
  cambiando `id` riappare anche a chi lo aveva chiuso.
- **Navetta**: array `shuttle`. Aggiorna anche `updated` (data nel footer).

Chi ha già aperto l'app riceve la versione nuova al successivo accesso con connessione (service worker "rete prima").
Importante: i file `.ics` già aggiunti ai calendari **non** si aggiornano da soli — per le variazioni usare gli avvisi.
Se cambi la struttura dei file incrementa `CACHE` in `sw.js`.

## 4. Dati personali e sicurezza (sintesi tecnica)

- **Dove stanno i dati dell'utente**: solo nel `localStorage` del suo browser, chiavi `visavi.*`: eventi seguiti e preavviso
  (`visavi.favs`), preferenze (`visavi.settings`), lingua (`visavi.lang`), avvisi chiusi (`visavi.dismissed`) e già mostrati
  (`visavi.notified`). Nulla viene inviato al server; il titolare non può leggerli. Cancellabili dall'utente da
  `#/privacy` → "Cancella i miei dati" o dalle impostazioni del browser.
- **Richieste esterne**: nessuna in caricamento (font incorporati). Solo se l'utente clicca un link (sito festival, Google Maps,
  Google Calendar, Typeform del PASS, tel/mail).
- **Calendario**: il `.ics` è generato nel browser (nessun upload). Il pulsante "Google Calendar" apre una pagina Google
  precompilata (titolo, data, luogo) solo al click.
- **Cookie / statistiche**: nessuno. Se in futuro si aggiungessero statistiche o servizi di terzi, cambia il quadro (consenso
  e aggiornamento dell'informativa) e va riaperta la valutazione privacy.
- **Sicurezza**: nessun login né dati di terzi; tutto il testo mostrato viene "escapato"; CSP restrittiva (solo risorse dello
  stesso sito) nel meta tag e, sul vostro server, come intestazione HTTP; link esterni con `rel=noopener` e `no-referrer`.
  Proteggere l'accesso a chi può caricare i file (e, su GitHub, account con verifica in due passaggi): chi può modificare
  i file modifica l'app.
- **Account/hosting**: GitHub Pages registra gli IP degli accessi; sul vostro hosting vale la vostra informativa e i vostri log.

## 5. Come funzionano gli avvisi

- **Calendario (affidabile)**: "Aggiungi al calendario" scarica un `.ics` con promemoria incluso (15 min – 1 giorno prima);
  funziona anche con app chiusa e telefono bloccato. "Aggiungi tutti" esporta tutti gli eventi seguiti.
- **In app**: banner quando l'app è aperta (o riaperta) entro la finestra di preavviso; opzionali le notifiche del browser,
  comunque solo ad app aperta (un sito web senza server di push non può fare di più).

## 6. Provare gli avvisi (solo su host di test)

Su GitHub Pages / localhost aggiungi `?now=` con data e ora UTC: `index.html?now=2026-10-14T18:30:00Z` simula le 20:30 del
14 ottobre. Compare la barra gialla "TEST · ora simulata". Sull'hosting di produzione il parametro è ignorato.

## 7. Note sui contenuti

- Durate non comunicate (workshop, IO & NOI Academy Stage, Discovery tour, Playing Body): il calendario usa 60 minuti e lo
  segnala nella descrizione; le sovrapposizioni si segnalano solo con durate ufficiali.
- Discovery tour: orari/luoghi delle tre performance incluse non sono nel programma pubblico → rimando alla pagina ufficiale.
- Visavì Breakfast (Parco Coronini): prezzo non indicato nella pagina Tickets → "Info sul sito".
- Mappe: le fermate si aprono con la ricerca di Google Maps per nome (nessuna coordinata inserita a mano).

## Fonti e licenze

Dati da goriziadancefestival.it (Programma, Tickets, Bus navetta gratuito, IT/EN/SL), consultate il 6 ottobre 2026.
Font Bebas Neue e Inter (SIL Open Font License 1.1) incorporati in `assets/fonts/` con le licenze. Loghi: proprietà dei
rispettivi titolari (Visavì, Artisti Associati).
