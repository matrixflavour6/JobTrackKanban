import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Scale,
  User,
  Cloud,
  CloudOff,
  RefreshCw,
  X
} from 'lucide-react';
import { JobApplication, STAGES } from '../types';
import { LicenseState } from '../utils/storage';
import { Key } from 'lucide-react';

interface HeaderProps {
  applications: JobApplication[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  onOpenAddModal: () => void;
  licenseState: LicenseState;
  onOpenLoginModal: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  onSyncNow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  applications,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  allTags,
  onOpenAddModal,
  licenseState,
  onOpenLoginModal,
  syncStatus,
  lastSyncedAt,
  onSyncNow,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = location.pathname.replace('/', '') || 'board';
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
    <header className="ledger-glass sticky top-0 z-20 border-b border-black/5 shadow-2xs">
      {/* Top Banner Bar */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Privacy Badge — wordmark links back to the marketing homepage */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 min-w-0 cursor-pointer text-left"
            title="Back to homepage"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-md bg-ink text-paper flex items-center justify-center shadow-sm shrink-0 relative font-display font-semibold text-lg">
              JT
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-ledger border-2 border-paper" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-ink tracking-tight truncate">
                  JobTrack <span className="text-ledger">Ledger</span>
                </h1>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (licenseState?.isAuthenticated && !licenseState?.isGuest) {
                      navigate('/profile');
                    } else {
                      onOpenLoginModal();
                    }
                  }}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-ledger-mono font-semibold shrink-0 cursor-pointer transition-colors uppercase tracking-wide ${
                    licenseState?.isAuthenticated && !licenseState?.isGuest
                      ? 'bg-brass-soft hover:opacity-80 text-ink border border-brass'
                      : 'bg-slate-soft hover:opacity-80 text-ink-soft border border-slate'
                  }`}
                  title={licenseState?.isAuthenticated && !licenseState?.isGuest ? 'View your profile' : 'Sign in / activate license'}
                >
                  <ShieldCheck className={`w-3 h-3 mr-1 ${licenseState?.isAuthenticated && !licenseState?.isGuest ? 'text-brass' : 'text-slate'}`} />
                  <span>{licenseState?.isAuthenticated && !licenseState?.isGuest ? 'Licensed' : 'Demo'}</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-ink-soft/80 truncate hidden sm:block font-normal">
                Your private job search record — nothing leaves this browser
              </p>
            </div>
          </button>

          {/* Quick Stats Summary Pills */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center px-3 py-1.5 rounded-full bg-paper-dim border border-ink/8 shrink-0">
              <Send className="w-3.5 h-3.5 text-ledger mr-1.5" />
              <span className="text-ink-soft/80 mr-1 hidden sm:inline font-medium">Applications:</span>
              <span className="font-semibold text-ink">{totalApplied}</span>
            </div>

            <div className="flex items-center px-3 py-1.5 rounded-full bg-plum/10 border border-plum/20 shrink-0">
              <Clock className="w-3.5 h-3.5 text-plum mr-1.5" />
              <span className="text-ink-soft/80 mr-1 hidden sm:inline font-medium">Interviewing:</span>
              <span className="font-semibold text-plum">{interviewing}</span>
            </div>

            <div className="flex items-center px-3 py-1.5 rounded-full bg-brass/10 border border-brass/20 shrink-0">
              <Award className="w-3.5 h-3.5 text-brass mr-1.5" />
              <span className="text-ink-soft/80 mr-1 hidden sm:inline font-medium">Offers:</span>
              <span className="font-semibold text-brass">{offers}</span>
            </div>

            {overdueCount > 0 && (
              <div className="flex items-center px-3 py-1.5 rounded-full bg-brass/10 border border-brass/20 text-brass font-semibold animate-pulse shrink-0">
                <span>{overdueCount} Due</span>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-full text-white bg-ledger hover:opacity-90 glow-ledger transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>New Job</span>
            </button>

            <button
              onClick={onSyncNow}
              title={
                syncStatus === 'syncing' ? 'Syncing to Drive...' :
                lastSyncedAt ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()} — click to sync now` :
                'Sync to Google Drive'
              }
              className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer shrink-0 ${
                syncStatus === 'error'
                  ? 'bg-stamp-soft text-stamp border-stamp/40'
                  : 'bg-paper-dim text-ink-soft border-ink/8 hover:bg-ink/5'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : syncStatus === 'error' ? (
                <CloudOff className="w-4 h-4" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              {syncStatus === 'synced' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-ledger border-2 border-paper" />
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              title="Profile"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer shrink-0 ${
                activeView === 'profile'
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-dim text-ink-soft border-ink/8 hover:bg-ink/5'
              }`}
            >
              <User className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Filter & View Switcher Sub-bar */}
        <div className="mt-2.5 pt-2.5 border-t border-ink/8 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* View Mode Buttons (Ledger Segmented Control) */}
          <div className="flex items-center bg-paper-dim p-1 rounded-xl border border-ink/8 self-start md:self-auto shrink-0 shadow-inner overflow-x-auto scrollbar-hide max-w-full">
            <button
              onClick={() => navigate('/board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'board'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => navigate('/table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'table'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'analytics'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => navigate('/compare')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'compare'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>

            <button
              onClick={() => navigate('/connect')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'connect'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>

            <button
              onClick={() => navigate('/toolkit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'toolkit'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Toolkit</span>
            </button>

            <button
              onClick={() => navigate('/export')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'export'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Search Bar & Tag Filter Controls */}
          <div className="flex items-center space-x-2 flex-1 max-w-full md:max-w-md w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
              <input
                type="text"
                placeholder="Search company, position, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white/70 hover:bg-white focus:bg-white border border-ink/12 focus:border-ledger rounded-full text-xs text-ink placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-ledger/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink-soft p-0.5 cursor-pointer"
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
                  className="pl-7 pr-6 py-1.5 bg-white/70 border border-ink/12 rounded-full text-xs text-ink-soft font-medium focus:outline-hidden focus:border-ledger appearance-none cursor-pointer hover:bg-white transition-all"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft/60 pointer-events-none" />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
