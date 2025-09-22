Paranoid Times — Design \& Regelbok (MVP)

0\. Heis­pitch



Paranoid Times er et satirisk kartspill om å vinne narrativet, plystre bort motstanderens ressurser og “punsje” politisk press inn i delstater. Kortene er “nyheter” og aksjoner som skaper målbare effekter i spillets verden: IP (Influence Points), Truth (0–100%), og Pressure per stat. Førstemann til 10 stater, Truth-terskel, eller 300 IP vinner.



1\. Komponenter



Spillere: 2 (Truth vs Government)

IP: Valutaen du bruker for å spille kort.

Truth (0–100): Hvor “sann” offentligheten oppfatter fortellingen.

Stater: Kart med statlige Defense-verdier.

Pressure: Din side sin opparbeidede innflytelse i en stat. Når Pressure ≥ Defense, tar du staten.

Korttyper:



ATTACK — tar IP fra motstander (og kan tvinge discard).



MEDIA — endrer Truth opp eller ned.



ZONE — legger Pressure i valgt stat for å ta kontroll.



Kort-rariteter: common, uncommon, rare, legendary (styrken øker med raritet).

Kortområder: Bibliotek (deck), Hånd, Discard.



2\. Mål \& Seier



Du vinner straks én av disse er sant etter din tur:



Du kontrollerer 10 stater, eller



Truth ≥ 90% (Truth-spilleren) / Truth ≤ 10% (Government-spilleren), eller



Du har 300 IP.



3\. Oppsett



Velg fraksjon: truth eller government.



Bland deck, trekk 5 kort.



Sett Truth = 50%.



Sett IP = 0 for begge.



Sett Pressure = 0 for alle stater.



Hver stat har en forhåndsdefinert Defense (f.eks. 2–5).



4\. Turstruktur



Start of Turn



Inntekt: Få +5 IP + +1 IP per stat du kontrollerer.



Trekk: Trekk opp til 5 kort på hånd (fyll opp).



Spillfase

3\) Spill opptil 3 kort i valgfri rekkefølge. Betal IP-kost, kortet resolves umiddelbart.



Capture-sjekk

4\) For hver stat du har lagt Pressure på: hvis din Pressure ≥ Defense, tar du staten. Begge siders Pressure i staten settes til 0.



Slutt på tur

5\) Frivillig discard:



1 kort gratis.



Ytterligere discards samme sluttfase koster 1 IP per kort.



Bytt aktiv spiller.



5\. Korttyper, effekter og kost (MVP)

5.1 Effekt-whitelist per type



ATTACK:

ipDelta.opponent (obligatorisk, >0), discardOpponent? (0–2).



MEDIA:

truthDelta (kan være + eller –).



ZONE:

pressureDelta (obligatorisk, >0, krever targetStateId ved spill).



Ingen andre nøkler i MVP. (Skip, immune, global pressure, cost-mod osv. venter vi med.)



5.2 Faste baseline-effekter \& kost per raritet

Type \\ Rarity	Common	Uncommon	Rare	Legendary

ATTACK (tar IP)	Tar 1 · 2 IP	Tar 2 · 3 IP	Tar 3 · 4 IP	Tar 4 · 5 IP

MEDIA (Truth ±)	±1% · 3 IP	±2% · 4 IP	±3% · 5 IP	±4% · 6 IP

ZONE (Pressure)	+1 · 4 IP	+2 · 5 IP	+3 · 6 IP	+4 · 7 IP



Krydder (valgfritt, fortsatt enkelt):



ATTACK Rare/Legendary kan også ha discardOpponent: 1 (Legendary kan få 2).



MEDIA kan presenteres som “±X%” så spilleren velger retning ved spill.



6\. Regler i detalj (spillernivå)



ATTACK



Betal kost → motstander mister oppgitt IP.



Hvis kortet sier det: motstander discarder N tilfeldig(e) kort.



MEDIA



