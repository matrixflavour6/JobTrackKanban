import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Kanban, Table, Calendar, BarChart2, Scale, Cloud, Sparkles, X, ArrowRight, Briefcase } from 'lucide-react';
import { JobApplication, ViewMode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onNewJob: () => void;
  onSetView: (view: ViewMode) => void;
  onOpenToolkit: () => void;
  onOpenPortalSync: () => void;
  onTriggerDriveSync: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  applications,
  onSelectJob,
  onNewJob,
  onSetView,
  onOpenToolkit,
  onOpenPortalSync,
  onTriggerDriveSync,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Actions list
  const systemActions = [
    { id: 'act-new-job', label: 'Create New Application', icon: Plus, category: 'Actions', run: onNewJob },
    { id: 'act-portal-sync', label: 'Import from Job Board URL / Text', icon: Briefcase, category: 'Actions', run: onOpenPortalSync },
    { id: 'act-toolkit', label: 'Open ATS Matcher & AI Toolkit', icon: Sparkles, category: 'Tools', run: onOpenToolkit },
    { id: 'act-drive-sync', label: 'Sync with Google Drive', icon: Cloud, category: 'Tools', run: onTriggerDriveSync },
    { id: 'view-kanban', label: 'Switch to Kanban Board', icon: Kanban, category: 'Navigation', run: () => onSetView('kanban') },
    { id: 'view-table', label: 'Switch to Table View', icon: Table, category: 'Navigation', run: () => onSetView('table') },
    { id: 'view-calendar', label: 'Switch to Timeline Calendar', icon: Calendar, category: 'Navigation', run: () => onSetView('calendar') },
    { id: 'view-offers', label: 'Switch to Offer Decision Matrix', icon: Scale, category: 'Navigation', run: () => onSetView('offers') },
    { id: 'view-analytics', label: 'Switch to Pipeline Analytics', icon: BarChart2, category: 'Navigation', run: () => onSetView('analytics') },
  ];

  // Filtered Applications
  const filteredJobs = applications.filter((job) => {
    const q = query.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      (job.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      (job.location || '').toLowerCase().includes(q)
    );
  });

  const filteredActions = systemActions.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase())
  );

  type ListItem =
    | { type: 'action'; item: (typeof systemActions)[0] }
    | { type: 'job'; item: JobApplication };

  const combinedItems: ListItem[] = [
    ...filteredActions.map((item) => ({ type: 'action' as const, item })),
    ...filteredJobs.slice(0, 8).map((item) => ({ type: 'job' as const, item })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = combinedItems[selectedIndex];
      if (current) {
        if (current.type === 'action') {
          current.item.run();
        } else {
          onSelectJob(current.item);
        }
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/30 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-paper/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-ink/10 overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-ink/10">
          <Search className="w-5 h-5 text-ink-soft mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search companies, roles, tags..."
            className="w-full bg-transparent border-none text-ink placeholder:text-ink-soft/60 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-ink/5">
          {combinedItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-soft">
              No matching commands or applications found for "{query}".
            </div>
          ) : (
            combinedItems.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              if (entry.type === 'action') {
                const ActionIcon = entry.item.icon;
                return (
                  <div
                    key={entry.item.id}
                    onClick={() => {
                      entry.item.run();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-ledger text-white' : 'text-ink hover:bg-ink/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <ActionIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-ledger'}`} />
                      <span className="font-medium">{entry.item.label}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-ink/5 text-ink-soft'
                    }`}>
                      {entry.item.category}
                    </span>
                  </div>
                );
              }

              // Application item
              const job = entry.item;
              return (
                <div
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-ledger text-white' : 'text-ink hover:bg-ink/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      job.stage === 'offer' ? 'bg-brass' :
                      job.stage === 'interview' ? 'bg-plum' :
                      job.stage === 'applied' ? 'bg-ledger' :
                      job.stage === 'rejected' ? 'bg-stamp' : 'bg-slate'
                    }`} />
                    <div className="truncate">
                      <span className="font-semibold">{job.company}</span>
                      <span className={`ml-2 text-[11px] ${isSelected ? 'text-white/80' : 'text-ink-soft'}`}>
                        {job.position}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 text-[11px]">
                    <span className={`capitalize ${isSelected ? 'text-white/90' : 'text-ink-soft'}`}>
                      {job.stage}
                    </span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-ink/10 bg-paper-dim/50 flex items-center justify-between text-[11px] text-ink-soft">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1 py-0.5 rounded bg-ink/10 font-mono text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-ink/10 font-mono text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-ink/10 font-mono text-[10px]">esc</kbd> Dismiss</span>
          </div>
          <span className="text-[10px] font-medium text-ledger">JobTrack Spotlight</span>
        </div>
      </div>
    </div>
  );
};
