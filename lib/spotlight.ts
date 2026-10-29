/* The two fine-tuned models shown on the front page and on their own pages
   (/modeller/pavo, /modeller/a), each against Bris as MET published it.
   Written for someone who has read nothing else on the site: every term is
   explained where it first appears. Numbers are the test year (1 August 2025
   to 6 September 2026, 259 178 station-days, +30 h), calibrated month-out
   unless said otherwise. /modeller has every model. */

export type Row = { label: string; bris: string; model: string; changed?: boolean };
export type Result = { label: string; value: string; good?: boolean; note?: string };

export type Spotlight = {
  id: string;
  name: string;
  subtitle: string;
  oneLiner: string;
  headline: { value: string; label: string };
  secondary: { value: string; label: string };
  story: string[];
  rows: Row[];
  results: Result[];
  strengths: string[];
  limits: string[];
  /* What the extra penalty counts, in a sentence, and how it gets there. */
  sees: { short: string; how: string };
  code: { threshold: string; weight: string };
  /* The same model for MET's Bris developers: exact settings and every
     number with its interval. Shown at /modeller/<id>?for=met. */
  expert: Expert;
};

export type ExpertResult = { label: string; value: string; ci?: string; good?: boolean; note?: string };

export type Expert = {
  tldr: string;
  threshold: string;
  gamma: string;
  measured: string;
  yaml: string;
  results: ExpertResult[];
  notes: string[];
};

const SHARED_ROWS: Row[] = [
  {
    label: "Hvem som laget den",
    bris: "Meteorologisk institutt (MET)",
    model: "vanlig Bris, trent videre i dette prosjektet",
    changed: true,
  },
  {
    label: "Ekstra trening",
    bris: "nei",
    model: "ja, på 18 måneder med værdata over Norden, oktober 2023 til mars 2025",
    changed: true,
  },
  {
    label: "Hvordan feil straffes",
    bris: "én poengsum for alle værtyper, pluss en for hvor detaljerte værkartene er",
    model: "den samme poengsummen for alle værtyper, uten den for detaljer",
    changed: true,
  },
];

const SHARED_TAIL: Row[] = [
  {
    label: "Hvor lenge den er trent videre",
    bris: "–",
    model: "2 000 runder, omtrent 18 timer på én kraftig grafikkprosessor",
    changed: true,
  },
  {
    label: "Selve modellen",
    bris: "et nevralt nettverk som ser værkart over Norden i detalj og resten av kloden grovere",
    model: "det samme nettverket, bare med justerte tall inni",
  },
  {
    label: "Hvordan varslene i testen ble laget",
    bris: "fire varsler samtidig, seks timer om gangen",
    model: "helt likt",
  },
];