Betal kost → endre Truth med oppgitt ±%. Truth clampes til \[0, 100].



ZONE



Velg målstat (f.eks. “OH”) → betal kost → øk din Pressure der.



Capture skjer straks din Pressure ≥ Defense. Du får staten (IP-inntekt +1/turn), og Pressure i den staten resettes for begge spillere (0/0).



Discard i sluttfase



Kast 1 valgfritt kort gratis.



Kast flere kort samme sluttfase → betal 1 IP per ekstra kort.



Du fyller opp til 5 på starten av din neste tur (ikke direkte ved discard).



Grense 3 kort per tur



Forsøk på å spille et 4. kort avvises; du må vente til neste tur.



6.1 Kombo-kategorier (MVP)



Kombomotoren sjekker alle kort du spiller i løpet av din tur og betaler ut bonus IP eller Truth når definerte mønstre treffer. Hver komb definert i MVP har en individuell “cap”, og spilleren kan normalt bare utløse to komboutbetalinger per tur (kan økes via innstillinger).



Sequence (rekkefølge)



* Trigger: Fast rekkefølge av korttyper. Eksempel: «Attack Blitz» (ATTACK → ATTACK → ATTACK) som gir +5 IP når tre angrep spilles etter hverandre.



Count (volum)



* Trigger: N kort av en type/raritet i løpet av turen. Eksempel: «Attack Barrage» som krever tre ATTACK-spill og betaler +6 IP.



Threshold (terskel)



* Trigger: Nå definerte tallverdier (IP-forbruk, ulike mål, antall dyre kort). Eksempel: «Strategic Budget» gir +4 IP når du investerer minst 12 IP på kort samme tur.



State (territorium)



* Trigger: Gjentatte eller spredd ZONE-spill på bestemte stater. Eksempel: «Lockdown» utløses av tre treff på samme stat i én tur og gir +4 IP.



Hybrid (samensatt)



* Trigger: Kombinasjon av flere betingelser (sekvenser + terskler, type-miks + målspredning). Eksempel: «Precision Strike» krever ATTACK → ZONE-sekvens og minst 6 IP brukt på ATTACK samme tur for +3 IP.



7\. Kortdesign (for designere)

7.1 Kortmal (metadata og effekter)



ID: konsistent prefiks (f.eks. TR-AT-U-014 = Truth/Attack/Uncommon/014).



Navn: 2–4 ord, tydelig og memorerbart.



Faction: truth eller government (lowercase).



Type: ATTACK | MEDIA | ZONE.



Rarity: common | uncommon | rare | legendary.



Cost: IP fra tabellen (over).



Effects: kun tillatte nøkler for den typen.



Flavor: 1 linje “CLASSIFIED INTELLIGENCE” sitat (humor/setting).



ArtId: peker til bilde/illustrasjon.



7.2 Eksempler (produksjonsklare)



ATTACK · Uncommon · 3 IP



Effekt: ipDelta.opponent: 2 + discardOpponent: 1



Flavor: “Please sign here, here, here… and here.”



MEDIA · Rare · 5 IP



Effekt: truthDelta: +3 (spiller kan velge minus isteden)



Flavor: “They watched. They wondered. They argued online.”



ZONE · Legendary · 7 IP



Effekt: pressureDelta: 4 (target kreves)



Flavor: “Boots, banners, and a deafening megaphone.”



7.3 Do’s \& Don’ts



Gjør:



Hold deg til tabellen for kost/effekt.



Skriv kort flavor som gir verden og smil, men ikke skjuler regler.



Sjekk at effekten er lov for typen.



Ikke gjør:



Ikke bland effekter (f.eks. Truth på ATTACK, discard på ZONE).



Ikke legg inn nye nøkler i MVP.



Ikke lag 0-kost kort.



8\. Motor \& Data (for utviklere)

8.1 Datastruktur (TypeScript)

type Faction = "truth" | "government";

type CardType = "ATTACK" | "MEDIA" | "ZONE";

