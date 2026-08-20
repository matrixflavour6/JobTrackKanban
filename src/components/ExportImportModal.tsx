import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Cloud,
  History,
  RotateCcw,
  Trash2,
  BookmarkPlus
} from 'lucide-react';
import { JobApplication, StorageSnapshot } from '../types';
import { exportToJSON, exportToCSV, parseImportJSON, getSnapshots, createSnapshot, restoreSnapshot, deleteSnapshot } from '../utils/storage';
import { downloadBulkIcsFile } from '../utils/icsExport';
import { GoogleDriveSync } from './GoogleDriveSync';
import { LockedGate } from './LockedGate';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  onImportData: (data: JobApplication[], mode: 'merge' | 'replace') => void;
  isLicensed: boolean;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  applications,
  onImportData,
  isLicensed,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; data?: JobApplication[]; error?: string } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [snapshots, setSnapshots] = useState<StorageSnapshot[]>([]);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(getSnapshots());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = parseImportJSON(content);
        setImportResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importResult?.success && importResult.data) {
      onImportData(importResult.data, importMode);
      onClose();
    }
  };

  const handleCreateManualSnapshot = () => {
    const snap = createSnapshot(applications, `Manual Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
    setSnapshots(getSnapshots());
    setSnapshotSuccess(`Created snapshot with ${snap.count} applications.`);
    setTimeout(() => setSnapshotSuccess(null), 3000);
  };

  const handleRestoreSnapshot = (id: string) => {
    const data = restoreSnapshot(id);
    if (data) {
      onImportData(data, 'replace');
      setSnapshotSuccess('Restored successfully from snapshot.');
      setTimeout(() => setSnapshotSuccess(null), 3000);
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = deleteSnapshot(id);
    setSnapshots(updated);
  };

  const followUpCount = applications.filter(a => !!a.followUpDate && a.stage !== 'rejected' && a.stage !== 'offer').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-paper rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-paper-dim/40">
          <div>
            <h2 className="text-base font-display font-bold text-ink">
              Data Sovereignty & Backups
            </h2>
            <p className="text-xs text-ink-soft">Export, restore, sync to Google Drive, and manage recovery snapshots.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Section 1: Rolling Recovery Snapshots */}
          <div className="p-4 rounded-xl bg-paper-dim/50 border border-ink/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-ledger" />
                <h3 className="font-bold text-ink text-xs uppercase tracking-wider">
                  Rolling Recovery Snapshots
                </h3>
              </div>
              <button
                onClick={handleCreateManualSnapshot}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-paper border border-ink/10 hover:bg-white text-ink transition-colors cursor-pointer flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-ledger" />
                Save Snapshot
              </button>
            </div>
            <p className="text-ink-soft text-[11px]">
              Automatic rolling snapshots protect your data against accidental browser cache clearing or unexpected deletions.
            </p>

            {snapshotSuccess && (
              <div className="p-2 rounded-lg bg-ledger-soft text-ledger font-semibold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {snapshotSuccess}
              </div>
            )}

            {snapshots.length === 0 ? (
              <p className="text-[11px] text-ink-soft/70 italic">No previous snapshots recorded yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-ink/8 text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-ink">{snap.label}</span>
                      <span className="text-ink-soft ml-2">({snap.count} jobs)</span>
                      <span className="text-ink-soft/60 ml-2">
                        {new Date(snap.timestamp).toLocaleDateString()} {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestoreSnapshot(snap.id)}
                        className="px-2 py-0.5 rounded bg-ledger-soft text-ledger hover:bg-ledger hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-1"
                        title="Restore this snapshot"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1 rounded text-ink-soft hover:text-stamp transition-colors cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Calendar (.ics) Export */}
          <div className="p-4 rounded-xl bg-paper-dim/50 border border-ink/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-ledger" />
                <h3 className="font-bold text-ink text-xs uppercase tracking-wider">
                  Bulk Calendar Reminders (.ics)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ledger-soft text-ledger">
                {followUpCount} Events
              </span>
            </div>
            <p className="text-ink-soft text-[11px]">
              Export all {followUpCount} upcoming application follow-up dates into a universal `.ics` calendar file compatible with Google Calendar, Outlook, and system calendar apps.
            </p>
            <button
              onClick={() => downloadBulkIcsFile(applications)}
              disabled={followUpCount === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                followUpCount > 0 
                  ? 'bg-ledger hover:opacity-90 text-white' 
                  : 'bg-paper-dim text-ink-soft/60 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Download All Calendar Reminders (.ics)</span>
            </button>
          </div>

          {/* Section 3: Google Drive Sync */}
          <LockedGate
            unlocked={isLicensed}
            title="Google Drive Sync is a Pro feature"
            description="Back up your board to your private Google Drive and restore it across all your devices."
            compact
          >
            <GoogleDriveSync
              applications={applications}
              onRestoreData={(data) => {
                onImportData(data, 'replace');
                onClose();
              }}
            />
          </LockedGate>

          {/* Section 4: Export Data */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider mb-2 flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-ledger" />
              Export Board Backup ({applications.length} items)
            </h3>
            <p className="text-ink-soft mb-3">
              Save a local snapshot copy of all your applications, interview records, and offer scores.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportToJSON(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-ink/10 bg-paper-dim hover:bg-white font-semibold text-ink transition-all cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-plum" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => exportToCSV(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-ink/10 bg-paper-dim hover:bg-white font-semibold text-ink transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-brass" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="border-t border-ink/10" />

          {/* Section 5: Import Data */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider mb-2 flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-plum" />
              Restore Backup File
            </h3>
            <p className="text-ink-soft mb-3">
              Upload a previously exported `.json` file to restore your board.
            </p>

            <div className="border-2 border-dashed border-ink/10 rounded-xl p-4 text-center hover:border-plum transition-colors bg-paper-dim/30">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="json-import-input"
              />
              <label
                htmlFor="json-import-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <FileJson className="w-6 h-6 text-plum mb-1" />
                <span className="font-semibold text-ink">
                  {importFile ? importFile.name : 'Click to select JSON backup file'}
                </span>
                <span className="text-[10px] text-ink-soft mt-0.5">
                  Supports job-applications-backup-*.json files
                </span>
              </label>
            </div>

            {/* Validation Feedback */}
            {importResult && (
              <div className="mt-3">
                {importResult.success ? (
                  <div className="p-3 bg-brass-soft border border-brass/30 rounded-xl text-ink space-y-2">
                    <div className="flex items-center font-semibold text-brass">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Valid JSON backup detected ({importResult.data?.length} applications)
                    </div>

                    <div className="flex items-center space-x-4 pt-1 text-xs">
                      <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-plum"
                        />
                        <span>Merge with current board</span>
                      </label>

                      <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-plum"
                        />
                        <span>Replace existing board</span>
                      </label>
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      className="w-full mt-2 py-2 bg-ledger text-white font-semibold rounded-lg shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Confirm & Restore {importResult.data?.length} Applications
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-stamp-soft border border-stamp/30 rounded-xl text-stamp flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                    <span>{importResult.error || 'Failed to read backup file.'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
