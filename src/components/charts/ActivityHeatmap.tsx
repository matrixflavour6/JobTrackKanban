import React, { useMemo, useState } from 'react';
import { JobApplication } from '../../types';

interface ActivityHeatmapProps {
  applications: JobApplication[];
  weeks?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ applications, weeks = 18 }) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const { days, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      if (!a.dateApplied) return;
      counts[a.dateApplied] = (counts[a.dateApplied] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Align end to the coming Saturday so the grid reads as full weeks
    const endDay = new Date(today);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    const totalDays = weeks * 7;
    const start = new Date(endDay);
    start.setDate(start.getDate() - totalDays + 1);

    const list: { date: string; count: number; inFuture: boolean }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      list.push({ date: key, count: counts[key] || 0, inFuture: d > today });
    }
    const max = Math.max(...list.map(d => d.count), 1);
    return { days: list, maxCount: max };
  }, [applications, weeks]);

  const colorFor = (count: number) => {
    if (count === 0) return 'var(--color-paper-dim)';
    const ratio = count / maxCount;
    if (ratio > 0.75) return 'var(--color-ledger)';
    if (ratio > 0.45) return '#4d7d6f';
    if (ratio > 0.15) return '#7fa89b';
    return '#b7cec6';
  };

  // Group into columns of 7 (weeks)
  const columns: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  columns.forEach((col, ci) => {
    const d = new Date(col[0].date);
    if (d.getMonth() !== lastMonth) {
      monthLabels.push({ label: d.toLocaleDateString(undefined, { month: 'short' }), colIndex: ci });
      lastMonth = d.getMonth();
    }
  });

  const hovered = days.find(d => d.date === hoveredDay);

  return (
    <div className="ledger-card rounded-md p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display font-semibold text-ink text-sm">Application Activity</h4>
        <span className="font-ledger-mono text-[10px] text-ink-soft h-4">
          {hovered ? `${hovered.count} on ${hovered.date}` : `Last ${weeks} weeks`}
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: columns.length * 13 }}>
          <div className="flex gap-[3px] pl-0 h-3 relative">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[9px] text-ink-soft/70 font-ledger-mono"
                style={{ left: m.colIndex * 13 }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map(day => (
                  <div
                    key={day.date}
                    onMouseEnter={() => !day.inFuture && setHoveredDay(day.date)}
                    onMouseLeave={() => setHoveredDay(null)}
                    title={`${day.date}: ${day.count}`}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: day.inFuture ? 'transparent' : colorFor(day.count),
                      border: day.inFuture ? '1px dashed rgba(35,32,27,0.08)' : 'none',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
