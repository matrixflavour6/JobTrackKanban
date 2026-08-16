import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  AlertCircle, 
  PieChart, 
  BarChart, 
  Briefcase, 
  Tag, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { JobApplication, STAGES } from '../types';
import { LockedGate } from './LockedGate';
import { SankeyFlow } from './charts/SankeyFlow';
import { ActivityHeatmap } from './charts/ActivityHeatmap';
import { ResponseTimeHistogram } from './charts/ResponseTimeHistogram';
import { ConversionTrend } from './charts/ConversionTrend';

interface AnalyticsViewProps {
  applications: JobApplication[];
  onEditJob: (job: JobApplication) => void;
  isLicensed: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ applications, onEditJob, isLicensed }) => {
  const total = applications.length;
  const applied = applications.filter(a => a.stage === 'applied').length;
  const interviewing = applications.filter(a => a.stage === 'interview').length;
  const offers = applications.filter(a => a.stage === 'offer').length;
  const rejected = applications.filter(a => a.stage === 'rejected').length;
  const wishlist = applications.filter(a => a.stage === 'wishlist').length;

  const totalSubmitted = applied + interviewing + offers + rejected;
  const responseRate = totalSubmitted > 0 ? Math.round(((interviewing + offers + rejected) / totalSubmitted) * 100) : 0;
  const offerRate = totalSubmitted > 0 ? Math.round((offers / totalSubmitted) * 100) : 0;
  const interviewConversion = totalSubmitted > 0 ? Math.round(((interviewing + offers) / totalSubmitted) * 100) : 0;

  // Overdue follow ups
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueJobs = applications.filter(
    a => a.followUpDate && a.followUpDate <= todayStr && a.stage !== 'rejected' && a.stage !== 'offer'
  );

  // Tags aggregation
  const tagCounts: Record<string, number> = {};
  applications.forEach(a => {
    (a.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-6">
      
      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="ledger-card p-5 rounded-md">
          <div className="flex items-center justify-between text-ink-soft/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked</span>
            <div className="p-2 rounded-xl bg-ledger-soft text-ledger">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">{total}</div>
          <p className="text-xs text-ink-soft/80 mt-1">
            {totalSubmitted} submitted applications
          </p>
        </div>

        <div className="ledger-card p-5 rounded-md">
          <div className="flex items-center justify-between text-ink-soft/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Rate</span>
            <div className="p-2 rounded-xl bg-plum-soft text-plum">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-plum">{interviewConversion}%</div>
          <p className="text-xs text-ink-soft/80 mt-1">
            {interviewing + offers} moved to interview stage
          </p>
        </div>

        <div className="ledger-card p-5 rounded-md">
          <div className="flex items-center justify-between text-ink-soft/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Offer Win Rate</span>
            <div className="p-2 rounded-xl bg-brass-soft text-brass">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-brass">{offerRate}%</div>
          <p className="text-xs text-ink-soft/80 mt-1">
            {offers} offer{offers !== 1 ? 's' : ''} received
          </p>
        </div>

        <div className="ledger-card p-5 rounded-md">
          <div className="flex items-center justify-between text-ink-soft/80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Response Rate</span>
            <div className="p-2 rounded-xl bg-paper-dim text-ink-soft">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">{responseRate}%</div>
          <p className="text-xs text-ink-soft/80 mt-1">
            Employers replied to application
          </p>
        </div>

      </div>

      {/* New: Flow diagram + supporting visualizations — licensed feature */}
      <LockedGate
        unlocked={isLicensed}
        title="Advanced Analytics is a licensed feature"
        description="Flow diagram, response-time trends, and activity heatmap — activate your license to unlock them. The pipeline funnel below stays free."
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-semibold text-ink text-base mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-ledger" />
              Where Your Applications Go
            </h3>
            <SankeyFlow applications={applications} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponseTimeHistogram applications={applications} />
            <ActivityHeatmap applications={applications} />
          </div>

          <ConversionTrend applications={applications} />
        </div>
      </LockedGate>

      {/* Main Grid: Pipeline Funnel + Overdue Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Visual Funnel */}
        <div className="lg:col-span-2 ledger-card p-5 sm:p-6 rounded-md">
          <h3 className="text-sm font-display font-semibold text-ink mb-4 flex items-center">
            <BarChart className="w-4 h-4 mr-2 text-ledger" />
            Application Pipeline Stages
          </h3>

          <div className="space-y-4">
            {STAGES.map((s) => {
              const count = applications.filter(a => a.stage === s.id).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-soft">{s.title}</span>
                    <span className="font-bold text-ink">
                      {count} <span className="text-ink-soft/60 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-paper-dim h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        s.id === 'wishlist' ? 'bg-slate' :
                        s.id === 'applied' ? 'bg-ledger' :
                        s.id === 'interview' ? 'bg-plum' :
                        s.id === 'offer' ? 'bg-brass' : 'bg-stamp'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Tags Cloud */}
          {sortedTags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-ink/6">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-ink-soft/80" />
                Top Application Categories / Tech Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-paper-dim text-ink-soft border border-ink/8"
                  >
                    #{tag}
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-paper-dim text-ink font-bold text-[10px]">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable Follow-up Reminders Panel */}
        <div className="ledger-card p-5 sm:p-6 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-semibold text-ink flex items-center">
              <Clock className="w-4 h-4 mr-2 text-brass" />
              Follow-up Action List
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brass-soft text-brass border border-brass">
              {overdueJobs.length} Due
            </span>
          </div>

          {overdueJobs.length === 0 ? (
            <div className="py-8 text-center text-ink-soft/60">
              <CheckCircle2 className="w-8 h-8 text-brass mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-ink-soft">All caught up!</p>
              <p className="text-[11px] text-ink-soft/60 mt-1">No pending follow-ups due right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onEditJob(job)}
                  className="p-3 bg-brass-soft/60 border border-brass/80 rounded-xl hover:bg-brass-soft/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink group-hover:text-ledger">
                        {job.company}
                      </h4>
                      <p className="text-[11px] text-ink-soft">{job.position}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brass-soft text-brass">
                      {job.followUpDate}
                    </span>
                  </div>
                  {job.contactName && (
                    <p className="text-[10px] text-ink-soft/80 mt-1.5 truncate">
                      Contact: {job.contactName} {job.contactEmail ? `(${job.contactEmail})` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
