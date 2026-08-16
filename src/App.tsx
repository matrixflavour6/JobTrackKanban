import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  loadApplications, 
  saveApplications,
  getLicenseState,
  isStoragePersistent,
  LicenseState
} from './utils/storage';
import { JobApplication, StageId, INITIAL_SAMPLE_JOBS } from './types';
import { parseClipboardImport, ParsedJobInfo } from './utils/portalParser';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { AnalyticsView } from './components/AnalyticsView';
import { OfferComparisonView } from './components/OfferComparisonView';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { AppleFooter } from './components/AppleFooter';
import { LockedGate } from './components/LockedGate';
import { JobModal } from './components/JobModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ToolkitModal } from './components/ToolkitModal';
import { PortalSyncModal } from './components/PortalSyncModal';
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

  // Background Drive Sync — debounced auto-sync on change, plus a manual trigger.
  // Silent by design: only the small status dot on the Sync button changes
  // during auto-sync. A toast only appears when the person manually clicks it.
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoadRef = React.useRef(true);

  // Modal States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultStageForModal, setDefaultStageForModal] = useState<StageId>('applied');
  
  const [clippedJob, setClippedJob] = useState<ParsedJobInfo | null>(null);

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

    // Check once, on load, whether this browser will actually retain data.
    // If it won't (some private-browsing / strict-cookie-blocking modes
    // disable Web Storage entirely), tell the person plainly instead of
    // letting them lose their license or board silently.
    if (!isStoragePersistent()) {
      setStorageWarning(true);
    }
  }, []);

  // Detect a job clipped via the browser bookmarklet (?clip=<payload>).
  // The bookmarklet opens `${origin}${pathname}?clip=...` — a real query
  // string with no hash — so this reads native window.location.search,
  // not the router's location.search (which reflects the hash's own query,
  // not the browser's actual one, and would be empty here under HashRouter).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clip = params.get('clip');
    if (clip) {
      const parsed = parseClipboardImport(clip);
      if (parsed) {
        setClippedJob(parsed);
        navigate('/connect');
      }
      // Strip the query param but keep the hash route intact
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

  const handleUpdateJob = (id: string, patch: Partial<JobApplication>) => {
    const updated = applications.map(app =>
      app.id === id ? { ...app, ...patch, updatedAt: new Date().toISOString() } : app
    );
    updateApplications(updated);
  };

  // Runs a Drive backup. `silent` (background auto-sync) never shows a toast
  // and swallows errors quietly aside from the status dot; a manual click
  // (`silent = false`) always shows a result, success or failure.
  const runSync = async (silent: boolean) => {
    const isLicensed = licenseState.isAuthenticated && !licenseState.isGuest;
    if (!isLicensed) {
      if (!silent) showToast('Activate your license to enable Drive sync.', 'error');
      return;
    }
    if (!isGoogleDriveSignedIn()) {
      if (!silent) showToast('Connect your Google account first — go to Profile.', 'error');
      return;
    }

    setSyncStatus('syncing');
    try {
      await backupToDrive(JSON.stringify(applications, null, 2));
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
      if (!silent) showToast('Synced to Google Drive.', 'success');
    } catch (err: any) {
      setSyncStatus('error');
      if (!silent) showToast(err?.message || 'Sync to Drive failed.', 'error');
    }
  };

  // Debounced background auto-sync: fires ~5s after the last change to
  // applications, not on every keystroke, and never on the initial load.
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }
    const isLicensed = licenseState.isAuthenticated && !licenseState.isGuest;
    if (!isLicensed || !isGoogleDriveSignedIn()) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      runSync(true);
    }, 5000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications]);

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
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-ledger selection:text-white">

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <LoginPage
              licenseState={licenseState}
              onLoginSuccess={(newLicense) => {
                setLicenseState(newLicense);
                showToast(`License Activated: Welcome ${newLicense.userName}!`, 'success');
              }}
              onEnterDemoMode={() => {
                showToast('Entered Demo Suite (Limited Read-Only Preview)', 'info');
              }}
            />
          }
        />

        <Route
          path="/*"
          element={
            <>
              {/* Top Main Navigation Header */}
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
                onSyncNow={() => runSync(false)}
              />

              {/* Storage Persistence Warning — shown only if the browser genuinely won't retain data */}
              {storageWarning && (
                <div className="bg-stamp-soft border-b border-stamp/30 px-4 py-2.5 text-xs text-stamp flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    This browser isn't retaining local data (private browsing or strict cookie-blocking is likely on) —
                    your license and board won't persist between sessions here. Export your data regularly, or switch to a normal browser window.
                  </span>
                </div>
              )}

              {/* Demo Suite License Banner */}
              {(!licenseState.isAuthenticated || licenseState.isGuest) && (
                <div className="bg-gradient-to-r from-brass/10 via-plum/10 to-brass/10 border-b border-brass/20 px-4 py-2.5 text-xs text-brass flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-2xs">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="px-2 py-0.5 rounded bg-brass/20 text-brass font-bold shrink-0 text-[10px] uppercase tracking-wider">
                      Demo Suite
                    </div>
                    <span className="font-medium text-ink">
                      Full board, table &amp; export are free. Activate your <strong>Gumroad License Key</strong> to unlock Offer Compare, ATS Match, Advanced Analytics &amp; Google Sync.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-3 py-1 bg-brass hover:opacity-90 text-white font-semibold text-[11px] rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center space-x-1"
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
                  <div className="mb-4 ledger-card rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-ink-soft">Active Filters:</span>
                      {searchQuery && (
                        <span className="bg-paper-dim px-2 py-0.5 rounded text-ink">
                          Search: "{searchQuery}"
                        </span>
                      )}
                      {selectedTag && (
                        <span className="bg-ledger-soft text-ledger px-2 py-0.5 rounded border border-ledger">
                          Tag: #{selectedTag}
                        </span>
                      )}
                      <span className="text-ink-soft/60">
                        ({filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTag(null);
                      }}
                      className="text-ledger hover:opacity-80 font-medium cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

                {/* Routed View Content */}
                <Routes>
                  <Route path="/board" element={
                    <KanbanBoard
                      applications={filteredApplications}
                      onAddJobForStage={handleAddJobForStage}
                      onEditJob={handleEditJob}
                      onDeleteJob={handleDeleteJob}
                      onMoveStage={handleMoveStage}
                    />
                  } />

                  <Route path="/table" element={
                    <TableView
                      applications={filteredApplications}
                      onEditJob={handleEditJob}
                      onDeleteJob={handleDeleteJob}
                      onMoveStage={handleMoveStage}
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
                      title="Offer Comparison is a licensed feature"
                      description="Weighted scoring across compensation, commute, culture, and growth — activate your license to unlock it."
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

                  <Route path="/toolkit" element={
                    <ToolkitModal
                      onClose={() => navigate('/board')}
                      isLicensed={licenseState.isAuthenticated && !licenseState.isGuest}
                    />
                  } />

                  <Route path="/export" element={
                    <ExportImportModal
                      onClose={() => navigate('/board')}
                      applications={applications}
                      onImportData={handleImportData}
                      onResetSampleData={handleResetSampleData}
                      onClearAllData={handleClearAllData}
                      isLicensed={licenseState.isAuthenticated && !licenseState.isGuest}
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

              <AppleFooter />
            </>
          }
        />
      </Routes>

      {/* Modals (available across every routed page) */}
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
          showToast('Entered Demo Suite (Limited Read-Only Preview)', 'info');
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Floating Toast Message */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-paper px-4 py-3 rounded-xl shadow-xl border border-ink/80 text-xs font-semibold flex items-center space-x-2.5 max-w-[calc(100vw-2.5rem)]">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-brass shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-stamp shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-ledger shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
