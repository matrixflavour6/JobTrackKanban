import React, { useMemo, useState } from 'react';
import { Scale, Info, TrendingUp } from 'lucide-react';
import { JobApplication } from '../types';

interface OfferComparisonViewProps {
  applications: JobApplication[];
  onUpdateJob: (id: string, patch: Partial<JobApplication>) => void;
}

type WeightKey = 'compensation' | 'commute' | 'culture' | 'growth';

const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  compensation: 30,
  commute: 15,
  culture: 25,
  growth: 30,
};

/** Best-effort extraction of an annual comp figure from free-text salary strings. */
function parseSalaryEstimate(salary: string): number | null {
  if (!salary) return null;
  const cleaned = salary.replace(/,/g, '');
  const matches = cleaned.match(/\$?\s*(\d+(?:\.\d+)?)\s*(k|K)?/g);
  if (!matches || matches.length === 0) return null;

  const numbers = matches
    .map(m => {
      const isK = /k/i.test(m);
      const num = parseFloat(m.replace(/[^\d.]/g, ''));
      if (isNaN(num)) return null;
      // Treat bare numbers under 1000 as "thousands" shorthand (e.g. "120" meaning $120k)
      const scaled = isK || num < 1000 ? num * 1000 : num;
      return scaled;
    })
    .filter((n): n is number => n !== null && n > 1000); // discard noise like a stray "40" (hours/week)

  if (numbers.length === 0) return null;
  // Average if a range ("120k - 140k") was given
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

const SLIDER_FIELDS: { key: keyof NonNullable<JobApplication['offerScoring']>; label: string; weightKey: WeightKey }[] = [
  { key: 'compSatisfaction', label: 'Comp Satisfaction', weightKey: 'compensation' },
  { key: 'culture', label: 'Culture', weightKey: 'culture' },
  { key: 'growth', label: 'Growth Potential', weightKey: 'growth' },
];

export const OfferComparisonView: React.FC<OfferComparisonViewProps> = ({ applications, onUpdateJob }) => {
  const [includeInterviewing, setIncludeInterviewing] = useState(false);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);

  const candidates = useMemo(() => {
    return applications.filter(a => a.stage === 'offer' || (includeInterviewing && a.stage === 'interview'));
  }, [applications, includeInterviewing]);

  const totalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0) || 1;

  const scored = useMemo(() => {
    const salaryEstimates = candidates.map(c => parseSalaryEstimate(c.salary));
    const maxSalary = Math.max(...salaryEstimates.filter((n): n is number => n !== null), 0);
    const commutes = candidates.map(c => c.offerScoring?.commuteMinutes);
    const maxCommute = Math.max(...commutes.filter((n): n is number => n !== undefined), 0);

    return candidates.map((job, i) => {
      const scoring = job.offerScoring || {};
      const salaryEstimate = salaryEstimates[i];

      // Compensation score: blend the parsed salary (relative to the highest offer) with
      // the user's own satisfaction slider, since "highest number" isn't always "best offer"
      // (benefits, equity, bonus aren't captured in salary text).
      const salaryRelative = salaryEstimate && maxSalary > 0 ? (salaryEstimate / maxSalary) * 10 : null;
      const compScore = salaryRelative !== null && scoring.compSatisfaction
        ? (salaryRelative + scoring.compSatisfaction) / 2
        : salaryRelative ?? scoring.compSatisfaction ?? 5;

      // Commute score: shorter is better, scored relative to the longest commute among candidates
      const commuteScore = scoring.commuteMinutes !== undefined && maxCommute > 0
        ? 10 - (scoring.commuteMinutes / maxCommute) * 10
        : 5;

      const cultureScore = scoring.culture ?? 5;
      const growthScore = scoring.growth ?? 5;

      const weighted =
        (compScore * weights.compensation +
          commuteScore * weights.commute +
          cultureScore * weights.culture +
          growthScore * weights.growth) / totalWeight;

      return { job, salaryEstimate, compScore, commuteScore, cultureScore, growthScore, weighted };
    }).sort((a, b) => b.weighted - a.weighted);
  }, [candidates, weights, totalWeight]);

  if (candidates.length === 0) {
    return (
      <div className="ledger-card rounded-md p-10 text-center max-w-lg mx-auto mt-8">
        <Scale className="w-8 h-8 text-ink-soft/40 mx-auto mb-3" />
        <h3 className="font-display font-semibold text-ink text-base mb-1.5">No offers to compare yet</h3>
        <p className="text-sm text-ink-soft/80 mb-4">
          Once an application reaches the "Offer Received" stage, it'll show up here to score against your other offers.
        </p>
        <button
          onClick={() => setIncludeInterviewing(true)}
          className="text-xs font-semibold text-ledger hover:opacity-80"
        >
          Or include applications still in interviews →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-ink text-xl flex items-center">
            <Scale className="w-5 h-5 mr-2 text-ledger" />
            Offer Comparison
          </h2>
          <p className="text-xs text-ink-soft/80 mt-0.5">
            Weighted scoring across compensation, commute, culture, and growth — adjust the weights to match what matters to you.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-ink-soft cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeInterviewing}
            onChange={e => setIncludeInterviewing(e.target.checked)}
            className="accent-ledger w-3.5 h-3.5"
          />
          Include applications still interviewing
        </label>
      </div>

      {/* Weight sliders */}
      <div className="ledger-card rounded-md p-4 sm:p-5">
        <div className="flex items-center text-[11px] font-ledger-mono text-ink-soft mb-3">
          <Info className="w-3.5 h-3.5 mr-1.5" />
          What matters most to you? (weights, out of 100 total)
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(weights) as WeightKey[]).map(key => (
            <div key={key}>
              <div className="flex justify-between text-[11px] font-medium text-ink mb-1 capitalize">
                <span>{key}</span>
                <span className="font-ledger-mono text-ink-soft">{weights[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[key]}
                onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
                className="w-full accent-ledger"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Ranked comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scored.map(({ job, weighted, salaryEstimate }, rank) => (
          <div key={job.id} className="ledger-card rounded-md p-4 relative">
            {rank === 0 && (
              <div className="ledger-stamp absolute -top-2 right-3 text-brass bg-brass-soft">Top Pick</div>
            )}
            <div className="mb-3">
              <h3 className="font-display font-semibold text-ink text-base truncate">{job.position}</h3>
              <p className="text-xs text-ink-soft/80 truncate">{job.company}</p>
            </div>

            <div className="flex items-center justify-between mb-3 pb-3 border-b border-ink/8">
              <span className="text-[11px] font-ledger-mono text-ink-soft">Weighted Score</span>
              <span className="font-display font-semibold text-ledger text-lg">{weighted.toFixed(1)} / 10</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-ink-soft flex justify-between">
                  <span>Salary (parsed)</span>
                  <span className="font-ledger-mono">
                    {salaryEstimate ? `~$${Math.round(salaryEstimate).toLocaleString()}` : job.salary || '—'}
                  </span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-soft flex justify-between mb-1">
                  <span>Commute (minutes)</span>
                  <span className="font-ledger-mono">{job.offerScoring?.commuteMinutes ?? '—'}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 25"
                  value={job.offerScoring?.commuteMinutes ?? ''}
                  onChange={e =>
                    onUpdateJob(job.id, {
                      offerScoring: { ...job.offerScoring, commuteMinutes: e.target.value ? Number(e.target.value) : undefined },
                    })
                  }
                  className="w-full px-2 py-1.5 text-xs bg-paper-dim border border-ink/10 rounded-md focus:outline-hidden focus:border-ledger"
                />
              </div>

              {SLIDER_FIELDS.map(field => (
                <div key={field.key}>
                  <label className="text-[11px] font-medium text-ink-soft flex justify-between mb-1">
                    <span>{field.label}</span>
                    <span className="font-ledger-mono">{(job.offerScoring?.[field.key] as number) ?? 5}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={(job.offerScoring?.[field.key] as number) ?? 5}
                    onChange={e =>
                      onUpdateJob(job.id, {
                        offerScoring: { ...job.offerScoring, [field.key]: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-ledger"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-ink-soft/60 text-center flex items-center justify-center gap-1.5">
        <TrendingUp className="w-3 h-3" />
        Salary is parsed from the free-text salary field as a rough estimate — treat it as a starting point, not exact math.
      </p>
    </div>
  );
};
