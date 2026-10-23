/* The project's vocabulary, for /ordliste. Grouped by theme; within a group
   the order is the order a reader meets the words. `aka` holds the names the
   same thing goes by in code, configs and papers, so a search for either
   finds it. Each term gets an anchor from its slug, so posts can link to
   /ordliste#<slug>. */

export type GlossaryTerm = { term: string; aka?: string[]; text: string; href?: string };
export type GlossaryGroup = { title: string; id: string; terms: GlossaryTerm[] };

export function termSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const GLOSSARY_GROUPS: GlossaryGroup[] = [
  {
    title: "Modellene og dataene",
    id: "modeller-og-data",
    terms: [
      {
        term: "Bris",
        aka: ["Bris CRPS-FFT", "bris-crpsfft"],
        text: "Meteorologisk institutts værmodell laget med maskinlæring, i versjonen som kalles CRPS-FFT. Den kjører operativt fire ganger i døgnet. Det er denne modellen prosjektet trener videre.",
      },
      {
        term: "MEPS",
        aka: ["MetCoOp Ensemble Prediction System"],
        text: "Den fysiske, regionale værmodellen for Norden, med 2,5 km oppløsning. Den er både der Bris lærte de nordiske detaljene og referansen resultatene måles mot.",
      },
      {
        term: "MEPS-analyse",
        aka: ["analyse"],
        text: "MEPS sitt beste anslag på hvordan været faktisk var på et gitt tidspunkt. Det er fasiten modellen sammenlignes med under trening.",
      },
      {
        term: "ERA5",
        aka: ["N320", "reanalyse"],
        text: "ECMWF sin globale rekonstruksjon av været tilbake i tid, med rundt 31 km oppløsning. Den dekker resten av kloden i Bris.",
      },
      {
        term: "Strukket grid",
        aka: ["stretched grid"],
        text: "Ett rutenett med fin oppløsning over Norden (2,5 km) og grov oppløsning ellers. Slik ser Bris både de store værsystemene og de lokale detaljene.",
      },
      {
        term: "Regionalt utsnitt",
        aka: ["LAM", "cutout", "lam"],
        text: "Den nordiske, høyoppløste delen av gridet, 969 × 849 punkter. Den ligger først blant de rundt 1,36 millioner punktene modellen regner på.",
      },
      {
        term: "Anemoi",
        aka: ["anemoi-training"],
        text: "Rammeverket fra ECMWF som Bris er bygget og trent i. Prosjektet bruker versjon 0.5.1.",
      },
      {
        term: "Sjekkpunkt",
        aka: ["checkpoint", "ckpt"],
        text: "En lagret kopi av modellens vekter på et bestemt treningssteg. Inferens-sjekkpunktet er den versjonen som brukes til å lage varsler.",
      },
    ],
  },
  {
    title: "Ensemble og usikkerhet",
    id: "ensemble",
    terms: [
      {
        term: "Ensemble",
        aka: ["medlemmer", "members"],
        text: "Flere varsler for samme tidspunkt, der hvert er et mulig utfall. Bris lager dem ved å legge tilfeldig støy inn i modellen. Her varsles det med fire medlemmer og trenes med tre.",
      },
      {
        term: "Spredning",
        aka: ["spread"],
        text: "Hvor ulike medlemmene i ensemblet er. Stor spredning betyr at modellen er usikker, liten at den er trygg.",
      },
      {
        term: "Sannsynlighet fra ensemblet",
        text: "Andelen medlemmer som viser noe. Viser to av fire over 20 mm, er sannsynligheten for over 20 mm 50 %.",
      },
      {
        term: "Spredningskollaps",
        aka: ["spread collapse"],
        text: "Når ensemblet blir for sikkert på seg selv og medlemmene trekker seg sammen. Den første halearmen mistet 14 % av spredningen, og det kostet den hovedmålet.",
      },
    ],
  },
  {
    title: "Tapet modellen trenes mot",
    id: "tapet",
    terms: [
      {
        term: "Tap",
        aka: ["loss", "tapsfunksjon"],
        text: "Tallet modellen prøver å gjøre så lite som mulig under trening. Det avgjør hva modellen belønnes for.",
      },
      {
        term: "CRPS",
        aka: ["continuous ranked probability score"],
        text: "Et mål på hvor godt et helt ensemble treffer fasiten. Det belønner både medlemmer nær det som skjedde og en spredning som passer med usikkerheten. Lavere er bedre.",
      },
      {
        term: "Almost-fair CRPS",
        aka: ["afCRPS", "AlmostFairKernelCRPS", "alpha"],
        text: "En CRPS som korrigerer for at ensemblet bare har noen få medlemmer. α = 0,95 sier hvor mye av korreksjonen som brukes. Det er Bris sitt hovedtap.",
      },
      {
        term: "Proper skår",
        aka: ["proper scoring rule"],
        text: "Et mål der det alltid lønner seg å melde det du faktisk tror. En modell kan ikke få bedre skår ved å overdrive.",
      },
      {
        term: "twCRPS",
        aka: ["terskelvektet CRPS", "threshold-weighted CRPS"],
        text: "CRPS som bare bryr seg om verdier over en terskel. Den er fortsatt proper, så den kan ikke lures. Det er grunnlaget for haleleddet.",
      },
      {
        term: "Haleleddet",
        aka: ["tail term", "TailWeightedKernelCRPS"],
        text: "twCRPS for nedbør, lagt til Bris sitt eget tap med en vekt. Det er prosjektets idé: å gjøre modellen bedre på kraftig regn uten å endre dataene.",
        href: "/blog/terskelen",
      },
      {
        term: "Kjedefunksjon",
        aka: ["chaining function", "v(z) = max(z, t)"],
        text: "Knepet som gjør vanlig CRPS om til twCRPS. Alt under terskelen settes lik terskelen, så bare det som ligger over, teller.",
      },
      {
        term: "Terskel",
        aka: ["tail_threshold", "20 mm"],
        text: "Grensen haleleddet bryr seg om: 20 mm per 6 timer, som er 8,44 i enhetene modellen ser. Pavo har ingen terskel.",
      },
      {
        term: "Normaliserte enheter",
        text: "Verdiene modellen regner med internt. For nedbør er det meter delt på 2,369 mm, altså meter ganger 422,037.",
      },
      {
        term: "Vekt",
        aka: ["γ", "gamma", "loss_weights", "dose"],
        text: "Hvor mye haleleddet teller i det samlede tapet. A har 1 371,6, en tidel av den opprinnelige halearmens 13 716. Dosen er vekten som andel av den opprinnelige.",
      },
      {
        term: "Spektralleddet",
        aka: ["AFCRPS-FFT", "AFCRPSFFTLoss", "CRPS-FFT"],
        text: "Almost-fair CRPS regnet på Fourier-koeffisientene til de nordiske feltene. Den straffer felt som er for støyete eller for utsmurte. Bris ble trent med den, men finjusteringene manglet den fram til A + spektral.",
        href: "/blog/styrker-svakheter-og-veien-videre",
      },
      {
        term: "Lavpassmaske",
        text: "Den delen av spektralleddet som bare teller frekvenser innenfor en sirkel, 78,5 % av koeffisientene. De aller minste skalaene i hjørnene telles ikke.",
      },
      {
        term: "Nodevekter",
        aka: ["node_weights", "lam_node_weights"],
        text: "Hvor mye hvert punkt på gridet teller, etter hvor stort område det dekker. Haleleddet bruker bare de nordiske punktene, så regn i tropene ikke tar over.",
      },
    ],
  },
  {
    title: "Eksperimentet",
    id: "eksperimentet",
    terms: [
      {
        term: "Finjustering",
        aka: ["fine-tuning", "warm start"],
        text: "Å trene videre fra Bris sine ferdige vekter, med lav læringsrate, i stedet for å trene fra bunnen.",
      },
      {
        term: "Kontrollarmen",
        aka: ["control", "control2000"],
        text: "Bris finjustert nøyaktig som de andre, men uten noe ekstra ledd. Den viser hva finjusteringen alene gjør, så forskjellen til de andre kan føres tilbake til leddet.",
      },
      {
        term: "Halearmen",
        aka: ["tail", "tail2000"],
        text: "Kontrollarmen pluss haleleddet med full vekt. Det var det første forsøket, og vekten viste seg å være for høy.",
      },
      {
        term: "Variantene A til E",
        aka: ["tailA2000", "tailB2000", "tailD2000", "tailE2000"],
        text: "Halearmer med ulik terskel, vekt eller myk terskel. A har hard terskel på 20 mm og en tidel av vekten, og ble den beste.",
        href: "/modeller/a",
      },
      {
        term: "Pavo",
        aka: ["variant C", "tailC2000"],
        text: "Et ekstra CRPS-ledd på nedbør uten terskel, med vekt 39,09. Bedre på kraftig regn etter kalibrering, men for våt uten.",
        href: "/modeller/pavo",
      },
      {
        term: "Doseserien",
        aka: ["dosekurven", "tail30th2000", "tail3rd2000"],
        text: "Samme ledd og terskel med vekt 1/30, 1/10, 1/3 og 1 av den opprinnelige. Gevinsten er størst ved 1/10, som er A.",
        href: "/blog/dosekurven",
      },
      {
        term: "Seed",
        aka: ["trekning", "s2"],
        text: "Startverdien for alt det tilfeldige i treningen. En ny trekning er samme oppskrift med et annet seed, for å se om et resultat holder seg.",
      },
      {
        term: "F",
        aka: ["control2000s2"],
        text: "Kontrollarmen trent med det andre seedet. A og Pavo med nytt seed måles mot den.",
      },
      {
        term: "Steg",
        aka: ["step", "max_steps"],
        text: "Én oppdatering av vektene. Variantene stoppes ved steg 2 000. Hele planen er 3 000.",
      },
      {
        term: "Læringsrateplan",
        aka: ["cosine schedule", "lr"],
        text: "Hvor store skritt treningen tar. Den synker gradvis over 3 000 steg, også for kjøringene som stoppes ved 2 000, så de kan sammenlignes direkte.",
      },
      {
        term: "Modellnavnene",
        aka: ["tailA2000", "tailC3000", "tailA2000s2", "tailAfft2000"],
        text: "Navnene i koden er variant pluss steg, med s2 for nytt seed og fft for spektralleddet. tailC3000 er Pavo trent til steg 3 000.",
      },
    ],
  },
  {
    title: "Hvordan resultatene måles",
    id: "maling",
    terms: [
      {
        term: "Teståret",
        text: "1. august 2025 til 6. september 2026. Bris har aldri sett disse dataene, verken i MET sin trening eller i finjusteringen.",
        href: "/blog/testaaret",
      },
      {
        term: "Stasjonsdøgn",
        aka: ["station-days"],
        text: "Én regnmåler, ett døgn. Teståret har 259 178 av dem, fra 714 målere.",
      },
      {
        term: "Frost",
        text: "Meteorologisk institutts database for observasjoner. Regnmålingene og temperatur- og vindmålingene kommer derfra.",
      },
      {
        term: "Ledetid",
        aka: ["lead time", "+30 h"],
        text: "Hvor langt fram i tid varselet gjelder. Hovedmålet bruker døgnet som slutter 30 timer etter at varselet startet.",
      },
      {
        term: "Brier-skår",
        aka: ["Brier score"],
        text: "Avstanden mellom sannsynligheten modellen ga og det som faktisk skjedde, i snitt over alle dagene. For eksempel for over 20 mm i døgnet. Lavere er bedre.",
      },
      {
        term: "Kalibrering",
        aka: ["isotonisk regresjon", "PAV"],
        text: "Oversetter modellens sannsynligheter til hvor ofte det faktisk skjedde før. Sier modellen 50 %, men det regnet så mye bare 35 % av gangene, blir 50 % til 35 %.",
        href: "/blog/kalibrering",
      },
      {
        term: "Månedsvis kryssvalidering",
        aka: ["month-out", "--cv month"],
        text: "Kalibreringen lærer på de andre månedene og brukes på én, så den aldri ser fasiten for dagene den oversetter.",
      },
      {
        term: "Rå og kalibrert",
        aka: ["raw"],
        text: "Skåren før og etter kalibrering. A er bedre enn kontrollarmen begge veier, Pavo bare etter.",
      },
      {
        term: "ROC-areal",
        aka: ["ROC area", "AUC"],
        text: "Hvor godt modellen skiller dagene med kraftig regn fra de andre, uansett hvilken grense man velger. Det påvirkes ikke av kalibrering. 0,5 er tilfeldig, 1 er perfekt.",
      },
      {
        term: "Treffrate",
        aka: ["hit rate"],
        text: "Andelen av dagene med kraftig regn der modellen varslet det.",
      },
      {
        term: "Andel falske alarmer",
        aka: ["false alarm share", "f.al. share"],
        text: "Andelen av varslene om kraftig regn der det ikke kom.",
      },
      {
        term: "Frekvensbias",
        aka: ["bias"],
        text: "Hvor ofte modellen varsler kraftig regn delt på hvor ofte det skjer. Over 1 er for ofte, under 1 for sjelden.",
      },
      {
        term: "BSS",
        aka: ["Brier skill score"],
        text: "Brier-skåren sammenlignet med en referanse. Positivt betyr bedre enn referansen.",
      },
      {
        term: "Blokk-bootstrap",
        aka: ["bootstrap", "95 %-intervall"],
        text: "Trekker teståret på nytt i blokker på sju dager tusenvis av ganger for å finne usikkerheten. Blokkene tar hensyn til at nabodøgn ligner hverandre.",
      },
      {
        term: "Sikkert bedre",
        text: "Hele 95 %-intervallet for forskjellen ligger på riktig side av null.",
      },
      {
        term: "Avveiningen mellom kropp og hale",
        aka: ["body-tail trade-off"],
        text: "Å bli bedre på ekstremene koster litt på vanlig vær. Kjent fra statistisk etterbehandling, og målt her i en finjustert værmodell.",
        href: "/blog/har-noen-gjort-dette",
      },
      {
        term: "Spektrum",
        aka: ["spektra", "DCT"],
        text: "Hvor mye variasjon feltene har på hver romlig skala, sammenlignet med analysen. Over 1 på de minste skalaene betyr at feltet er for støyete.",
      },
      {
        term: "Bilineær og nærmeste punkt",
        aka: ["interpolasjon", "bilinear", "nearest"],
        text: "To måter å hente varselet ved en stasjon: fra nærmeste gridpunkt, eller vektet fra de fire rundt. Resultatene holder med begge.",
      },
    ],
  },
  {
    title: "Låste planer",
    id: "planer",
    terms: [
      {
        term: "Låst plan",
        aka: ["preregistrering", "frozen plan"],
        text: "Planen for hvordan en kjøring skal måles, skrevet og frosset før treningen. Fingeravtrykket (SHA-256) står i commiten, så den ikke kan endres i etterkant.",
      },
      {
        term: "Hovedmål",
        aka: ["primary endpoint"],
        text: "Den ene sammenligningen som avgjør. Den er positiv, negativ eller ikke avgjørende, etter regler som står i planen.",
      },
      {
        term: "Sekundært og utforskende",
        aka: ["secondary", "exploratory"],
        text: "Resultater som rapporteres, men ikke avgjør noe. De kan gi nye spørsmål, ikke svar.",
      },
    ],
  },
  {
    title: "Klyngen",
    id: "klyngen",
    terms: [
      {
        term: "eX3",
        text: "Forskningsklyngen ved Simula der all trening og alle varsler kjøres.",
      },
      {
        term: "g002 og g003",
        aka: ["H200", "A100"],
        text: "GPU-maskinene på eX3. g003 har H200-kort med 140 GB minne, som er det treningen trenger. g002 har A100-kort, som er tregere for varslene.",
      },
      {
        term: "Slurm",
        aka: ["jobb", "kø", "avhengighet", "afterok", "afterany"],
        text: "Køsystemet på klyngen. En jobb kan vente på at en annen er ferdig, så trening, varsler og scoring går i en kjede uten at noen må følge med.",
      },
      {
        term: "Bit, sweep og utfylling",
        aka: ["chunk", "sweep", "fill"],
        text: "Varslene for teståret deles i biter som kjøres samtidig. Sweepen tar dagene en bit ikke rakk, og utfyllingen er en ekstra jobb når en bit går for tregt.",
      },
      {
        term: "Valideringsvarsler",
        text: "Varsler for annenhver dag i april til juli 2025, brukt til å velge ut varianter før teståret ble åpnet.",
      },
    ],
  },
];
