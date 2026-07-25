import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadApplications, 
  saveApplications,
  getLicenseState,
  LicenseState
} from './utils/storage';
import { JobApplication, StageId, INITIAL_SAMPLE_JOBS } from './types';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { AnalyticsView } from './components/AnalyticsView';
import { JobModal } from './components/JobModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ToolkitModal } from './components/ToolkitModal';
import { PortalSyncModal } from './components/PortalSyncModal';
import { LoginModal } from './components/LoginModal';
import { CheckCircle, AlertCircle, Info, Sparkles, Key } from 'lucide-react';

export default function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'analytics'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // License State & Modal
  const [licenseState, setLicenseState] = useState<LicenseState>(() => getLicenseState());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modal States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultStageForModal, setDefaultStageForModal] = useState<StageId>('applied');
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isToolkitModalOpen, setIsToolkitModalOpen] = useState(false);
  const [isPortalSyncModalOpen, setIsPortalSyncModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load initial data from localStorage
  useEffect(() => {
    const loaded = loadApplications();
    setApplications(loaded);
  }, []);

  // Save changes to localStorage whenever applications update
  const updateApplications = (newApps: JobApplication[]) => {
    setApplications(newApps);
    saveApplications(newApps);
  };

  // Extract unique tags for filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      (a.tags || []).forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [applications]);

  // Filter applications by search query and tag
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        !searchQuery ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = 
        !selectedTag || 
        (app.tags && app.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [applications, searchQuery, selectedTag]);

  // Handlers for Application Actions
  const handleAddJobForStage = (stageId: StageId) => {
    setEditingJob(null);
    setDefaultStageForModal(stageId);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (id: string) => {
    const jobToDelete = applications.find(a => a.id === id);
    const updated = applications.filter(a => a.id !== id);
    updateApplications(updated);
    showToast(`Deleted ${jobToDelete?.company || 'application'} card`, 'info');
  };

  const handleMoveStage = (id: string, newStage: StageId) => {
    const updated = applications.map(app => {
      if (app.id === id) {
        return {
          ...app,
          stage: newStage,
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    });
    updateApplications(updated);
    showToast(`Moved to ${newStage.toUpperCase()}`, 'success');
  };

  const handleSaveJob = (savedJob: JobApplication) => {
    const exists = applications.some(a => a.id === savedJob.id);
    let updated: JobApplication[];

    if (exists) {
      updated = applications.map(a => a.id === savedJob.id ? savedJob : a);
      showToast(`Updated ${savedJob.company} application`, 'success');
    } else {
      updated = [savedJob, ...applications];
      showToast(`Added ${savedJob.company} to ${savedJob.stage.toUpperCase()}`, 'success');
    }

    updateApplications(updated);
  };

  // Backup Import & Board Controls
  const handleImportData = (importedApps: JobApplication[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      updateApplications(importedApps);
      showToast(`Replaced board with ${importedApps.length} imported applications`, 'success');
    } else {
      // Merge unique by ID
      const existingIds = new Set(applications.map(a => a.id));
      const newItems = importedApps.filter(a => !existingIds.has(a.id));
      const merged = [...applications, ...newItems];
      updateApplications(merged);
      showToast(`Merged ${newItems.length} new applications into board`, 'success');
    }
  };

  const handleResetSampleData = () => {
    updateApplications(INITIAL_SAMPLE_JOBS);
    showToast('Loaded sample job applications data', 'info');
  };

  const handleClearAllData = () => {
    updateApplications([]);
    showToast('Cleared all job applications', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Header
        applications={applications}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        allTags={allTags}
        onOpenAddModal={() => handleAddJobForStage('applied')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenToolkitModal={() => setIsToolkitModalOpen(true)}
        onOpenPortalSyncModal={() => setIsPortalSyncModalOpen(true)}
        licenseState={licenseState}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Demo Suite License Banner */}
      {(!licenseState.isAuthenticated || licenseState.isGuest) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-2">
            <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 font-bold shrink-0 text-[10px] uppercase tracking-wider">
              Demo Suite
            </div>
            <span className="font-medium text-slate-800">
              Interactive preview. Activate your <strong>Gumroad License Key</strong> to enable full commercial features & backup sync.
            </span>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center space-x-1"
          >
            <Key className="w-3 h-3" />
            <span>Activate Key</span>
          </button>
        </div>
      )}

      {/* Main Body View Content */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Active Search/Tag Filter Active Pill */}
        {(searchQuery || selectedTag) && (
          <div className="mb-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Active Filters:</span>
              {searchQuery && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedTag && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Tag: #{selectedTag}
                </span>
              )}
              <span className="text-slate-400">
                ({filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''})
              </span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Switcher Output */}
        {viewMode === 'kanban' && (
          <KanbanBoard
            applications={filteredApplications}
            onAddJobForStage={handleAddJobForStage}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onMoveStage={handleMoveStage}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            applications={filteredApplications}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onMoveStage={handleMoveStage}
          />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsView
            applications={applications}
            onEditJob={handleEditJob}
          />
        )}

      </main>

      {/* Footer Bar */}
      <footer className="border-t border-black/5 bg-white/60 backdrop-blur-md py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">JobTrack Kanban</span>
            <span>•</span>
            <span>Private Local Storage</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsToolkitModalOpen(true)}
              className="hover:text-slate-900 font-medium cursor-pointer transition-colors"
            >
              Job Search Toolkit
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 font-medium cursor-pointer transition-colors"
            >
              Export JSON / CSV
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        initialJob={editingJob}
        defaultStage={defaultStageForModal}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        applications={applications}
        onImportData={handleImportData}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
      />

      <ToolkitModal
        isOpen={isToolkitModalOpen}
        onClose={() => setIsToolkitModalOpen(false)}
      />

      <PortalSyncModal
        isOpen={isPortalSyncModalOpen}
        onClose={() => setIsPortalSyncModalOpen(false)}
        onAddJob={(newJob) => {
          const fullJob: JobApplication = {
            ...newJob,
            id: `portal-${Date.now()}`,
            updatedAt: new Date().toISOString()
          };
          handleSaveJob(fullJob);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={(newLicense) => {
          setLicenseState(newLicense);
          setIsLoginModalOpen(false);
          showToast(`License Activated: Welcome ${newLicense.userName}!`, 'success');
        }}
        onEnterDemoMode={() => {
          setIsLoginModalOpen(false);
          showToast('Entered Demo Suite (Limited Read-Only Preview)', 'info');
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center space-x-2.5 animate-bounce">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
