import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay = ({ onBack }: HowToPlayProps) => {
  return (
    <div className="min-h-screen bg-government-dark text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-secret-red mb-2">
            How to Play — Shadow Government
          </h1>
          <p className="text-muted-foreground">
            En satirisk katt-og-mus-kamp om makt, sannhet og veldig mistenkelige duer. 
            Lær reglene raskt, spill smart, og la "avisa" oppsummere kaoset etter hver runde.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">Quick Start</h2>
              <ul className="space-y-2 text-sm">
                <li>• Trekk et kort i starten av din tur (maks 7 på hånd). Få +5 IP pluss stat-inntekt.</li>
                <li>• Spill opptil 3 kort ved å betale IP (Influence Points). Velg mål hvis kortet krever det.</li>
                <li>• Trykk Space for å avslutte turen. Det er 25 % sjanse for en tilfeldig hendelse.</li>
                <li>• Erobre stater ved å bygge Press til forsvarsnivået deres.</li>
                <li>• Vinn ved 10 stater, 200 IP, Sannhet ≥ 90 %/≤ 10 %, eller Hemmelig Agenda.</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">1) Rask oversikt</h2>
              <p className="text-sm mb-4">
                Shadow Government er et turbasert strategi-kortspill for to parter: Government (Deep State) og Truth Seekers. 
                Du samler IP (Influence Points), manipulerer Sannhet (Truth), og kjemper om kontrollen over USA-kartet. 
                Kort gir direkte effekter, varige fordeler eller presser stater mot din side.
              </p>
              <p className="text-sm">
                Etter hver runde ruller en avis-overlay inn med overskrifter, reklamer og hendelser – som enhver respektabel 
                sannhetssøker selvfølgelig tar med en klype salt.
              </p>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">3) Slik vinner du</h2>
              <p className="text-sm mb-2">Du vinner straks ett av disse skjer:</p>
              <ul className="space-y-2 text-sm">
                <li>• Kontroller 10 stater</li>
                <li>• Nå 200 IP</li>
                <li>• Sannhetsseier:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>- Spiller du Truth: Sannhet ≥ 90 %</li>
                    <li>- Spiller du Government: Sannhet ≤ 10 %</li>
                  </ul>
                </li>
                <li>• Fullfør Hemmelig Agenda (Trekkes ved start. Typisk "Eier D.C. + 2 naboer" eller liknende)</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">4) Oppsett og startbonuser</h2>
              <ul className="space-y-2 text-sm">
                <li>• Baseline Sannhet: 50 %</li>
                <li>• Velger du Government: du starter med +10 IP og Sannhet settes til 40–50 %</li>
                <li>• Velger du Truth: Sannhet starter på 60 %; du får én ekstra korttrekning ved første utdeling</li>
                <li>• Begge sider starter med 5 kort på hånd (Truth kan få 6 første runde), håndgrense 7</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">5) Runden steg-for-steg</h2>
              <p className="text-sm font-bold mb-2">TURSLØYFE: Trekk → Spill opptil 3 kort → Effekter → 25 % Hendelse → Slutt tur → Motstander</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Inntekt</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• Få +5 IP grunninntekt</li>
                    <li>• stat-inntekt: hver stat gir IP lik sitt forsvar (2/3/4)</li>
                    <li>• eventuelle utviklinger (Development-kort)</li>
                    <li>• Trekk 1 kort (ikke over 7 på hånd)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Handling</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• Spill opptil 3 kort. Betal IP-kostnaden</li>
                    <li>• Målrett hvis kortet krever det (stat/spiller/globalt). Klikk en stat på kartet for statsmål</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Reaksjonsvindu</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• Når du rammer motstanderen med ATTACK/MEDIA, kan forsvareren spille ett DEFENSIVE/INSTANT</li>
                    <li>• Deretter kan angriper spille ett INSTANT som svar</li>
                    <li>• LIFO: Siste kort ut løses først. Stopp når ingen svar spilles</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">6) Korttyper og målretting</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-secret-red">MEDIA</strong> – Flytter Sannhet opp/ned
                  <br />
                  <em>Moon Landing Hoax: +15 % Sannhet i din favør. Eier du D.C., får du +5 ekstra på slike kort.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">ZONE</strong> – Legger Press i valgt stat
                  <br />
                  <em>Local Influence: +1 Press i valgt stat.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">ATTACK</strong> – Rammer motstanderens IP/kort/økonomi
                  <br />
                  <em>Leaked Documents: motstander −8 IP.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">TECH</strong> – Avanserte verktøy/engangs-power
                  <br />
                  <em>California gir −2 IP på TECH.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">DEVELOPMENT</strong> – Varige bonuser
                  <br />
                  <em>f.eks. +1 IP/turn, maks 3 aktive</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">DEFENSIVE</strong> – Skjold og kontringer
                  <br />
                  <em>Bunker: immun mot angrep denne runden. [REDACTED]: kontring av neste fiendekort.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">INSTANT</strong> – Umiddelbar respons som kan spilles i reaksjonsvindu
                  <br />
                  <em>Crisis Actors: fienden skipper én kort-handling.</em>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">7) Kart & delstater</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-secret-red">Forsvar:</strong> Hver stat har 2/3/4 i forsvar
                  <ul className="ml-4 space-y-1">
                    <li>• De fleste er 2</li>
                    <li>• CA/NY/TX/FL/PA/IL (m.fl.) er 3</li>
                    <li>• DC/AK/HI er 4</li>
                  </ul>
                </div>
                
                <div>
                  <strong className="text-secret-red">Spesialbonus:</strong>
                  <ul className="ml-4 space-y-1">
                    <li>• Texas: +2 IP per runde (økonomi)</li>
                    <li>• New York: −2 IP på MEDIA</li>
                    <li>• California: −2 IP på TECH</li>
                    <li>• D.C.: +5 på Sannhet-manipulasjon</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">Tips</h2>
              <ul className="space-y-2 text-sm">
                <li>• Sikre en økonomibase: Texas, pluss 2–3 midtstater med forsvar 2 gir jevn IP</li>
                <li>• Synkroniser MEDIA-kort med D.C. for store sannhetssprang</li>
                <li>• Press brede grensestater for å åpne flere fronter</li>
                <li>• Behold ett defensivt kort i lomma når du mistenker et stort angrep</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>

        <div className="mt-6 text-center">
          <Button onClick={onBack} className="bg-secret-red hover:bg-secret-red/80">
            Tilbake til meny
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;