export const SPOTLIGHT: Spotlight[] = [
  {
    id: "pavo",
    name: "Pavo",
    sees: {
      short: "all nedbør, uansett mengde",
      how: "Straffen sammenligner nedbøren modellen varslet med nedbøren som faktisk kom, på hvert punkt over Norden, akkurat som den vanlige poengsummen gjør. Ingenting filtreres bort. En feil på 2 mm i lett regn teller, og en feil på 30 mm i et styrtregn teller.",
    },
    code: { threshold: "ingen (−1 000 000)", weight: "39,09" },
    expert: {
      tldr: "bris-crpsfft finjustert 2 000 steg med afCRPS pluss et andre afCRPS-ledd på tp over LAM-nodene, uten terskel, γ = 39,09. Rå er Brier over 20 mm/døgn 6,5 % verre enn kontrollarmen (overvarsling), men etter isotonisk kalibrering 7,1 % bedre, og ROC-arealet går fra 0,851 til 0,908. Gjentatt med nytt seed: −6,6 %.",
      threshold: "−10⁶ (normalisert), så v(z) = z: leddet er afCRPS på rå tp",
      gamma: "39,09",
      measured: "Målt på CPU på de samme 23 ekstreme og 23 vanlige tilstandene som de andre armene: leddet er like stort som afCRPS på ekstreme tilstander ved γ* = 390,9 (median av forhold per tilstand 385,1), og Pavo bruker γ*/10. Uten terskel er leddet like stort på vanlige tilstander, så over hele treningsvinduet er det omtrent 5 % av tapet, mot omtrent 2 % for armene med terskel.",
      yaml: `training:
  max_steps: 2000
  lr: { rate: 3.75e-6, min: 3.75e-7, iterations: 3000, warmup: 100 }
  ensemble_size_per_device: 3
  training_loss:
    _target_: anemoi.training.losses.combined.CombinedLoss
    losses:
      - _target_: anemoi.training.losses.AlmostFairKernelCRPS
        alpha: 0.95
        scalers: [pressure_level, general_variable, nan_mask_weights, node_weights]
      - _target_: xbris.losses.TailWeightedKernelCRPS
        alpha: 0.95
        scalers: [pressure_level, general_variable, nan_mask_weights, lam_node_weights]
        tail_threshold: -1.0e6     # ingen terskel
        tail_variable: tp
        tail_index: 38
    scalers: ['*']
    loss_weights: [1.0, 39.09]`,
      results: [
        { label: "Kalibrert Brier, 20 mm, mot kontrollarmen", value: "−0,00154 (−7,1 %)", ci: "[−0,00218, −0,00100]", good: true, note: "primærendepunkt, plan låst på forhånd" },
        { label: "Ny trekning (seed 20261003) mot F", value: "−0,00143 (−6,6 %)", ci: "[−0,00205, −0,00091]", good: true, note: "replikasjon, egen låst plan" },
        { label: "Mot MEPS-ensemblet, 4 medlemmer fra 00 UTC", value: "+0,00028 (+1,4 %)", ci: "[−0,00039, +0,00105]", note: "ingen sikker forskjell; kontrollarmen +9,5 % [sikkert dårligere]" },
        { label: "Pavo + Pavo 2 (8) mot MEPS-ensemblet, 15 medlemmer", value: "+0,00172 (+9,3 %)", ci: "[+0,00100, +0,00255]", note: "MEPS med 15 medlemmer er bedre; ROC 0,938 mot 0,915" },
        { label: "Kalibrert Brier, 10 mm per 6 t, +12 t, mot kontrollarm + spektral", value: "−0,00055 (−5,3 %)", ci: "[−0,00109, −0,00013]", good: true, note: "timesmålerne, samme 241 453 måler-dager ved alle ledetider. Ved +36 t: −0,0 % [−3,8, +3,6], det låste hovedmålet er ikke avgjort. All nedbør (fair CRPS) +9,9 % [+5,6, +14,2] ved +36 t: varselet glir med rollout 1" },
        { label: "Begge trekningene sammen (8 medlemmer) mot kontrollarm + F", value: "−0,00162 (−7,6 %)", ci: "[−0,00224, −0,00109]", good: true, note: "utforskende; rå +0,00035 [−0,00052, +0,00116]; ROC 0,913 mot 0,860" },
        { label: "Kalibrering tilpasset valideringsperioden", value: "−0,00201 (−9,0 %)", ci: "[−0,00283, −0,00130]", good: true, note: "tabell fra apr–jul 2025 brukt uendret" },
        { label: "Bilineær punktuttrekk (gridpp-stil)", value: "−0,00146 (−6,8 %)", ci: "[−0,00210, −0,00091]", good: true },
        { label: "Kalibrert Brier, 10 mm", value: "−0,00184 (−3,7 %)", ci: "[−0,00292, −0,00074]", good: true },
        { label: "Kalibrert Brier, 50 mm", value: "−0,00005 (−2,4 %)", ci: "[−0,00012, +0,00003]", note: "603 hendelser, ikke avgjort" },
        { label: "Rå Brier, 20 mm", value: "0,02397 mot 0,02250", note: "+6,5 %, frekvensbias 1,41 ved 2 av 4 medlemmer" },
        { label: "ROC-areal, 20 mm", value: "0,908 mot 0,851", good: true, note: "vanlig Bris 0,808" },
        { label: "Stasjonens egen 99-persentil", value: "−0,00040 (−4,6 %)", ci: "[−0,00058, −0,00024]", good: true, note: "utforskende" },
        { label: "Kalibrert Brier, 20 mm, Pavo − A", value: "−0,00021", ci: "[−0,00064, +0,00021]", note: "ingen forskjell; rå er A bedre, +0,00235 [+0,00144, +0,00330]" },
        { label: "tp alle døgn: middel / observert", value: "×1,18", note: "×1,11 på ny trekning; kontrollarm ×0,96" },
        { label: "tp alle døgn, fair CRPS", value: "+2,9 %", ci: "[−0,3, +6,2] %", note: "ny trekning mot F: −0,4 % [−2,5, +1,8]" },
        { label: "2 m-temperatur, fair CRPS", value: "+0,0171 (+1,5 %)", ci: "[+0,0120, +0,0220]", note: "ny trekning +1,3 %; F −0,3 %" },
        { label: "10 m-vind, fair CRPS", value: "−0,0144 (−1,2 %)", ci: "[−0,0171, −0,0118]", good: true, note: "ny trekning −1,3 %" },
      ],
      notes: [
        "Kontrollarmen er identisk bortsett fra det andre leddet (sjekket med en diff av de komponerte Hydra-konfigurasjonene). Normaliseringen er arvet fra sjekkpunktet: bufferne er bit-like i kontrollarmen, Pavo og bris-crpsfft.",
        "Gevinsten etter kalibrering kommer fra oppløsning, ikke pålitelighet. Pavo legger 15 % av hendelsene over 20 mm i 0-av-4-kategorien, mot 27 % for kontrollarmen, men har fire ganger så stor pålitelighetsfeil før kalibrering.",
        "Fordelen holder med 16 medlemmer på 61 valideringsdøgn (kalibrert −6,1 %, intervallet berører null på så få døgn, som det også gjorde med 4), så den skyldes ikke bare at fire medlemmer gir grove sannsynligheter.",
      ],
    },
    subtitle: "Bris trent til å ta all nedbør mer på alvor",
    oneLiner:
      "Vanlig Bris trent videre med en ekstra straff for feil i nedbøren. Den varsler kraftig regn for ofte, men er best til å skjelne dagene som faktisk blir våte.",
    headline: { value: "7 %", label: "mer treffsikre varsler om kraftig regn" },
    secondary: { value: "44 %", label: "færre kraftige regndøgn den bommer helt på" },
    story: [
      "Pavo er en versjon av Bris som er trent videre med én endring: hver gang den bommer på nedbøren under treningen, får den en ekstra straff. Straffen gjelder all nedbør, fra lett yr til styrtregn, og bare over Norden. Alt annet er som før.",
      "Med den ekstra straffen lærer modellen å ta nedbøren mer på alvor. Den sier oftere at det kan komme kraftig regn, også på dager der det ikke kommer. Men den overser langt færre av dagene der det faktisk kommer mye regn.",
      "Navnet er latin for påfugl. I gresk mytologi hadde kjempen Argus hundre øyne, og da han døde, satte gudinnen Hera øynene hans i påfuglens hale. Prosjektet heter Argus, og «halen» er det meteorologer kaller de sjeldne, ekstreme verdiene.",
    ],
    rows: [
      ...SHARED_ROWS,
      {
        label: "Ekstra straff for nedbør",
        bris: "nei",
        model: "ja, bare for nedbør og bare over Norden",
        changed: true,
      },
      {
        label: "Hvilken nedbør straffen gjelder",
        bris: "–",
        model: "all nedbør, uansett mengde",
        changed: true,
      },
      {
        label: "Hvor sterk straffen er",
        bris: "–",
        model: "omtrent en tidel av den vanlige straffen på dager med mye regn",
        changed: true,
      },
      ...SHARED_TAIL,
    ],
    results: [
      { label: "Mot sammenligningsmodellen", value: "7,1 % bedre", good: true, note: "sikkert, ikke tilfeldig" },
      { label: "Mot vanlig Bris", value: "8 % bedre", good: true },
      { label: "Trent på nytt fra start", value: "6,6 % bedre", good: true, note: "resultatet gjentok seg" },
      { label: "To Pavo-modeller kjørt sammen", value: "7,6 % bedre", good: true, note: "mot to sammenligningsmodeller kjørt sammen" },
      { label: "Mot METs fysiske modell, like mange varsler", value: "like god", note: "fire MEPS-medlemmer mot fire fra Pavo; hele MEPS-ensemblet på 15 er fortsatt bedre" },
      { label: "Hvor lenge gevinsten varer", value: "første døgn", note: "5,3 % bedre 12 timer fram, ingen forskjell 36 timer fram" },
      { label: "Målt slik MET selv måler", value: "6,8 % bedre", good: true },
      { label: "Uten kalibrering", value: "6,5 % dårligere", note: "fordi den overdriver" },
      { label: "Hvert steds våteste dager", value: "4,6 % bedre", good: true, note: "de 1 % våteste dagene på hvert sted, rundt fire i året" },
      { label: "Nedbør i snitt over alle dager", value: "18 % for mye", note: "for våt generelt; 11 % på ny trekning" },
      { label: "Temperatur", value: "1,5 % dårligere", note: "gjentok seg på ny trekning" },
      { label: "Vind", value: "1,2 % bedre", good: true },
      { label: "Mot A, med kalibrering", value: "ingen sikker forskjell", note: "A er sikkert bedre uten kalibrering" },
    ],
    strengths: [
      "Best av alle modellene i prosjektet til å skille dager med kraftig regn fra vanlige dager.",
      "Av alle dagene med over 20 mm regn, overså den 44 % færre enn sammenligningsmodellen.",
      "Testet etter en plan som ble skrevet før resultatene fantes, og bekreftet en gang til fra start.",
    ],
    limits: [
      "Sannsynlighetene må justeres med kalibrering før de brukes, fordi den overdriver.",
      "For de mest ekstreme dagene, over 50 mm, er det for få tilfeller til å si noe sikkert.",
      "Varsler 11–18 % for mye nedbør i snitt over alle dager, og er litt dårligere på temperatur.",
    ],
  },
  {
    id: "a",
    name: "A",
    sees: {
      short: "bare nedbør over 20 mm på seks timer",
      how: "Før straffen regnes ut, heves alle verdier under 20 mm til 20 mm, både i varselet og i fasiten. Sa modellen 3 mm og det kom 8 mm, blir begge 20, og feilen forsvinner. Bare når minst én av dem er over 20 mm, blir det en forskjell å straffe. Derfor merker modellen straffen bare på de kraftigste bygene.",
    },
    code: { threshold: "20 mm per 6 timer", weight: "1 371,6" },
    expert: {
      tldr: "bris-crpsfft finjustert 2 000 steg med afCRPS pluss et andre afCRPS-ledd på max(tp, 20 mm/6 t) over LAM-nodene, γ = 1 371,6, en tidel av den opprinnelige halearmen. Den eneste varianten som er bedre enn kontrollarmen også rå (Brier over 20 mm/døgn −3,9 %). Kalibrert −6,1 %. Samme ledd med full vekt gir ingen gevinst (−0,7 %, ikke signifikant), så dosen ser ut til å avgjøre.",
      threshold: "8,44074 (normalisert) = 20 mm per 6 t; v(z) = max(z, t) på både ensemble og analyse",
      gamma: "1 371,6",
      measured: "Den opprinnelige halearmen brukte γ* = 13 716, målt slik at leddet er like stort som afCRPS på 23 ekstreme tilstander (median av forhold per tilstand). A bruker γ*/10, så leddet er en tidel av afCRPS på ekstreme tilstander. Under terskelen er v(x) og v(y) begge t, så leddet er null på de fleste tilstander, og derfor må γ være mye større enn Pavos for samme virkning på de ekstreme.",
      yaml: `training:
  max_steps: 2000
  lr: { rate: 3.75e-6, min: 3.75e-7, iterations: 3000, warmup: 100 }
  ensemble_size_per_device: 3
  training_loss:
    _target_: anemoi.training.losses.combined.CombinedLoss
    losses:
      - _target_: anemoi.training.losses.AlmostFairKernelCRPS
        alpha: 0.95
        scalers: [pressure_level, general_variable, nan_mask_weights, node_weights]
      - _target_: xbris.losses.TailWeightedKernelCRPS
        alpha: 0.95
        scalers: [pressure_level, general_variable, nan_mask_weights, lam_node_weights]
        tail_threshold: 8.44074    # 0,020 m · 422,037
        tail_variable: tp
        tail_index: 38
    scalers: ['*']
    loss_weights: [1.0, 1371.6]`,
      results: [
        { label: "Kalibrert Brier, 20 mm, mot kontrollarmen", value: "−0,00133 (−6,1 %)", ci: "[−0,00194, −0,00083]", good: true, note: "låst plan for variantene" },
        { label: "Ny trekning (A2, seed 20261003) mot F, kalibrert 20 mm", value: "−0,00055 (−2,6 %)", ci: "[−0,00111, −0,00003]", good: true, note: "låst plan bestått; rå −2,8 %, ROC 0,858 mot 0,856. Under halvparten av As gevinst" },
        { label: "Mot MEPS-ensemblet, 4 medlemmer fra 00 UTC", value: "+0,00050 (+2,5 %)", ci: "[−0,00041, +0,00150]", note: "ingen sikker forskjell; kontrollarmen +9,5 % [sikkert dårligere]. 242 243 stasjonsdøgn der alle MEPS-medlemmer finnes" },
        { label: "A + A2 (8) mot MEPS-ensemblet, 15 medlemmer", value: "+0,00146 (+7,9 %)", ci: "[+0,00064, +0,00239]", note: "MEPS med 15 medlemmer er bedre; ROC 0,938 mot 0,901" },
        { label: "Kalibrert Brier, 10 mm per 6 t, +12 t, mot kontrollarm + spektral", value: "−0,00060 (−5,7 %)", ci: "[−0,00103, −0,00025]", good: true, note: "timesmålerne. Ved +36 t: +0,00014 (+1,3 %) [−0,00020, +0,00050]; gevinsten krymper sikkert fra +12 til +36 t. All nedbør (fair CRPS) +7,1 % [+3,7, +10,9] ved +36 t" },
        { label: "A + A2 sammen (8 medlemmer) mot kontrollarm + F", value: "−0,00181 (−8,4 %)", ci: "[−0,00242, −0,00129]", good: true, note: "utforskende; rå −0,00207 (−9,3 %) [−0,00266, −0,00156]; ROC 0,900 mot 0,860. A3 (seed 20261024) trenes for å teste det" },
        { label: "Rå Brier, 20 mm", value: "0,02163 mot 0,02250 (−3,9 %)", good: true, note: "intervall ikke regnet ut ennå" },
        { label: "Bilineær punktuttrekk (gridpp-stil)", value: "−0,00134 (−6,2 %)", ci: "[−0,00196, −0,00085]", good: true },
        { label: "Kalibrert Brier, 10 mm", value: "−0,00118 (−2,4 %)", ci: "[−0,00192, −0,00046]", good: true },
        { label: "Kalibrert Brier, 50 mm", value: "−0,00008 (−4,0 %)", ci: "[−0,00019, +0,00001]", note: "603 hendelser, ikke avgjort" },
        { label: "ROC-areal, 20 mm", value: "0,870 mot 0,851", good: true, note: "Pavo 0,908, vanlig Bris 0,808" },
        { label: "Samme ledd, full vekt (γ = 13 716)", value: "−0,00014 (−0,7 %)", ci: "[−0,00082, +0,00048]", note: "ingen gevinst" },
        { label: "Rå Brier, 20 mm, Pavo − A", value: "+0,00235", ci: "[+0,00144, +0,00330]", good: true, note: "A sikkert bedre rå; kalibrert −0,00021 [−0,00064, +0,00021]" },
        { label: "tp alle døgn: middel / observert", value: "×1,00", good: true, note: "kontrollarm ×0,96, Pavo ×1,18" },
        { label: "tp alle døgn, fair CRPS", value: "+0,9 %", ci: "[−0,6, +2,7] %" },
        { label: "2 m-temperatur, fair CRPS", value: "+0,0062 (+0,6 %)", ci: "[+0,0033, +0,0089]", note: "F (bare seed) −0,3 %" },
        { label: "10 m-vind, fair CRPS", value: "−0,0178 (−1,5 %)", ci: "[−0,0211, −0,0147]", good: true, note: "vindbias +0,30 m/s mot kontrollarmens +0,45" },
      ],
      notes: [
        "Den registrerte prediksjonen var at en hard terskel på 20 mm ikke gir noen kalibrert gevinst. A motbeviste den. A og den opprinnelige halearmen skiller seg bare i γ, så en egen låst plan testet doser på 1/30 og 1/3 av γ*: kalibrert −3,8 % [−0,00137, −0,00037] og −4,4 % [−0,00151, −0,00043] ved 20 mm. Gevinsten topper ved 1/10, og 1/3 er sikkert svakere enn A (+0,00038 [+0,00006, +0,00072]).",
        "Fordi leddet er null under terskelen, flytter A nivået lite: frekvensbias ved 2 av 4 medlemmer over 20 mm er 1,04, mot 0,93 for kontrollarmen og 1,41 for Pavo.",
        "Kontrollarmen er identisk bortsett fra det andre leddet, og normaliseringen er arvet fra bris-crpsfft: bufferne er bit-like i A, kontrollarmen og bris-crpsfft.",
      ],
    },
    subtitle: "Bris trent til å passe ekstra på de våteste dagene",
    oneLiner:
      "Vanlig Bris trent videre med en mild ekstra straff, men bare for de kraftigste regnbygene. Bedre på kraftig regn uten noen justering i etterkant, og den treffer nedbørsmengden i snitt.",
    headline: { value: "6 %", label: "mer treffsikre varsler om kraftig regn" },
    secondary: { value: "4 %", label: "bedre også uten noen justering" },
    story: [
      "A er en versjon av Bris som er trent videre med en ekstra straff når den bommer på nedbøren. I motsetning til Pavo gjelder straffen bare de kraftigste regnbygene, over 20 millimeter på seks timer. Vanlig regn påvirker den ikke.",
      "Det var den opprinnelige ideen i prosjektet. Det første forsøket brukte en ti ganger så sterk straff, og da ble modellen ikke bedre. A er det samme forsøket med en mye mildere straff, og da virket det.",
      "Fordi straffen bare gjelder de kraftigste bygene, blir modellen ikke generelt våtere. Den roper nesten ikke ulv oftere enn før. Derfor er A den eneste av variantene som er bedre enn utgangspunktet også uten at tallene justeres i etterkant.",
    ],
    rows: [
      ...SHARED_ROWS,
      {
        label: "Ekstra straff for nedbør",
        bris: "nei",
        model: "ja, bare for nedbør og bare over Norden",
        changed: true,
      },
      {
        label: "Hvilken nedbør straffen gjelder",
        bris: "–",
        model: "bare de kraftigste bygene, over 20 mm på seks timer",
        changed: true,
      },
      {
        label: "Hvor sterk straffen er",
        bris: "–",
        model: "omtrent en tidel av den vanlige straffen på dager med mye regn, ti ganger svakere enn det første forsøket",
        changed: true,
      },
      ...SHARED_TAIL,
    ],
    results: [
      { label: "Mot sammenligningsmodellen", value: "6,1 % bedre", good: true, note: "sikkert, ikke tilfeldig" },
      { label: "Samme oppskrift, trent på nytt", value: "2,6 % bedre", good: true, note: "fortsatt sikkert bedre, men mindre enn første gang" },
      { label: "To A-modeller kjørt sammen", value: "8,4 % bedre", good: true, note: "også 9,3 % bedre uten kalibrering; de to utfyller hverandre" },
      { label: "Mot METs fysiske modell, like mange varsler", value: "like god", note: "fire MEPS-medlemmer mot fire fra A; hele MEPS-ensemblet på 15 er fortsatt bedre" },
      { label: "Hvor lenge gevinsten varer", value: "første halvdøgn", note: "5,7 % bedre 12 timer fram, borte fra 24 timer" },
      { label: "Mot vanlig Bris", value: "7 % bedre", good: true },
      { label: "Uten kalibrering", value: "3,9 % bedre", good: true, note: "den eneste varianten som er det" },
      { label: "Målt slik MET selv måler", value: "6,2 % bedre", good: true },
      { label: "Over 10 mm i døgnet", value: "2,4 % bedre", good: true, note: "mindre gevinst enn Pavo" },
      { label: "Det første forsøket, ti ganger sterkere straff", value: "0,7 % bedre", note: "ikke sikkert, kan være tilfeldig" },
      { label: "Nedbør i snitt over alle dager", value: "riktig mengde", good: true, note: "1,00 ganger det som ble målt" },
      { label: "Temperatur", value: "0,6 % dårligere", note: "nesten uendret" },
      { label: "Vind", value: "1,5 % bedre", good: true },
      { label: "Mot Pavo, uten kalibrering", value: "sikkert bedre", good: true, note: "med kalibrering er de like gode" },
    ],
    strengths: [
      "Bedre enn sammenligningsmodellen både med og uten justering i etterkant, og minst like god som Pavo.",
      "Varsler riktig mengde nedbør i snitt, er bedre på vind og nesten uendret på temperatur.",
      "Viser at den opprinnelige ideen i prosjektet virker, bare med en mildere straff.",
    ],
    limits: [
      "Rangerer kraftige regndager litt dårligere enn Pavo (ROC 0,87 mot 0,91), selv om de er like gode etter kalibrering.",
      "Hjelper mindre for moderat regn, fordi straffen bare gjelder de kraftigste bygene.",
      "Trent bare én gang så langt; en ny trening med nytt seed kjører nå. Svakere og sterkere straff ga mindre gevinst.",
    ],
  },
];

