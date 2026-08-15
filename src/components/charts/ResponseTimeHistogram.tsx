import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JobApplication } from '../../types';

interface ResponseTimeHistogramProps {
  applications: JobApplication[];
}

const BUCKETS = [
  { label: '0-2d', min: 0, max: 2 },
  { label: '3-5d', min: 3, max: 5 },
  { label: '6-10d', min: 6, max: 10 },
  { label: '11-20d', min: 11, max: 20 },
  { label: '21-30d', min: 21, max: 30 },
  { label: '30d+', min: 31, max: Infinity },
];

export const ResponseTimeHistogram: React.FC<ResponseTimeHistogramProps> = ({ applications }) => {
  const { data, sampleSize } = useMemo(() => {
    // Only jobs that have moved past "applied" carry a meaningful response-time signal
    const responded = applications.filter(
      a => a.stage !== 'wishlist' && a.stage !== 'applied' && a.dateApplied && a.updatedAt
    );

    const days = responded.map(a => {
      const applied = new Date(a.dateApplied).getTime();
      const updated = new Date(a.updatedAt).getTime();
      return Math.max(0, Math.round((updated - applied) / (1000 * 60 * 60 * 24)));
    });

    const counts = BUCKETS.map(b => ({
      label: b.label,
      count: days.filter(d => d >= b.min && d <= b.max).length,
    }));

    return { data: counts, sampleSize: responded.length };
  }, [applications]);

  if (sampleSize === 0) {
    return (
      <div className="ledger-card rounded-md p-8 text-center text-ink-soft text-sm">
        Response times will show up here once applications move past "Applied."
      </div>
    );
  }

  return (
    <div className="ledger-card rounded-md p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-semibold text-ink text-sm">Time to First Response</h4>
        <span className="font-ledger-mono text-[10px] text-ink-soft">n = {sampleSize}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#55606b', fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={{ stroke: 'rgba(35,32,27,0.15)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#55606b', fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: 'rgba(47,93,80,0.06)' }}
            contentStyle={{
              background: '#fffdf8',
              border: '1px solid rgba(35,32,27,0.12)',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#2f5d50" fillOpacity={0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-ink-soft/70 mt-1 font-ledger-mono">
        Days between applying and the card's last status change — a proxy for how long each company took to respond.
      </p>
    </div>
  );
};