type Rarity  = "common" | "uncommon" | "rare" | "legendary";



type EffectsATTACK = { ipDelta:{opponent:number}; discardOpponent?:number };

type EffectsMEDIA  = { truthDelta:number };

type EffectsZONE   = { pressureDelta:number };



type Card = {

&nbsp; id:string; name:string; faction:Faction;

&nbsp; type:CardType; rarity:Rarity; cost:number;

&nbsp; effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;

&nbsp; artId?:string; flavor?:string; tags?:string\[];

};



type PlayerState = {

&nbsp; id:"P1"|"P2"; faction:Faction;

&nbsp; deck:Card\[]; hand:Card\[]; discard:Card\[];

&nbsp; ip:number; states:string\[];               // kontrollerte stater (USPS-koder)

};



type GameState = {

&nbsp; turn:number; currentPlayer:"P1"|"P2"; truth:number;

&nbsp; players:Record<"P1"|"P2", PlayerState>;

&nbsp; pressureByState: Record<string,{P1:number;P2:number}>;

&nbsp; stateDefense: Record<string,number>;

&nbsp; playsThisTurn:number;

};



8.2 Validering (hard gate)



Faction ∈ {truth,government}



Type ∈ {ATTACK,MEDIA,ZONE}



Rarity ∈ {common,uncommon,rare,legendary}



Effects:



ATTACK: kun ipDelta.opponent>0 (+ valgfri discardOpponent 0–2).



MEDIA: kun truthDelta (number).



ZONE: kun pressureDelta>0.



Cost må matche tabellen for type×raritet.



Bygg skal feile om noe bryter dette.



8.3 Spillelogikk (funksjonelt)



startTurn(s):



me.ip += 5 + me.states.length



trekk til 5



playsThisTurn = 0



canPlay(s, card, target?): returner årsaker: “Not your turn / Play limit (3) reached / Not enough IP / Choose a state (ZONE)”.



playCard(s, card, target?):



sjekk canPlay; hvis ok → ip -= cost → resolve(card) → playsThisTurn++ → flytt hand → discard (match på id).



resolve(card):



ATTACK → opp.ip = max(0, opp.ip - X); discardOpponent → flytt N tilfeldige fra opp.hand → opp.discard.



MEDIA → truth = clamp(truth + Δ, 0, 100).



ZONE → pressureByState\[target]\[owner] += Δ; hvis ≥ Defense → capture staten og reset Pressure (0/0) i staten.



endTurn(s):



Spilleren kan kaste 1 kort gratis (ekstra koster 1 IP hver).



Bytt currentPlayer, turn++.



winCheck(s): kall etter endTurn: 10 stater / Truth-terskel / 300 IP.



8.4 UI-kontrakter



ZONE må alltid sende targetStateId (USPS, f.eks. "OH").



Play-knapp: disabled + tooltip med whyNotPlayable årsaker.



Etter spill: kort fjernes fra hånd via id-sammenligning (ikke objektreferanse), legges i discard.



Statspanel leser pressureByState\[SID]\[viewer].



9\. Verden, satire \& humor



Tone: Tørr satire + konspira-slang + byråkratisk absurditet.

Hovedregel: Aldri punsj ned. Slå heller på institusjoner, prosesser, og fenomenet “alle har rett på sin egen sannhet”.

Stil:



Kortnavn: sting, men forståelig: “Paperwork Tsunami”, “County Organizers’ Surge”, “Black Bag Operation”.



Flavor (“CLASSIFIED INTELLIGENCE”): 1 linje, sitat-aktig, snerten:



“Please sign here, here, here… and here.”



“They watched. They wondered. They argued online.”



“Boots, banners, and a deafening megaphone.”



Kort som nyheter:



Hver runde er en “nyhetssyklus.” Å spille et kort er å slippe en overskrift:



ATTACK-kort = avsløringer, leaks, byråkratisk friksjon (motstanderen mister IP og fokus; av og til mister de et kort = “story killed”).



