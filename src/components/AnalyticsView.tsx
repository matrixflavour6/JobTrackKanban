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

interface AnalyticsViewProps {
  applications: JobApplication[];
  onEditJob: (job: JobApplication) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ applications, onEditJob }) => {
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
        
        <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-black/5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-xs text-slate-500 mt-1">
            {totalSubmitted} submitted applications
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-black/5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Rate</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{interviewConversion}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {interviewing + offers} moved to interview stage
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-black/5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Offer Win Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{offerRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {offers} offer{offers !== 1 ? 's' : ''} received
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-black/5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Response Rate</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{responseRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            Employers replied to application
          </p>
        </div>

      </div>

      {/* Main Grid: Pipeline Funnel + Overdue Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Visual Funnel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <BarChart className="w-4 h-4 mr-2 text-blue-600" />
            Application Pipeline Stages
          </h3>

          <div className="space-y-4">
            {STAGES.map((s) => {
              const count = applications.filter(a => a.stage === s.id).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{s.title}</span>
                    <span className="font-bold text-slate-900">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        s.id === 'wishlist' ? 'bg-slate-400' :
                        s.id === 'applied' ? 'bg-blue-500' :
                        s.id === 'interview' ? 'bg-purple-500' :
                        s.id === 'offer' ? 'bg-emerald-500' : 'bg-rose-400'
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
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Top Application Categories / Tech Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{tag}
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable Follow-up Reminders Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-600" />
              Follow-up Action List
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {overdueJobs.length} Due
            </span>
          </div>

          {overdueJobs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-slate-600">All caught up!</p>
              <p className="text-[11px] text-slate-400 mt-1">No pending follow-ups due right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onEditJob(job)}
                  className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl hover:bg-amber-100/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {job.company}
                      </h4>
                      <p className="text-[11px] text-slate-600">{job.position}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {job.followUpDate}
                    </span>
                  </div>
                  {job.contactName && (
                    <p className="text-[10px] text-slate-500 mt-1.5 truncate">
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
