import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Kanban, 
  Table as TableIcon, 
  ShieldCheck, 
  Search, 
  Clock, 
  Send, 
  Award, 
  Globe, 
  Scale, 
  User, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Calendar as CalendarIcon,
  Sparkles,
  Command
} from 'lucide-react';
import { JobApplication } from '../types';
import { LicenseState } from '../utils/storage';

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
  onOpenCommandPalette?: () => void;
  onOpenToolkit?: () => void;
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
  onOpenCommandPalette,
  onOpenToolkit,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = location.pathname.replace('/', '') || 'board';

  // Key stats
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
    <header className="ledger-glass sticky top-0 z-20 border-b border-ink/8 shadow-2xs">
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Wordmark */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2.5 cursor-pointer text-left group"
              title="Back to overview"
            >
              <div className="h-9 w-9 rounded-xl bg-ink text-paper flex items-center justify-center shadow-sm shrink-0 font-display font-bold text-sm group-hover:scale-105 transition-transform">
                JT
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-display font-bold text-ink tracking-tight truncate">
                    JobTrack <span className="text-ledger">Pro</span>
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
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 cursor-pointer transition-colors uppercase tracking-wider ${
                      licenseState?.isAuthenticated && !licenseState?.isGuest
                        ? 'bg-brass-soft text-brass border border-brass/30'
                        : 'bg-slate-soft text-slate border border-slate/30'
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                    <span>{licenseState?.isAuthenticated && !licenseState?.isGuest ? 'Pro' : 'Guest'}</span>
                  </span>
                </div>
              </div>
            </button>

            {/* Quick Command Palette Button */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-paper-dim border border-ink/8 text-xs text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
                title="Search or run command (Cmd/Ctrl + K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-[11px]">Quick Find</span>
                <kbd className="px-1 py-0.2 rounded bg-ink/10 text-[10px] font-mono text-ink-soft flex items-center">
                  <Command className="w-2.5 h-2.5 mr-0.5" />K
                </kbd>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <div className="flex items-center px-2.5 py-1 rounded-full bg-paper-dim border border-ink/8 shrink-0">
              <Send className="w-3 h-3 text-ledger mr-1.5" />
              <span className="text-ink-soft mr-1 hidden sm:inline font-medium text-[11px]">Applications:</span>
              <span className="font-semibold text-ink text-[11px]">{totalApplied}</span>
            </div>

            <div className="flex items-center px-2.5 py-1 rounded-full bg-plum-soft border border-plum/20 shrink-0">
              <Clock className="w-3 h-3 text-plum mr-1.5" />
              <span className="text-ink-soft mr-1 hidden sm:inline font-medium text-[11px]">Interviewing:</span>
              <span className="font-semibold text-plum text-[11px]">{interviewing}</span>
            </div>

            <div className="flex items-center px-2.5 py-1 rounded-full bg-brass-soft border border-brass/20 shrink-0">
              <Award className="w-3 h-3 text-brass mr-1.5" />
              <span className="text-ink-soft mr-1 hidden sm:inline font-medium text-[11px]">Offers:</span>
              <span className="font-semibold text-brass text-[11px]">{offers}</span>
            </div>

            {overdueCount > 0 && (
              <div className="flex items-center px-2.5 py-1 rounded-full bg-stamp-soft border border-stamp/20 text-stamp font-semibold shrink-0 text-[11px] animate-pulse">
                <span>{overdueCount} Follow-ups Due</span>
              </div>
            )}
          </div>

          {/* Actions & Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenToolkit && (
              <button
                onClick={onOpenToolkit}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-paper-dim border border-ink/10 text-ink hover:bg-ink/5 transition-all cursor-pointer shrink-0"
                title="Open ATS Matcher & AI Tools"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-ledger" />
                <span>AI Tools</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-ledger hover:opacity-90 glow-ledger transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Application</span>
            </button>

            {/* Google Drive Status Button */}
            <button
              onClick={onSyncNow}
              title={
                syncStatus === 'syncing' ? 'Syncing to Google Drive...' :
                lastSyncedAt ? `Drive Synced at ${new Date(lastSyncedAt).toLocaleTimeString()} — click to sync now` :
                'Sync to Google Drive'
              }
              className={`relative inline-flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer shrink-0 ${
                syncStatus === 'error'
                  ? 'bg-stamp-soft text-stamp border-stamp/40'
                  : 'bg-paper-dim text-ink-soft border-ink/8 hover:bg-ink/5'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-ledger" />
              ) : syncStatus === 'error' ? (
                <CloudOff className="w-4 h-4 text-stamp" />
              ) : (
                <Cloud className="w-4 h-4 text-ink-soft" />
              )}
              {syncStatus === 'synced' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-ledger border border-paper" />
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              title="Account & Settings"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer shrink-0 ${
                activeView === 'profile'
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-dim text-ink-soft border-ink/8 hover:bg-ink/5'
              }`}
            >
              <User className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* View Switcher Sub-bar */}
        <div className="mt-2.5 pt-2 border-t border-ink/8 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Segmented View Control */}
          <div className="flex items-center bg-paper-dim p-1 rounded-xl border border-ink/8 self-start md:self-auto shrink-0 shadow-xs overflow-x-auto scrollbar-hide max-w-full">
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
              onClick={() => navigate('/calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'calendar'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Timeline</span>
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
              <span>Offer Matrix</span>
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
              onClick={() => navigate('/connect')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer shrink-0 ${
                activeView === 'connect'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-ink-soft hover:text-ink font-medium'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Portal Sync</span>
            </button>
          </div>

          {/* Quick Tag Filter & Search */}
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-xs">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ink text-paper hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                  >
                    Clear Filter
                  </button>
                )}
                {allTags.slice(0, 4).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      selectedTag === tag
                        ? 'bg-ledger text-white border-ledger'
                        : 'bg-paper-dim text-ink-soft border-ink/8 hover:text-ink'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 md:w-52">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter current view..."
                className="w-full text-xs pl-8 pr-3 py-1 rounded-xl bg-paper-dim border border-ink/8 text-ink placeholder:text-ink-soft/60 focus:bg-white focus:border-ledger transition-colors"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
