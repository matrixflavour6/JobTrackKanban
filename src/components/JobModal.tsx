import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Star, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Link as LinkIcon, 
  User, 
  Mail, 
  Tag as TagIcon,
  FileText,
  Flame,
  Flag
} from 'lucide-react';
import { JobApplication, STAGES, StageId, Priority, InterviewRound } from '../types';
import { downloadIcsFile, getGoogleCalendarUrl, getOutlookCalendarUrl } from '../utils/icsExport';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  initialJob?: JobApplication | null;
  defaultStage?: StageId;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
  defaultStage = 'applied',
}) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [stage, setStage] = useState<StageId>(defaultStage);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dateApplied, setDateApplied] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([]);

  // New interview round input
  const [newRoundTitle, setNewRoundTitle] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('');

  useEffect(() => {
    if (initialJob) {
      setCompany(initialJob.company || '');
      setPosition(initialJob.position || '');
      setLocation(initialJob.location || '');
      setSalary(initialJob.salary || '');
      setStage(initialJob.stage || defaultStage);
      setPriority(initialJob.priority || 'medium');
      setDateApplied(initialJob.dateApplied || '');
      setFollowUpDate(initialJob.followUpDate || '');
      setJobUrl(initialJob.jobUrl || '');
      setContactName(initialJob.contactName || '');
      setContactEmail(initialJob.contactEmail || '');
      setNotes(initialJob.notes || '');
      setRating(initialJob.rating || 3);
      setTags(initialJob.tags || []);
      setInterviewRounds(initialJob.interviewRounds || []);
    } else {
      setCompany('');
      setPosition('');
      setLocation('Remote');
      setSalary('');
      setStage(defaultStage);
      setPriority('medium');
      setDateApplied(new Date().toISOString().slice(0, 10));
      setFollowUpDate('');
      setJobUrl('');
      setContactName('');
      setContactEmail('');
      setNotes('');
      setRating(3);
      setTags(['Full-time']);
      setInterviewRounds([]);
    }
  }, [initialJob, defaultStage, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddInterviewRound = () => {
    if (!newRoundTitle.trim()) return;
    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      title: newRoundTitle.trim(),
      date: newRoundDate || new Date().toISOString().slice(0, 10),
      completed: false,
    };
    setInterviewRounds([...interviewRounds, newRound]);
    setNewRoundTitle('');
    setNewRoundDate('');
  };

  const handleToggleRound = (roundId: string) => {
    setInterviewRounds(interviewRounds.map(r => 
      r.id === roundId ? { ...r, completed: !r.completed } : r
    ));
  };

  const handleRemoveRound = (roundId: string) => {
    setInterviewRounds(interviewRounds.filter(r => r.id !== roundId));
  };

  const setFollowUpDaysFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    const jobData: JobApplication = {
      id: initialJob ? initialJob.id : `job-${Date.now()}`,
      company: company.trim(),
      position: position.trim(),
      location: location.trim(),
      salary: salary.trim(),
      stage,
      priority,
      dateApplied,
      followUpDate,
      jobUrl: jobUrl.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      notes: notes.trim(),
      tags,
      rating,
      updatedAt: new Date().toISOString(),
      interviewRounds,
    };

    onSave(jobData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialJob ? 'Edit Job Application' : 'Add New Job Application'}
            </h2>
            <p className="text-xs text-slate-500">
              Store details locally in your browser
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {/* Primary Fields: Company, Position, Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Figma, Vercel"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Job Position / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Application Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as StageId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Location / Work Type</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, SF, NYC"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Salary Range / Compensation</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $150k - $180k"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Dates & Follow Up Reminders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Date Applied
              </label>
              <input
                type="date"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Follow-up Reminder Date
                </label>
                <div className="flex space-x-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFollowUpDaysFromToday(3)}
                    className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  >
                    +3d
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowUpDaysFromToday(7)}
                    className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  >
                    +1w
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowUpDaysFromToday(14)}
                    className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
                  >
                    +2w
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {followUpDate && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <a
                      href={getGoogleCalendarUrl({ company, position, followUpDate, jobUrl, notes })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 cursor-pointer transition-colors"
                    >
                      + Google Calendar
                    </a>
                    <a
                      href={getOutlookCalendarUrl({ company, position, followUpDate, jobUrl })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 cursor-pointer transition-colors"
                    >
                      + Outlook Web
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadIcsFile({ company, position, followUpDate, jobUrl, notes })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 cursor-pointer transition-colors"
                    >
                      .ics File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job URL & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center">
                <LinkIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Job Posting URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Contact Person Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah (Recruiter)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Priority, Rating & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center">
                <Flag className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                    priority === 'low'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                    priority === 'medium'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center ${
                    priority === 'high'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 mr-1" />
                  High
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center">
                <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Interest Rating
              </label>
              <div className="flex items-center space-x-1 py-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden cursor-pointer transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : ''}`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-500 ml-1.5 font-medium">({rating}/5)</span>
              </div>
            </div>
          </div>

          {/* Tags / Categories */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center">
              <TagIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Tags / Categories
            </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type & press Enter (e.g. Remote, React)"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="ml-1 text-blue-400 hover:text-blue-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          {/* Interview Process Rounds Tracker */}
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3">
            <h3 className="font-bold text-purple-950 flex items-center text-xs">
              Interview Rounds & Stage Tracker
            </h3>

            {interviewRounds.length > 0 && (
              <div className="space-y-2">
                {interviewRounds.map((round) => (
                  <div key={round.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs text-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleRound(round.id)}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        {round.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-purple-300" />
                        )}
                      </button>
                      <span className={`font-semibold ${round.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {round.title}
                      </span>
                      <span className="text-[10px] text-slate-400">({round.date})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRound(round.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Round title (e.g. Recruiter Call, System Design)"
                value={newRoundTitle}
                onChange={(e) => setNewRoundTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-900 focus:outline-hidden text-xs"
              />
              <input
                type="date"
                value={newRoundDate}
                onChange={(e) => setNewRoundDate(e.target.value)}
                className="px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-900 text-xs"
              />
              <button
                type="button"
                onClick={handleAddInterviewRound}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold text-xs cursor-pointer flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Round
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Application Notes & Prep
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key company research, interview prep reminders, referral names, salary offer details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {initialJob ? 'Save Changes' : 'Add Application'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