MEDIA-kort = narrativ vinner/ taper terreng (Truth flyttes opp/ned).



ZONE-kort = ground game: kanvass, rally, koalisjon, lokalt medietrykk (Pressure i en stat).



(Valgfritt UI-krydder) Etter turen tegnes en “forside” med 2–3 overskrifter basert på kortenes navn/flavor den runden.



10\. Eksempelrunde (for spillere)



Start: Du har 2 stater → inntekt = 5 + 2 = 7 IP. Trekk opp til 5.



Spill:



MEDIA (Rare, 5 IP): +3% Truth → 52%



ATTACK (Uncommon, 3 IP): Motstander −2 IP → (de mister to)



ZONE (Common, 4 IP): +1 Pressure på OH → når Defense 3 neste runde med flere ZONE



Slutt: Du discarder 1 dødt kort gratis.



Vedlegg A – Territorielle synergier



Kontroller alle stater som er listet for en kombinasjon for å aktivere bonusen permanent. IP-bonusen legges oppå vanlig inntekt, og eventuelle spesialeffekter gjelder så lenge du holder hele settet.



Økonomiske nettverk



* Wall Street Empire (NY, CT, NJ) → +5 IP og «Additional +2 IP per turn from financial manipulation».
* Silicon Valley Network (CA, WA, OR) → +4 IP og «All MEDIA cards cost -1 IP».
* Midwest Backbone (IL, OH, MI, IN, WI) → +4 IP og «States are harder to capture (-1 pressure from enemy)».
* Food Supply Chain (IA, NE, KS, MO, IL) → +3 IP og «Population unrest immunity - no pressure loss from events».



Energikarteller



* Oil Cartel (TX, AK, ND, OK) → +6 IP og «Generate +1 IP for each state you control».



Militær infrastruktur



* Military Triangle (VA, MD, DC) → +4 IP og «All ATTACK cards deal +1 pressure».
* Nuclear Triad (WY, MT, ND) → +3 IP og «Defense of all your states +1».
* Space Program (FL, TX, AL, CA) → +5 IP og «Can see AI hand once per turn».
* Southern Border (CA, AZ, NM, TX) → +4 IP og «Generate +1 IP for each neutral state».



Etterretnings- og kulturblokker



* Intelligence Web (VA, MD, UT, NV) → +4 IP og «Draw +1 card per turn».
* Academic Elite (MA, CT, NY, CA) → +3 IP og «All cards give +50% Truth/Government effect».
* Deep South Network (GA, AL, MS, SC, LA) → +3 IP og «Government cards are more effective (+2 Truth manipulation)».
* New England Conspiracy (MA, NH, VT, ME, RI, CT) → +4 IP og «Secret societies activated - draw rare cards more often».



Transport og logistikk



* Transport Control (IL, MO, IN, OH) → +3 IP og «Can move pressure between adjacent states once per turn».



Neste tur: Du prøver å fullføre OH (samlet Pressure ≥ 3) og ta din tredje stat.



11\. Vanlige spørsmål



Q: Kan jeg spille mer enn 3 kort hvis jeg har masse IP?

A: Nei, grensen er 3 kort per tur for tempo/balanse.



Q: Får jeg trekke nytt kort når jeg discarder på slutten?

A: Nei, du fyller bare opp til 5 i starten av din neste tur.



Q: Må ZONE ha target?

A: Ja. Du velger stat når du spiller kortet (f.eks. “OH”).



Q: Hva skjer med Pressure når jeg tar en stat?

A: Staten blir din, og Pressures i den staten nullstilles (0/0).



12\. Videreutvikling (etter MVP)



MEDIA-varianter: mild draw, små cost-mod, “skip action” (med klar whitelist).



Kart-hendelser: små tilfeldige nyheter mellom rundene.



Flere seiersmåter: “Agenda-kort” som alternative mål.



13\. Sjekklister