export const GLOSSARY: { term: string; text: string }[] = [
  {
    term: "Sammenligningsmodellen",
    text: "Vanlig Bris trent videre på nøyaktig samme måte, men uten den ekstra straffen. Den finnes for å vise at forbedringen kommer av straffen, og ikke bare av mer trening. I prosjektet heter den kontrollarmen.",
  },
  {
    term: "Fire varsler samtidig",
    text: "Bris lager fire litt forskjellige varsler for samme dag, et såkalt ensemble. Sannsynligheten for kraftig regn er hvor mange av de fire som sier det: to av fire betyr 50 %.",
  },
  {
    term: "Kalibrering",
    text: "Modellene er ofte for sikre. Når de sier 75 %, skjer det kanskje bare i halvparten av tilfellene. Kalibrering oversetter tallene til hvor ofte det faktisk har skjedd før. Værtjenester etterbehandler varslene sine på denne måten før de vises.",
  },
  {
    term: "Mer treffsikre",
    text: "Målt med Brier-skåren: avstanden mellom sannsynligheten modellen ga og det som skjedde, snittet over alle dagene. 7 % bedre betyr at den avstanden er 7 % mindre.",
  },
];

export function spotlightById(id: string): Spotlight | undefined {
  return SPOTLIGHT.find((m) => m.id === id);
}
