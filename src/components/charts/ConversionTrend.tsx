import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { JobApplication } from '../../types';

interface ConversionTrendProps {
  applications: JobApplication[];
}

export const ConversionTrend: React.FC<ConversionTrendProps> = ({ applications }) => {
  const data = useMemo(() => {
    const applied = applications.filter(a => a.stage !== 'wishlist' && a.dateApplied);
    if (applied.length === 0) return [];

    const byMonth: Record<string, { applied: number; interviewed: number }> = {};
    applied.forEach(a => {
      const month = a.dateApplied.slice(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { applied: 0, interviewed: 0 };
      byMonth[month].applied += 1;
      if ((a.interviewRounds?.length || 0) >= 1) byMonth[month].interviewed += 1;
    });

    return Object.keys(byMonth)
      .sort()
      .slice(-9) // last 9 months of activity, keeps the chart readable
      .map(month => ({
        month: new Date(month + '-01').toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
        applied: byMonth[month].applied,
        responseRate: Math.round((byMonth[month].interviewed / byMonth[month].applied) * 100),
      }));
  }, [applications]);

  if (data.length < 2) {
    return (
      <div className="ledger-card rounded-md p-8 text-center text-ink-soft text-sm">
        Track applications across a couple of months to see your trend here.
      </div>
    );
  }

  return (
    <div className="ledger-card rounded-md p-4 sm:p-5">
      <h4 className="font-display font-semibold text-ink text-sm mb-3">Applications &amp; Interview Rate by Month</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
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
            contentStyle={{
              background: '#fffdf8',
              border: '1px solid rgba(35,32,27,0.12)',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }} />
          <Line type="monotone" dataKey="applied" name="Applications" stroke="#55606b" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line type="monotone" dataKey="responseRate" name="Interview rate %" stroke="#2f5d50" strokeWidth={2} dot={{ r: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