Designer-sjekk:



&nbsp;Type og raritet valgt.



&nbsp;Effekt følger tabellen og whitelisten for typen.



&nbsp;Kost = tabellverdi.



&nbsp;Flavor én linje, tydelig tone.



&nbsp;ZONE nevner at den krever target (i UI-tekst).



Dev-sjekk:



&nbsp;Validering passer; build feiler hvis kortet har ulovlige nøkler.



&nbsp;playCard: trekker IP, resolver, flytter hand → discard (id-match).



&nbsp;ZONE: target påkrevd; Pressure skrevet til pressureByState\[SID]\[owner]; capture-reset OK.



&nbsp;EndTurn: 1 gratis discard, ekstra koster 1 IP.



&nbsp;UI: tydelige tooltips for blokkerte spill.



14\. Minibibliotek (3 ferdige kort)

// ATTACK · Uncommon (3 IP): −2 IP \& 1 discard

{

&nbsp; id:"GV-AT-U-014", name:"Paperwork Tsunami", faction:"government",

&nbsp; type:"ATTACK", rarity:"uncommon", cost:3,

&nbsp; effects:{ ipDelta:{opponent:2}, discardOpponent:1 },

&nbsp; flavor:"'Form 27-B/6? Sign… here, here, here—and here.'"

}



// MEDIA · Rare (5 IP): +3 Truth

{

&nbsp; id:"TR-ME-R-022", name:"Documentary Premiere", faction:"truth",

&nbsp; type:"MEDIA", rarity:"rare", cost:5,

&nbsp; effects:{ truthDelta:3 },

&nbsp; flavor:"'They watched. They wondered. They argued online.'"

}



// ZONE · Legendary (7 IP): +4 Pressure (target)

{

&nbsp; id:"TR-ZO-L-031", name:"Coalition March", faction:"truth",

&nbsp; type:"ZONE", rarity:"legendary", cost:7,

&nbsp; effects:{ pressureDelta:4 },

&nbsp; flavor:"'Boots, banners, and a very loud megaphone.'"

}

15\. Tema \& tone: Weekly World News møter X-Files (kokko-paranoia)



Kjernetone: Sensasjonelle tabloid-overskrifter, duskete fotobevis, og byråkratiske memoer med svarte redaksjonsstreker—alt i en leken, ufarlig konspihumor. Spillet skal føles som om gårsdagens løssalgsavis krasjet inn i et hemmelig arkivrom med dårlig lysrør.



15.1 Hvilken humor vi sikter på



Kokko, ikke kynisk. Vi ler av fenomenene (UFO, krypter, HAARP, “svart budsjett”), ikke av sårbare grupper eller ekte traumer.



Deadpan byråkrati vs. hyperaktiv tabloid. Kontrasten er punchlinen: “INGEN UREGELMESSIGHETER FUNNET” stempel ved siden av en kornete Polaroid av en øgle i dress.



Plau-si-bel-ish absurd. Det skal føles nesten mulig: “værballong-seminar”, “vibrasjonsmåling i kloakk”.



Gjentakelse som våpen. Samme benektelser, nye merkelapper: ikke UFO, men atmosfærisk anomali type B.



15.2 Do’s \& Don’ts (tematisk)



Gjør:



Parodier byråkratisk språk (“paragraf 12-C, oppdatert skjema for vedlegg F”).



Bruk “kilder sier”, “uavhengige observasjoner” og pseudovitenskap.



Navn som høres ut som overskrifter: “Coalition March”, “Weather Balloon Workshop”.



Unngå:



Punching down / ekte konspirasjoner som skader IRL.



Reelle tragedier, religion, etnisitet, sykdom—hold det lett.



Slur eller identitetsmerking.



15.3 Språkstiler (tre “stemmer” å variere mellom)



Tabloid-overskrift (Truth-aktig):

“LAKE MONSTER SELFIE GOES VIRAL” – store ord, korte setninger, verbs først.



