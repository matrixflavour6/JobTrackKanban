import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  loadApplications, 
  saveApplications,
  getLicenseState,
  isStoragePersistent,
  LicenseState
} from './utils/storage';
import { JobApplication, StageId, INITIAL_SAMPLE_JOBS, ViewMode } from './types';
import { parseClipboardImport, ParsedJobInfo } from './utils/portalParser';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { OfferComparisonView } from './components/OfferComparisonView';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { AppFooter } from './components/AppFooter';
import { LockedGate } from './components/LockedGate';
import { JobModal } from './components/JobModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ToolkitModal } from './components/ToolkitModal';
import { PortalSyncModal } from './components/PortalSyncModal';
import { CommandPalette } from './components/CommandPalette';
import { backupToDrive, isSignedIn as isGoogleDriveSignedIn } from './utils/googleDrive';
import { LoginModal } from './components/LoginModal';
import { CheckCircle, AlertCircle, Info, Sparkles, Key } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // License State & Modal
  const [licenseState, setLicenseState] = useState<LicenseState>(() => getLicenseState());
  const [storageWarning, setStorageWarning] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Background Drive Sync
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoadRef = React.useRef(true);

  // Modal States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultStageForModal, setDefaultStageForModal] = useState<StageId>('applied');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  
  const [clippedJob, setClippedJob] = useState<ParsedJobInfo | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load initial data from localStorage + IndexedDB
  useEffect(() => {
    const loaded = loadApplications();
    setApplications(loaded);

    if (!isStoragePersistent()) {
      setStorageWarning(true);
    }
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect a job clipped via the browser bookmarklet (?clip=<payload>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clip = params.get('clip');
    if (clip) {
      const parsed = parseClipboardImport(clip);
      if (parsed) {
        setClippedJob(parsed);
        navigate('/connect');
      }
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
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
    const newApps = applications.filter(app => app.id !== id);
    updateApplications(newApps);
    showToast('Application deleted', 'info');
  };

  const handleMoveStage = (id: string, newStage: StageId) => {
    const newApps = applications.map(app => {
      if (app.id === id) {
        return {
          ...app,
          stage: newStage,
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    });
    updateApplications(newApps);
  };

  const handleSaveJob = (job: JobApplication) => {
    const exists = applications.some(a => a.id === job.id);
    let newApps: JobApplication[];

    if (exists) {
      newApps = applications.map(a => a.id === job.id ? job : a);
      showToast(`Updated ${job.company}`);
    } else {
      newApps = [job, ...applications];
      showToast(`Added ${job.company}`);
    }

    updateApplications(newApps);
    setIsJobModalOpen(false);
  };

  const handleUpdateJob = (id: string, patch: Partial<JobApplication>) => {
    const newApps = applications.map(a => {
      if (a.id === id) {
        return { ...a, ...patch, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    updateApplications(newApps);
  };

  const handleImportData = (data: JobApplication[], mode: 'merge' | 'replace') => {
    let newApps: JobApplication[];
    if (mode === 'replace') {
      newApps = data;
    } else {
      const existingIds = new Set(applications.map(a => a.id));
      const filteredIncoming = data.filter(a => !existingIds.has(a.id));
      newApps = [...applications, ...filteredIncoming];
    }
    updateApplications(newApps);
    showToast(`Successfully imported ${data.length} applications (${mode} mode)`);
  };

  const handleResetSampleData = () => {
    updateApplications(INITIAL_SAMPLE_JOBS);
    showToast('Reset board to sample applications', 'info');
  };

  const handleClearAllData = () => {
    updateApplications([]);
    showToast('Cleared all applications', 'info');
  };

  // Google Drive Manual and Background Auto-Sync
  const performDriveBackup = async (showExplicitToast: boolean = false) => {
    if (!isGoogleDriveSignedIn()) {
      if (showExplicitToast) {
        showToast('Google Drive is not connected yet. Connect in Settings or Import/Export.', 'info');
      }
      return;
    }

    setSyncStatus('syncing');
    try {
      const json = JSON.stringify(applications, null, 2);
      await backupToDrive(json);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
      if (showExplicitToast) {
        showToast('Backed up to your Google Drive just now', 'success');
      }
    } catch (err: any) {
      setSyncStatus('error');
      if (showExplicitToast) {
        showToast(err.message || 'Drive backup failed', 'error');
      }
    }
  };

  // Debounced auto-sync whenever applications change
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }
    if (!isGoogleDriveSignedIn()) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      performDriveBackup(false);
    }, 2500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [applications]);

  const handleSetViewMode = (mode: ViewMode) => {
    if (mode === 'kanban') navigate('/board');
    else if (mode === 'table') navigate('/table');
    else if (mode === 'calendar') navigate('/calendar');
    else if (mode === 'offers') navigate('/compare');
    else if (mode === 'analytics') navigate('/analytics');
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-ledger selection:text-white">
      
      {/* Top Storage Advisory Banner if browser rejects persistence */}
      {storageWarning && (
        <div className="bg-stamp text-white px-4 py-2 text-xs font-semibold flex items-center justify-between z-30">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Private browsing / cookie restrictions detected. Changes might not persist across restarts. Consider exporting a backup regularly.
            </span>
          </div>
          <button
            onClick={() => setStorageWarning(false)}
            className="text-white/80 hover:text-white ml-3 text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <LoginPage
            licenseState={licenseState}
            onLoginSuccess={(newLicense) => {
              setLicenseState(newLicense);
              showToast(`License Activated: Welcome ${newLicense.userName}!`, 'success');
            }}
            onEnterDemoMode={() => {
              showToast('Entered Guest Preview', 'info');
            }}
          />
        } />

        {/* Core App Shell */}
        <Route
          path="/*"
          element={
            <>
              <Header
                applications={applications}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                allTags={allTags}
                onOpenAddModal={() => handleAddJobForStage('applied')}
                licenseState={licenseState}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                syncStatus={syncStatus}
                lastSyncedAt={lastSyncedAt}
                onSyncNow={() => performDriveBackup(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onOpenToolkit={() => setIsToolkitOpen(true)}
              />

              <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/board" element={
                    <KanbanBoard
                      applications={filteredApplications}
                      onEditJob={handleEditJob}
                      onDeleteJob={handleDeleteJob}
                      onMoveStage={handleMoveStage}
                      onAddJob={handleAddJobForStage}
                    />
                  } />

                  <Route path="/table" element={
                    <TableView
                      applications={filteredApplications}
                      onEditJob={handleEditJob}
                      onDeleteJob={handleDeleteJob}
                      onMoveStage={handleMoveStage}
                      onAddJob={() => handleAddJobForStage('applied')}
                    />
                  } />

                  <Route path="/calendar" element={
                    <CalendarView
                      applications={filteredApplications}
                      onSelectJob={handleEditJob}
                    />
                  } />

                  <Route path="/analytics" element={
                    <AnalyticsView
                      applications={applications}
                      onEditJob={handleEditJob}
                      isLicensed={licenseState.isAuthenticated && !licenseState.isGuest}
                    />
                  } />

                  <Route path="/compare" element={
                    <LockedGate
                      unlocked={licenseState.isAuthenticated && !licenseState.isGuest}
                      title="Offer Comparison is a Pro feature"
                      description="Weighted multi-criteria decision matrix across compensation, commute, culture, and growth."
                    >
                      <OfferComparisonView
                        applications={applications}
                        onUpdateJob={handleUpdateJob}
                      />
                    </LockedGate>
                  } />

                  <Route path="/profile" element={
                    <ProfilePage
                      applications={applications}
                      licenseState={licenseState}
                      onLicenseChange={setLicenseState}
                      onNavigateLogin={() => setIsLoginModalOpen(true)}
                    />
                  } />

                  <Route path="/connect" element={
                    <PortalSyncModal
                      onClose={() => {
                        setClippedJob(null);
                        navigate('/board');
                      }}
                      initialClippedJob={clippedJob}
                      isLicensed={licenseState.isAuthenticated && !licenseState.isGuest}
                      onAddJob={(newJob) => {
                        const fullJob: JobApplication = {
                          ...newJob,
                          id: `portal-${Date.now()}`,
                          updatedAt: new Date().toISOString()
                        };
                        handleSaveJob(fullJob);
                      }}
                    />
                  } />

                  <Route path="*" element={<Navigate to="/board" replace />} />
                </Routes>
              </main>

              <AppFooter />
            </>
          }
        />
      </Routes>

      {/* Command Palette (Spotlight Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        applications={applications}
        onSelectJob={handleEditJob}
        onNewJob={() => handleAddJobForStage('applied')}
        onSetView={handleSetViewMode}
        onOpenToolkit={() => setIsToolkitOpen(true)}
        onOpenPortalSync={() => navigate('/connect')}
        onTriggerDriveSync={() => performDriveBackup(true)}
      />

      {/* Career Toolkit Modal */}
      {isToolkitOpen && (
        <ToolkitModal
          onClose={() => setIsToolkitOpen(false)}
          isLicensed={licenseState.isAuthenticated && !licenseState.isGuest}
        />
      )}

      {/* Modals */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        initialJob={editingJob}
        defaultStage={defaultStageForModal}
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
          showToast('Entered Guest Preview', 'info');
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-paper px-4 py-3 rounded-2xl shadow-2xl border border-ink/80 text-xs font-semibold flex items-center space-x-2.5 max-w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-brass shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-stamp shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-ledger shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
