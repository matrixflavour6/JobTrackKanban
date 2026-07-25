import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  MoreVertical, 
  Star, 
  Clock, 
  Trash2, 
  Edit3,
  CheckCircle,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { JobApplication, STAGES, StageId } from '../types';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/icsExport';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onMoveStage: (id: string, newStage: StageId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onMoveStage,
  onDragStart,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Compute follow up urgency
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFollowUpDue = job.followUpDate && job.followUpDate <= todayStr && job.stage !== 'rejected' && job.stage !== 'offer';
  const isFollowUpToday = job.followUpDate === todayStr;

  // Generate color avatar for company
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 
      'bg-teal-600', 'bg-slate-700', 'bg-cyan-600', 'bg-rose-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      layout
      layoutId={job.id}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      draggable
      onDragStart={(e) => onDragStart(e, job.id)}
      className="group relative bg-white/90 backdrop-blur-xs rounded-2xl border border-black/6 p-4 shadow-2xs hover:shadow-md hover:border-black/10 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`w-8.5 h-8.5 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 ${getAvatarBg(job.company)} shadow-2xs tracking-wider`}>
            {job.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors tracking-tight">
                {job.position}
              </h3>
              {job.priority === 'high' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <Flame className="w-2.5 h-2.5 mr-0.5 fill-rose-500 text-rose-500" />
                  High
                </span>
              )}
              {job.priority === 'medium' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  Med
                </span>
              )}
              {job.priority === 'low' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  Low
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 truncate flex items-center mt-0.5">
              <Building2 className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
              {job.company}
            </p>
          </div>
        </div>

        {/* Quick Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-6 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
                <button
                  onClick={() => { setShowMenu(false); onEdit(job); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center text-slate-700 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Edit Details
                </button>
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center text-slate-700 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    Open Posting
                  </a>
                )}
                {job.followUpDate && (
                  <>
                    <a
                      href={getGoogleCalendarUrl(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-700 flex items-center cursor-pointer font-medium"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-2 text-blue-600" />
                      Add to Google Calendar
                    </a>
                    <button
                      onClick={() => { setShowMenu(false); downloadIcsFile(job); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      Download .ics File
                    </button>
                  </>
                )}
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => { setShowMenu(false); onDelete(job.id); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" />
                  Delete Card
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meta Info: Location, Salary */}
      <div className="space-y-1 my-2 text-xs text-slate-500">
        {job.location && (
          <div className="flex items-center text-slate-600">
            <MapPin className="w-3 h-3 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center text-slate-700 font-medium">
            <DollarSign className="w-3 h-3 mr-1.5 text-emerald-600 shrink-0" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      {/* Tags Chips */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2.5">
          {job.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{job.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Interview Rounds Indicator if any */}
      {job.interviewRounds && job.interviewRounds.length > 0 && (
        <div className="my-2 p-1.5 bg-purple-50/70 border border-purple-100 rounded-md text-[11px] text-purple-900 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1 text-purple-600" />
            <span>
              Interviews: {job.interviewRounds.filter(r => r.completed).length}/{job.interviewRounds.length} completed
            </span>
          </div>
        </div>
      )}

      {/* Follow Up Alert Banner if due */}
      {isFollowUpDue && (
        <div className={`my-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center justify-between shadow-2xs ${
          isFollowUpToday 
            ? 'bg-amber-50 text-amber-900 border border-amber-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>{isFollowUpToday ? 'Follow up today!' : 'Follow up overdue'}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); downloadIcsFile(job); }}
            title="Download .ics event for Apple/Google Calendar"
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/80 hover:bg-white text-[10px] font-semibold border border-black/10 cursor-pointer transition-colors"
          >
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>.ics</span>
          </button>
        </div>
      )}

      {/* Footer: Rating Stars + Applied Date & Stage Shift */}
      <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        
        {/* Rating Stars */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= (job.rating || 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Applied Date / Quick Stage Dropdown */}
        <div className="flex items-center space-x-2">
          {job.dateApplied && (
            <span className="flex items-center text-slate-400 text-[10px]">
              <Calendar className="w-3 h-3 mr-1 text-slate-300" />
              {job.dateApplied.slice(5)}
            </span>
          )}

          <select
            value={job.stage}
            onChange={(e) => onMoveStage(job.id, e.target.value as StageId)}
            className="text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200 rounded px-1 py-0.5 focus:outline-hidden cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

      </div>
    </motion.div>
  );
};