Klinisk notat (Government-aktig):

“FIELD REPORT 27-B/6: No anomalies detected.”



Vitne-sitat (nærhet + punch):

“Det blunka til meg, jeg sverger.”



Flavor-linjen (“CLASSIFIED INTELLIGENCE”) er alltid én setning—enten tabloid, notat eller sitat.



15.4 Visuell palett (for å selge tema)



Nyhetspapir \& halvtone. Grå raster, overstemplede bokser, små “klistrelapper”.



Redaksjonsstreker. Svartede felt på memoer for morsomme “hemmeligheter”.



Polaroid-rammer \& tape. Uskarpe motiver, piler og håndskrift.



Kartnåler. ZONE-spill føles som korktavle med røde tråder.



15.5 Eksempeltekster (ett kort fra hver side)

A) Government (ATTACK · Uncommon · 3 IP)



Navn: Weather Balloon Workshop

Effekt: ipDelta.opponent: 2, discardOpponent: 1

Flavor / CLASSIFIED INTELLIGENCE:



“Public outreach. Bring families. Don’t ask questions.”

Korttekst (UI-pitch): Host a very educational seminar about atmospheric balloons. Opponent loses 2 IP and misplaces one file.



Tone-guide: Tørr benektelse møter PR-smil. Den lille “misplaces one file” er vår tabloid-blink.



B) Truth Seekers (MEDIA · Rare · 5 IP)



Navn: Lake Monster Selfie Goes Viral

Effekt: truthDelta: +3 (spilleren kan velge −3 for sverting, men standard i UI: +3)

Flavor / CLASSIFIED INTELLIGENCE:



“She brought a ring light. The monster brought receipts.”

Korttekst (UI-pitch): A glossy reel convinces the fence-sitters. Shift Truth by +3%.



Tone-guide: Sosiale medier gjør mytologi til “fakta-ish”—og vi smiler av mekanikken.



Bonus: ZONE-smakebit (for verdensfølelse)



Truth / ZONE · Legendary · 7 IP — Coalition March

pressureDelta: 4 (target state)

Flavor: “Boots, banners, and a deafening megaphone.”

Pitch: Bilde av gateplan og hjemmelagde skilt; kartnålene flytter seg.



15.6 Navngivning \& mikrotekst (hurtigregel)



Navn: 2–4 ord, aktivt verb, “headline case”: “Paperwork Tsunami”, “Counter-Op Shield”.



Flavor: 1-3 linjer, maksimal komikk-tetthet.



Beskrivelse: 1–2 korte setninger, “nyhets-tone”, aldri gjenta tall som allerede står i effektene.



15.7 Hvordan kort blir “nyheter” i verden



Når du spiller et kort, publiserer du en sak.

ATTACK = “skandale”/avledning; MEDIA = “story som endrer narrativ”; ZONE = “lokal mobilisering”.



Avisforsiden (valgfri UI): Etter turen lages 2–3 overskrifter fra navn/effekter/flavor.

Eksempel etter en runde:



“LAKE MONSTER SELFIE GOES VIRAL (+3% TRUTH)”



“AGENCY HOSTS WEATHER BALLOON WORKSHOP (NO QUESTIONS)”



“COALITION MARCH PACKS CAPITOL STEPS (PRESSURE +4 IN OH)”



15.8 Sjekkliste for tematisk QA



&nbsp;Er vitsen på fenomenet, ikke på folk?



&nbsp;Er byråkratisk vs. tabloid-kontrast tydelig?



&nbsp;Kan flavor-linjen stå alene som punchline?



&nbsp;Matcher navn/illustrasjon/effekt hverandre?



&nbsp;Kun én setning i flavor; ingen info-duplikat av tall.



Med dette som ledestjerne holder vi verdenen konsistent: konspira-kos med streng, lettlært regelkjerne—der hver spillhandling føles som en nyhetsstory som dytter kartet, narrativet og budsjettet i en ny retning.





