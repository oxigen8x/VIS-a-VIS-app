/*
 * Visavì Gorizia Dance Festival 2026 — dati del programma.
 *
 * QUESTO È L'UNICO FILE DA MODIFICARE PER AGGIORNARE IL PROGRAMMA.
 * Fonte: goriziadancefestival.it (programma, tickets, shuttle bus) — aggiornato al 6 ottobre 2026.
 *
 * Orari: ora locale italiana (CEST, UTC+2). Date nel formato AAAA-MM-GG, orari HH:MM.
 */
(function (root) {
  var DATA = {
    updated: '2026-10-06',

    site: {
      base: 'https://goriziadancefestival.it',
      passUrl: 'https://lsaaonln6dn.typeform.com/to/sA8pUDAu',
      email: 'festival@artistiassociatigorizia.it',
      phone: '+39 0481 532317',
      phoneHref: '+390481532317',
      bookingPhone: '327.0575206',
      bookingPhoneHref: '+393270575206',
      sngPhone: '+386 53352247',
      sngPhoneHref: '+38653352247',
      sngEmail: 'blagajna@sng-ng.si',
      // slug delle pagine ufficiali per lingua
      shuttlePath: { it: 'shuttle-bus', en: 'free-shuttle-bus', sl: 'brezplacni-avtobusni-prevoz' },
      programPath: { it: 'programma', en: 'programme', sl: 'program' }
    },

    /*
     * IMMAGINI DEGLI SPETTACOLI (facoltative)
     * Copiare i file (JPG/WebP, ~800 px di larghezza, peso < 150 KB) in assets/img/events/ e
     * indicarli qui con l'id dell'evento, es.:  'capitolo-xv': 'capitolo-xv.jpg',
     * Senza immagine la scheda resta com'è. Usare solo immagini di cui avete i diritti.
     */
    images: {},

    /*
     * DATI PER L'INFORMATIVA PRIVACY (pagina #/privacy)
     * Lasciati VUOTI di proposito: finché sono vuoti la pagina mostra "[da inserire]" in evidenza.
     * Compilarli PRIMA di pubblicare e far validare il testo dal consulente privacy / DPO.
     */
    privacy: {
      controller: '',   // denominazione del titolare del trattamento
      address: '',      // sede legale
      email: '',        // contatto per la privacy
      dpo: '',          // DPO / RPD, se designato (se vuoto la riga non compare)
      hosting: '',      // chi ospita l'app (es. nome del fornitore di hosting)
      updated: '',      // data dell'ultima revisione dell'informativa (es. '2026-10-10')
      policyUrl: 'https://www.artistiassociatigorizia.it/privacy-policy/'  // informativa completa (link già presente sul sito)
    },

    /*
     * AVVISI / VARIAZIONI — compaiono in cima all'app finché non vengono chiusi dall'utente.
     * Esempio:
     * { id: 'v1', it: 'Lo spettacolo X inizia alle 21.15', en: 'Show X starts at 9.15 pm', sl: 'Predstava X se začne ob 21.15' }
     * Cambiando l'id, l'avviso riappare anche a chi l'aveva chiuso.
     */
    notices: [],

    cities: {
      gorizia: { it: 'Gorizia', en: 'Gorizia', sl: 'Gorizia' },
      novagorica: { it: 'Nova Gorica', en: 'Nova Gorica', sl: 'Nova Gorica' },
      gradisca: { it: 'Gradisca d’Isonzo', en: 'Gradisca d’Isonzo', sl: 'Gradisca d’Isonzo' },
      cormons: { it: 'Cormons', en: 'Cormons', sl: 'Cormons' },
      fiumicello: { it: 'Fiumicello Villa Vicentina', en: 'Fiumicello Villa Vicentina', sl: 'Fiumicello Villa Vicentina' },
      collio: { it: 'Collio italiano e sloveno', en: 'Italian and Slovenian Collio', sl: 'Italijanski in slovenski Collio' }
    },

    // gruppi usati dal filtro "Luogo"
    cityGroup: {
      gorizia: 'gorizia', novagorica: 'novagorica', gradisca: 'gradisca', cormons: 'cormons',
      fiumicello: 'other', collio: 'other'
    },

    venues: {
      borgo: { name: 'BorGo Live Academy', city: 'gorizia', addr: 'Via Rastello 29, Gorizia' },
      verdi: { name: 'Teatro Comunale Giuseppe Verdi', city: 'gorizia' },
      bratuz: { name: 'Kulturni center Lojze Bratuž', city: 'gorizia' },
      kdom: { name: 'Kulturni dom', city: 'gorizia' },
      coronini: { name: 'Parco Coronini Cronberg', city: 'gorizia' },
      sng: { name: 'SNG Slovensko narodno gledališče Nova Gorica', short: 'SNG Nova Gorica', city: 'novagorica', addr: 'Trg Edvarda Kardelja 5, Nova Gorica' },
      montessori: { name: 'Svet Montessori Hiša otrok Mila', city: 'novagorica' },
      gnuovo: { name: 'Nuovo Teatro Comunale', city: 'gradisca' },
      bergamas: { name: 'Sala Bergamas', city: 'gradisca' },
      cormonsTeatro: { name: 'Teatro Comunale', city: 'cormons' },
      leopardi: { name: 'Scuola primaria “G. Leopardi”', city: 'fiumicello' },
      collioVarie: { name: { it: 'Varie location', en: 'Various locations', sl: 'Različne lokacije' }, city: 'collio', nomap: true }
    },

    // categorie di prezzo (pagina Tickets)
    prices: {
      evening:   { full: 12, reduced: 8 },
      afternoon: { full: 8, reduced: 5 },
      single:    { single: 5 },
      tour:      { single: 24 },
      freeBooking: {},
      free: {},
      tbd: {}
    },

    /*
     * EVENTI
     * type: show | workshop | academy | tour | breakfast | contest | family
     * tag: premiere | preview | firstStudy   (opzionale)
     * dur: durata in minuti (omettere se non comunicata)
     * price: chiave di "prices"
     * credits: [[chiave, testo], ...]   works: [{ title, by, dur, tag, credit }]
     */
    events: [
      {
        id: 'io-noi-workshop', slug: 'io-noi-workshop', type: 'workshop',
        title: 'IO & NOI', by: 'Balletto di Roma (ITA) / Valerio Longo',
        sessions: [
          { d: '2026-10-12', t: '17:00', v: 'borgo' },
          { d: '2026-10-13', t: '17:00', v: 'borgo' },
          { d: '2026-10-14', t: '17:00', v: 'borgo' }
        ],
        price: 'freeBooking',
        note: {
          it: 'Posti limitati. Età minima 14+, è richiesta una formazione di base. Per gli interessati over 16, il workshop varrà come audizione per il CAP – Corso di Introduzione Professionale del Balletto di Roma.',
          en: 'Limited places. Minimum age 14+. Basic training required. For those over the age of 16 who are interested, the workshop will be considered as an audition for the CAP – Professional Introduction Course of the Balletto di Roma.',
          sl: 'Omejeno število mest. Najnižja starost 14+, potrebno je osnovno predznanje. Za zainteresirane, starejše od 16 let, bo delavnica veljala kot avdicija za CAP – poklicni uvodni tečaj Balletto di Roma.'
        }
      },
      {
        id: 'dancing-together', slug: 'dancing-together', type: 'workshop',
        title: 'Dancing Together', by: 'Compagnia Gipsy Raw (FRA)',
        sessions: [
          { d: '2026-10-14', t: '11:00', v: 'montessori' },
          { d: '2026-10-16', t: '14:30', v: 'leopardi' }
        ],
        price: 'freeBooking'
      },
      {
        id: 'io-e-noi', slug: 'io-e-noi', type: 'academy',
        title: 'IO & NOI', by: 'Balletto di Roma (ITA) / Valerio Longo',
        sessions: [{ d: '2026-10-14', t: '20:30', v: 'verdi' }],
        price: 'free',
        note: {
          it: 'Restituzione pubblica del lavoro svolto durante il workshop con Valerio Longo, con i partecipanti al workshop.',
          en: 'Public showing of the work developed during the workshop with Valerio Longo, performed by the workshop participants.',
          sl: 'Javna predstavitev dela, nastalega na delavnici z Valeriem Longom, z udeleženci delavnice.'
        }
      },
      {
        id: 'capitolo-xv', slug: 'capitolo-xv', type: 'show',
        title: 'Capitolo XV', by: 'Equilibrio Dinamico Dance Company (ITA) / (LA)HORDE / Jill Crovisier',
        sessions: [{ d: '2026-10-14', t: '21:00', v: 'verdi' }],
        dur: 55, price: 'evening',
        works: [
          { title: 'Mahalaga Landscapes', credit: { choreo: 'Jill Crovisier', music: 'Pol Belardi' } },
          { title: 'People Used to Die', credit: { choreo: 'Marine Brutti, Jonathan Debrouwer, Arthur Harel, Céline Signoret', music: 'Guillaume Rémus' } }
        ]
      },
      {
        id: 'au-dela-des-nuages', slug: 'au-dela-des-nuages', type: 'family',
        title: 'Au delà des nuages',
        sub: { it: 'Oltre le nuvole', en: 'Beyond the clouds', sl: 'Onkraj oblakov' },
        by: 'Compagnia Gipsy Raw (FRA) / Manon Mafrici / Pasquale Fortunato',
        sessions: [{ d: '2026-10-15', t: '10:30', v: 'bratuz' }],
        dur: 45, price: 'single', tag: 'premiere',
        credits: [['choreo', 'Manon Mafrici & Pasquale Fortunato'], ['perf', 'Manon Mafrici']]
      },
      {
        id: 'pozzi', slug: 'pozzi', type: 'show',
        title: 'Pozzi / Nulla dies sine linea', by: 'Michele Ermini (ITA) / Fuorimargine – Roberta Racis (ITA)',
        sessions: [{ d: '2026-10-15', t: '18:00', v: 'kdom' }],
        dur: 60, price: 'afternoon',
        works: [
          { title: 'Pozzi', by: 'Michele Ermini (ITA)', dur: 20, tag: 'preview', credit: { choreoDance: 'Michele Ermini' } },
          { title: 'Nulla dies sine linea', by: 'Fuorimargine – Centro di Produzione della danza in Sardegna (ITA) / Roberta Racis', dur: 40, credit: { choreoDance: 'Roberta Racis' } }
        ]
      },
      {
        id: 'mind-kontrol', slug: 'mind-kontrol', type: 'academy',
        title: '(M)IND (K)ONTROL', by: 'Francesco Brumat (ITA)',
        sessions: [{ d: '2026-10-15', t: '20:30', v: 'sng' }],
        dur: 3, icsMin: 30, price: 'free', shuttle: true,
        credits: [['choreoDance', 'Francesco Brumat']]
      },
      {
        id: 'borderless-body', slug: 'borderless-body', type: 'show',
        title: 'Borderless Body', by: 'MN Dance Company (SVN) / Michal Rynia / Nastja Bremec Rynia',
        sessions: [{ d: '2026-10-15', t: '21:00', v: 'sng' }],
        dur: 75, price: 'evening', shuttle: true,
        credits: [['choreoDir', 'Michal Rynia, Nastja Bremec Rynia']]
      },
      {
        id: 'special-k', slug: 'special-k', type: 'show',
        title: 'Special K', by: 'Compagnia Artemis Danza (ITA) / Davide Tagliavini',
        sessions: [{ d: '2026-10-16', t: '17:00', v: 'gnuovo' }],
        dur: 20, price: 'afternoon', shuttle: true, tag: 'firstStudy',
        credits: [['choreoDance', 'Davide Tagliavini']]
      },
      {
        id: 'bambu', slug: 'bambu', type: 'show',
        title: 'Bambu', by: 'ALDES (ITA) / Linda Sarki Johnson / Stéphanie Mwamba / Diana Odhiambo',
        sessions: [{ d: '2026-10-16', t: '18:00', v: 'bergamas' }],
        dur: 60, icsMin: 90,
        durNote: { it: '+ incontro con il pubblico', en: '+ public meeting', sl: '+ srečanje z občinstvom' },
        price: 'afternoon', shuttle: true,
        works: [
          { title: 'Mahaka', credit: { choreoDance: 'Linda Johnson Sarki' } },
          { title: 'Kizazi', credit: { choreoDance: 'Stéphanie Mwamba' } },
          { title: 'Thin Line', credit: { choreoDance: 'Diana Odhiambo' } }
        ]
      },
      {
        id: 'the-king-is-love', slug: 'the-king-is-love', type: 'academy',
        title: 'The King is Love', by: 'Marianna Basso (ITA)',
        sessions: [{ d: '2026-10-16', t: '20:30', v: 'verdi' }],
        dur: 12, icsMin: 30, price: 'free',
        credits: [['choreo', 'Marianna Basso'], ['perf', 'Elia Allemano, Filippo Bonelli']]
      },
      {
        id: 'venezuela', slug: 'venezuela', type: 'show',
        title: 'Venezuela', by: 'HNK Ivana pl. Zajca (HRV) / Ohad Naharin',
        sessions: [{ d: '2026-10-16', t: '21:00', v: 'verdi' }],
        dur: 75, price: 'evening', tag: 'premiere',
        credits: [['choreo', 'Ohad Naharin']]
      },
      {
        id: 'playing-body', slug: 'playing-body', type: 'workshop',
        title: 'Playing Body', by: 'Dancehood (CZE) / Yana Reutova',
        sessions: [{ d: '2026-10-17', t: '11:00', v: 'kdom' }],
        price: 'freeBooking',
        note: {
          it: 'Posti limitati. Età 3–11 anni.',
          en: 'Limited places. Ages 3–11.',
          sl: 'Omejeno število mest. Starost 3–11 let.'
        }
      },
      {
        id: 'visavi-discovery-tour', slug: 'visavi-discovery-tour', type: 'tour',
        title: 'Visavì Discovery Tour', by: 'Ivona (ITA) · ALDES (ITA) · La Rinascita (DEU)',
        sessions: [{ d: '2026-10-17', t: '12:00', v: 'collioVarie' }],
        price: 'tour',
        children: ['rilke-project-working-title', 'studio-per-un-incontro', 'nothing-happens']
      },
      {
        id: 'rilke-project-working-title', slug: 'rilke-project-working-title', type: 'tour', child: true,
        title: 'Angels’ Orders', sub: { it: 'The Rilke project', en: 'The Rilke project', sl: 'The Rilke project' },
        by: 'Ivona (ITA) / Pablo Girolami', dur: 30,
        credits: [['choreo', 'Pablo Girolami'], ['perf', 'Matilde Di Ciolo, Matteo Capetola'], ['music', 'Dj set Vermouth Gassosa']]
      },
      {
        id: 'studio-per-un-incontro', slug: 'studio-per-un-incontro', type: 'tour', child: true,
        title: 'Studio per un incontro', by: 'ALDES (ITA) / Martina Auddino / Nicolò Ricci', dur: 30,
        credits: [['choreoDance', 'Martina Auddino'], ['music', 'Nicolò Ricci (live)']]
      },
      {
        id: 'nothing-happens', slug: 'nothing-happens', type: 'tour', child: true,
        title: 'Nothing Happens', by: 'La Rinascita (DEU) / Carlos Aller / Cecilia Bartolino', dur: 35,
        credits: [['director', 'Carlos Aller'], ['choreo', 'Carlos Aller, Cecilia Bartolino']]
      },
      {
        id: 'la-lalangue', slug: 'la-lalangue', type: 'show',
        title: 'La Lalangue', by: 'Daniele Cipriani Entertainment (ITA) / Giacomo Luci',
        sessions: [{ d: '2026-10-17', t: '18:00', v: 'cormonsTeatro' }],
        dur: 50, price: 'afternoon',
        credits: [['choreoDir', 'Giacomo Luci'], ['perf', 'Giacomo Luci, Pierre Loup Morillon'], ['piano', 'Beatrice Barison']]
      },
      {
        id: 'fall', slug: 'fall', type: 'show',
        title: 'Fall', by: 'Ballet of Serbian National Theater (SRB) / Sidi Larbi Cherkaoui',
        sessions: [{ d: '2026-10-17', t: '21:00', v: 'sng' }],
        dur: 57, price: 'evening', shuttle: true, tag: 'premiere',
        credits: [['choreo', 'Sidi Larbi Cherkaoui'], ['music', 'Arvo Pärt']]
      },
      {
        id: 'rilke-project', slug: 'rilke-project', type: 'breakfast',
        title: 'Angels’ Orders', sub: { it: 'The Rilke project · Visavì Breakfast', en: 'The Rilke project · Visavì Breakfast', sl: 'The Rilke project · Visavì Breakfast' },
        by: 'Ivona (ITA) / Pablo Girolami',
        sessions: [{ d: '2026-10-18', t: '10:00', v: 'coronini' }],
        dur: 30, price: 'tbd',
        credits: [['choreo', 'Pablo Girolami'], ['perf', 'Matilde Di Ciolo, Matteo Capetola'], ['music', 'Dj set Vermouth Gassosa']]
      },
      {
        id: 'childhood-time', slug: 'childhood-time', type: 'family',
        title: 'Childhood Time', by: 'Dancehood (CZE) / Yana Reutova',
        sessions: [{ d: '2026-10-18', t: '11:00', v: 'kdom' }],
        dur: 45, price: 'single', tag: 'premiere',
        credits: [['choreo', 'Yana Reutova'], ['perf', 'Žaneta Musilová, Adriana Štefaňáková, Tereza Moulisová, Anastasiia Pavlovska']]
      },
      {
        id: 'visavi-experimental-contest', slug: 'visavi-experimental-contest', type: 'contest',
        title: 'Visavì Experimental Contest', by: 'Compagnia Bellanda (ITA)',
        sessions: [{ d: '2026-10-18', t: '15:00', v: 'bergamas' }],
        dur: 120, price: 'single',
        credits: [['jury', 'Pasquale Fortunato (Gipsy Raw), Matilde Molendi, Carlos Aller (La Rinascita) & Frantics dance company']]
      }
    ],

    /*
     * NAVETTA GRATUITA (pagina ufficiale "Bus navetta gratuito")
     */
    shuttleStops: {
      sa:     { name: 'Piazza Sant’Antonio', city: 'gorizia', q: 'Piazza Sant’Antonio, Gorizia' },
      sng:    { name: 'SNG Slovensko narodno gledališče Nova Gorica', short: 'SNG Nova Gorica', city: 'novagorica', q: 'SNG Nova Gorica, Trg Edvarda Kardelja 5, Nova Gorica' },
      gnuovo: { name: 'Nuovo Teatro', city: 'gradisca', q: 'Nuovo Teatro Comunale, Gradisca d’Isonzo' },
      verdi:  { name: 'Teatro Verdi', city: 'gorizia', q: 'Teatro Comunale Giuseppe Verdi, Gorizia' }
    },
    shuttle: [
      { d: '2026-10-15', t: '20:30', from: 'sa', to: 'sng' },
      { d: '2026-10-15', t: '22:30', from: 'sng', to: 'sa' },
      { d: '2026-10-16', t: '16:30', from: 'sa', to: 'gnuovo' },
      { d: '2026-10-16', t: '20:00', from: 'gnuovo', to: 'verdi' },
      { d: '2026-10-17', t: '20:15', from: 'sa', to: 'sng' },
      { d: '2026-10-17', t: '22:30', from: 'sng', to: 'sa' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.VISAVI_DATA = DATA;
})(typeof window !== 'undefined' ? window : this);
