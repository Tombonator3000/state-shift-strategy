import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MVP_COST_TABLE_ROWS,
  MVP_RULES_SECTIONS,
  MVP_RULES_TITLE,
} from '@/content/mvpRules';

interface EnhancedBalancingDashboardProps {
  onClose: () => void;
}

const EnhancedBalancingDashboard = ({ onClose }: EnhancedBalancingDashboardProps) => {
  const effectSection = MVP_RULES_SECTIONS.find((section) => section.title === 'Effect Whitelist (MVP)');
  const cardRolesSection = MVP_RULES_SECTIONS.find((section) => section.title === 'Card Roles');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-gray-950 border border-gray-700 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80">
          <div>
            <h2 className="text-lg font-semibold text-white font-mono tracking-wide">
              MVP BALANCING BRIEFING
            </h2>
            <p className="text-xs text-emerald-400 mt-1 font-mono">
              Focused analytics for ATTACK • MEDIA • ZONE cards
            </p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-200">
          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-white font-mono">{MVP_RULES_TITLE}</h3>
            <p className="text-slate-300 leading-relaxed">
              This dashboard summarises the minimal effect surface used for the ShadowGov MVP build. Anything outside this whitelist is hidden from analysis until it is migrated to the new ATTACK/MEDIA/ZONE framework.
            </p>
            <div className="flex flex-wrap gap-2">
              {['ATTACK', 'MEDIA', 'ZONE'].map((type) => (
                <Badge key={type} variant="outline" className="uppercase tracking-wide text-xs border-emerald-500 text-emerald-300">
                  {type}
                </Badge>
              ))}
              <Badge variant="outline" className="uppercase tracking-wide text-xs border-cyan-500 text-cyan-300">
                RARITIES: Common → Legendary
              </Badge>
            </div>
          </section>

          {effectSection && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">{effectSection.title}</h3>
              <ul className="space-y-2 text-slate-300">
                {effectSection.bullets?.map((bullet) => (
                  <li key={bullet} className="pl-4 relative">
                    <span className="absolute left-0 text-emerald-400">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                Legacy keywords such as DEFENSIVE, TECH, or INSTANT are ignored during MVP imports and will return once their effects are modelled with these primitives.
              </p>
            </section>
          )}

          {cardRolesSection && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-mono">{cardRolesSection.title}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {cardRolesSection.bullets?.map((bullet) => {
                  const [label, summary] = bullet.split(':');
                  return (
                    <div key={bullet} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                      <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">{label?.trim()}</div>
                      <div className="text-sm text-slate-200 mt-1 leading-relaxed">{summary?.trim()}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-white font-mono">MVP Cost Table</h3>
            <p className="text-slate-300 leading-relaxed">
              Compare candidate designs against the fixed IP budgets below. Deviations from these baselines should come with narrative or mechanical justification.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-900 text-slate-200">
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Rarity</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Attack</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Media</th>
                    <th className="border border-gray-800 px-3 py-2 font-mono uppercase tracking-wide">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {MVP_COST_TABLE_ROWS.map((row) => (
                    <tr key={row.rarity} className="odd:bg-gray-900/40">
                      <td className="border border-gray-800 px-3 py-2 font-semibold uppercase text-slate-100">
                        {row.rarity}
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-emerald-300">{row.attack.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.attack.cost}</div>
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-sky-300">{row.media.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.media.cost}</div>
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-slate-200">
                        <div className="font-semibold text-amber-300">{row.zone.effect}</div>
                        <div className="text-xs text-slate-400">Cost {row.zone.cost}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-white font-mono">Roadmap</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Deck simulations, win-rate tracking, and extension analytics will return once cards conform to MVP schemas.</li>
              <li>Upload or view non-MVP tags by enabling the legacy dashboard in developer tools.</li>
              <li>Share balance notes via design docs; this overlay stays canonical for playtesters.</li>
            </ul>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedBalancingDashboard;
