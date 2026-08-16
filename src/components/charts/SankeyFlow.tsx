import React, { useMemo, useState } from 'react';
import { JobApplication } from '../../types';

interface SankeyNode {
  id: string;
  label: string;
  value: number;
  column: number;
  color: string; // hex
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyFlowProps {
  applications: JobApplication[];
}

const TOKENS = {
  slate: '#55606b',
  ledger: '#2f5d50',
  plum: '#6a4f7a',
  brass: '#b8912f',
  stamp: '#a23e2f',
  ink: '#23201b',
};

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ applications }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, links, total } = useMemo(() => {
    // Only applications actually submitted count toward the funnel (wishlist = not yet applied)
    const applied = applications.filter(a => a.stage !== 'wishlist');
    const gotInterview = applied.filter(a => (a.interviewRounds?.length || 0) >= 1);
    const noInterview = applied.filter(a => (a.interviewRounds?.length || 0) === 0);

    const noInterviewRejected = noInterview.filter(a => a.stage === 'rejected');
    const noInterviewAwaiting = noInterview.filter(a => a.stage !== 'rejected');

    const interviewOffer = gotInterview.filter(a => a.stage === 'offer');
    const interviewRejected = gotInterview.filter(a => a.stage === 'rejected');
    const interviewStillActive = gotInterview.filter(a => a.stage !== 'offer' && a.stage !== 'rejected');

    const n: SankeyNode[] = [
      { id: 'applications', label: 'Applications', value: applied.length, column: 0, color: TOKENS.ink },
      { id: 'no_interview', label: 'No Interview Yet', value: noInterview.length, column: 1, color: TOKENS.slate },
      { id: 'got_interview', label: 'Got Interview', value: gotInterview.length, column: 1, color: TOKENS.plum },
      { id: 'awaiting', label: 'Awaiting Response', value: noInterviewAwaiting.length, column: 2, color: TOKENS.slate },
      { id: 'rejected_early', label: 'Rejected', value: noInterviewRejected.length, column: 2, color: TOKENS.stamp },
      { id: 'still_interviewing', label: 'Still Interviewing', value: interviewStillActive.length, column: 2, color: TOKENS.plum },
      { id: 'offer', label: 'Offer', value: interviewOffer.length, column: 2, color: TOKENS.brass },
      { id: 'rejected_after', label: 'Rejected', value: interviewRejected.length, column: 2, color: TOKENS.stamp },
    ].filter(node => node.value > 0 || node.id === 'applications');

    const l: SankeyLink[] = [
      { source: 'applications', target: 'no_interview', value: noInterview.length },
      { source: 'applications', target: 'got_interview', value: gotInterview.length },
      { source: 'no_interview', target: 'awaiting', value: noInterviewAwaiting.length },
      { source: 'no_interview', target: 'rejected_early', value: noInterviewRejected.length },
      { source: 'got_interview', target: 'still_interviewing', value: interviewStillActive.length },
      { source: 'got_interview', target: 'offer', value: interviewOffer.length },
      { source: 'got_interview', target: 'rejected_after', value: interviewRejected.length },
    ].filter(link => link.value > 0);

    return { nodes: n, links: l, total: applied.length };
  }, [applications]);

  if (total === 0) {
    return (
      <div className="ledger-card rounded-md p-8 text-center text-ink-soft text-sm">
        Add a few applications to see your flow diagram.
      </div>
    );
  }

  // Layout
  const width = 720;
  const height = 320;
  const nodeWidth = 14;
  const columnGap = (width - nodeWidth) / 2;
  const columns = [0, 1, 2].map(c => nodes.filter(n => n.column === c));
  const maxColValue = Math.max(...columns.map(col => col.reduce((s, n) => s + n.value, 0)), 1);
  const scale = (height - (Math.max(...columns.map(c => c.length)) - 1) * 14) / maxColValue;

  const nodePositions: Record<string, { x: number; y: number; h: number }> = {};
  columns.forEach((col, ci) => {
    let y = (height - (col.reduce((s, n) => s + n.value, 0) * scale + (col.length - 1) * 14)) / 2;
    col.forEach(node => {
      const h = Math.max(node.value * scale, 3);
      nodePositions[node.id] = { x: ci * columnGap, y, h };
      y += h + 14;
    });
  });

  // Track cumulative offsets for multiple links leaving/entering the same node
  const outOffsets: Record<string, number> = {};
  const inOffsets: Record<string, number> = {};

  const linkPaths = links.map((link, i) => {
    const s = nodePositions[link.source];
    const t = nodePositions[link.target];
    if (!s || !t) return null;
    const lh = link.value * scale;

    const sy = s.y + (outOffsets[link.source] || 0);
    const ty = t.y + (inOffsets[link.target] || 0);
    outOffsets[link.source] = (outOffsets[link.source] || 0) + lh;
    inOffsets[link.target] = (inOffsets[link.target] || 0) + lh;

    const x0 = s.x + nodeWidth;
    const x1 = t.x;
    const xm = (x0 + x1) / 2;

    const path = `M ${x0},${sy} C ${xm},${sy} ${xm},${ty} ${x1},${ty} L ${x1},${ty + lh} C ${xm},${ty + lh} ${xm},${sy + lh} ${x0},${sy + lh} Z`;
    const targetNode = nodes.find(n => n.id === link.target);
    const isActive = hovered === null || hovered === link.source || hovered === link.target;

    return (
      <path
        key={i}
        d={path}
        fill={targetNode?.color || TOKENS.slate}
        opacity={isActive ? 0.32 : 0.08}
        style={{ transition: 'opacity 0.15s' }}
      />
    );
  });

  return (
    <div className="ledger-card rounded-md p-4 sm:p-5 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 24}`} width="100%" style={{ minWidth: 560 }} role="img" aria-label="Application flow diagram">
        <g transform="translate(0, 8)">
          {linkPaths}
          {nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isActive = hovered === null || hovered === node.id;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={nodeWidth}
                  height={pos.h}
                  fill={node.color}
                  opacity={isActive ? 1 : 0.35}
                  rx={2}
                  style={{ transition: 'opacity 0.15s' }}
                />
                <text
                  x={node.column === 2 ? pos.x - 8 : pos.x + nodeWidth + 8}
                  y={pos.y + pos.h / 2}
                  textAnchor={node.column === 2 ? 'end' : 'start'}
                  dominantBaseline="middle"
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="11"
                  fill={TOKENS.ink}
                  opacity={isActive ? 1 : 0.4}
                >
                  {node.label} ({node.value})
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="text-[11px] text-ink-soft/70 mt-2 font-ledger-mono">
        Derived from interview rounds logged per application — log a round when you get one to keep this accurate.
      </p>
    </div>
  );
};
