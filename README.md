# Visavì Gorizia Dance Festival 2026 — web app del programma

App web (PWA) in italiano, inglese e sloveno: programma completo con filtri, "I miei" (eventi seguiti con avviso),
promemoria nel calendario (.ics), navetta gratuita con mappa e orari, prezzi e punti vendita.
Sito statico: nessun server, nessun database, nessun cookie di tracciamento. Dati dell'utente (eventi seguiti,
lingua) restano solo sul suo dispositivo.

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub (es. `visavi-2026`) e carica **tutto il contenuto di questa cartella**
   (`index.html`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, `assets/`).
2. Repository → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** →
   Branch: `main`, cartella `/ (root)` → **Save**.
3. Dopo circa un minuto l'app è online su `https://<utente>.github.io/<repository>/`.
4. (Facoltativo) Dominio proprio, es. `programma.goriziadancefestival.it`: aggiungilo in Settings → Pages →
   *Custom domain* e crea il record CNAME sul DNS verso `<utente>.github.io`.

Tutti i percorsi sono relativi: funziona sia in una sottocartella (`/visavi-2026/`) sia su un dominio.
Per il QR code usa l'indirizzo finale; l'app si può "installare" dal menu del browser (Aggiungi a schermata Home).

## Aggiornare il programma (variazioni, nuovi eventi)

Modifica solo **`assets/data.js`** (il file è commentato) e fai commit:

- **Orario/luogo cambiato**: cambia `t` / `v` nella sessione dell'evento.
- **Nuovo evento**: copia un blocco in `events` e adatta `id`, `slug`, `sessions`, `price`…
- **Avviso in cima all'app** (es. variazione dell'ultimo minuto): aggiungi un oggetto in `notices` con testo
  nelle tre lingue; cambiando `id` riappare anche a chi lo aveva chiuso.
- **Navetta**: array `shuttle`.
- Aggiorna `updated` (data mostrata nel footer).

Chi ha già aperto l'app riceve la versione nuova al successivo accesso con connessione
(il service worker prova prima la rete e usa la copia offline solo se manca la rete).
Se cambi la struttura dei file, incrementa `CACHE` in `sw.js`.

## Come funzionano gli avvisi

- **Calendario (affidabile)**: "Aggiungi al calendario" scarica un `.ics` con promemoria incluso (15 min – 1 giorno
  prima); funziona anche con l'app chiusa e il telefono bloccato. "Aggiungi tutti" esporta tutti gli eventi seguiti.
- **In app**: se l'app è aperta (o riaperta) appare un banner quando si entra nella finestra di preavviso.
  Opzionali le notifiche del browser, sempre e solo ad app aperta (limite dei siti web senza server di push).

## Provare gli avvisi senza aspettare il festival

Aggiungi `?now=` all'indirizzo con una data/ora UTC: es. `index.html?now=2026-10-14T18:30:00Z`
simula le 20:30 del 14 ottobre. Utile anche per mostrare l'app durante una demo.

## Da verificare / personalizzare

- **Logo**: l'intestazione usa un marchio tipografico "Visavì" (Bebas Neue). Per usare il logo ufficiale
  di Artisti Associati, aggiungilo in `assets/` e sostituisci `.brand` in `renderTop()` (`assets/app.js`).
- **Durate**: dove il sito non indica la durata (workshop, IO & NOI Academy Stage, Discovery tour, Playing Body)
  il calendario usa 60 minuti e lo segnala nella descrizione; le sovrapposizioni si segnalano solo con durate ufficiali.
- **Discovery tour**: orari e luoghi delle tre performance incluse non sono nel programma pubblico;
  l'app rimanda alla pagina ufficiale.
- **Breakfast (Parco Coronini)**: il prezzo non è indicato nella pagina Tickets, l'app scrive "Info sul sito".
- Mappe: le fermate si aprono con la ricerca di Google Maps per nome (nessuna coordinata inserita a mano).

## Fonti dei dati

goriziadancefestival.it — pagine Programma, Tickets e Bus navetta gratuito (IT/EN/SL), consultate il 6 ottobre 2026.

## Licenze dei font

Bebas Neue e Inter (SIL Open Font License 1.1), incorporati in `assets/fonts/` con le rispettive licenze.
