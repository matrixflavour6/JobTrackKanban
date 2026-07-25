import React from 'react';
import { 
  Briefcase, 
  Plus, 
  Download, 
  Kanban, 
  Table as TableIcon, 
  ShieldCheck, 
  Search, 
  Filter,
  Clock,
  Send,
  Award,
  BookOpen,
  Globe,
  X
} from 'lucide-react';
import { JobApplication, STAGES } from '../types';
import { LicenseState } from '../utils/storage';
import { Key } from 'lucide-react';

interface HeaderProps {
  applications: JobApplication[];
  viewMode: 'kanban' | 'table' | 'analytics';
  setViewMode: (mode: 'kanban' | 'table' | 'analytics') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenToolkitModal: () => void;
  onOpenPortalSyncModal: () => void;
  licenseState: LicenseState;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  applications,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  allTags,
  onOpenAddModal,
  onOpenExportModal,
  onOpenToolkitModal,
  onOpenPortalSyncModal,
  licenseState,
  onOpenLoginModal,
}) => {
  // Compute key stats
  const totalApplied = applications.filter(a => a.stage !== 'wishlist').length;
  const interviewing = applications.filter(a => a.stage === 'interview').length;
  const offers = applications.filter(a => a.stage === 'offer').length;

  // Overdue follow-ups
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = applications.filter(a => {
    if (!a.followUpDate || a.stage === 'rejected' || a.stage === 'offer') return false;
    return a.followUpDate <= todayStr;
  }).length;

  return (
    <header className="apple-glass sticky top-0 z-20 border-b border-black/5 shadow-2xs">
      {/* Top Banner Bar */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Privacy Badge */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-sm shrink-0 border border-white/10">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  JobTrack<span className="text-blue-600 font-extrabold">Kanban</span>
                </h1>
                <button
                  onClick={onOpenLoginModal}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                    licenseState?.isAuthenticated && !licenseState?.isGuest
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-500/20'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/20'
                  }`}
                  title="Click to manage Gumroad license key"
                >
                  <ShieldCheck className={`w-3 h-3 mr-1 ${licenseState?.isAuthenticated && !licenseState?.isGuest ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span>{licenseState?.isAuthenticated && !licenseState?.isGuest ? 'Gumroad Licensed Pro' : 'Demo Mode (Limited)'}</span>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block font-normal">
                Intelligent job application pipeline with client-side privacy
              </p>
            </div>
          </div>

          {/* Quick Stats Summary Pills */}
          <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1 lg:pb-0 scrollbar-none whitespace-nowrap">
            <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-100/80 border border-black/5 shrink-0">
              <Send className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <span className="text-slate-500 mr-1 hidden sm:inline font-medium">Applications:</span>
              <span className="font-bold text-slate-900">{totalApplied}</span>
            </div>

            <div className="flex items-center px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 shrink-0">
              <Clock className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
              <span className="text-slate-500 mr-1 hidden sm:inline font-medium">Interviewing:</span>
              <span className="font-bold text-purple-800">{interviewing}</span>
            </div>

            <div className="flex items-center px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <Award className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              <span className="text-slate-500 mr-1 hidden sm:inline font-medium">Offers:</span>
              <span className="font-bold text-emerald-800">{offers}</span>
            </div>

            {overdueCount > 0 && (
              <div className="flex items-center px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 font-semibold animate-pulse shrink-0">
                <span>{overdueCount} Due</span>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenPortalSyncModal}
              className="inline-flex items-center px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xs transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-200" />
              <span className="hidden sm:inline">Connect Portals</span>
              <span className="sm:hidden text-[11px]">Portals</span>
            </button>

            <button
              onClick={onOpenToolkitModal}
              className="inline-flex items-center px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-black/5 shadow-2xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              <span className="hidden sm:inline">Job Toolkit</span>
              <span className="sm:hidden text-[11px]">Toolkit</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-black/5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden text-[11px]">Export</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>New Job</span>
            </button>
          </div>

        </div>

        {/* Filter & View Switcher Sub-bar */}
        <div className="mt-2.5 pt-2.5 border-t border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* View Mode Buttons (Apple-style Segmented Control) */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl border border-black/5 self-start md:self-auto shrink-0 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Search Bar & Tag Filter Controls */}
          <div className="flex items-center space-x-2 flex-1 max-w-full md:max-w-md w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search company, position, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white/70 hover:bg-white focus:bg-white border border-black/10 focus:border-blue-500 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Tag Filter Selector */}
            {allTags.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="pl-7 pr-6 py-1.5 bg-white/70 border border-black/10 rounded-full text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-all"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
