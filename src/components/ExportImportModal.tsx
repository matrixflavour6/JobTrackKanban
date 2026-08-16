import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Calendar
} from 'lucide-react';
import { JobApplication } from '../types';
import { exportToJSON, exportToCSV, parseImportJSON } from '../utils/storage';
import { downloadBulkIcsFile } from '../utils/icsExport';
import { GoogleDriveSync } from './GoogleDriveSync';
import { LockedGate } from './LockedGate';

interface ExportImportModalProps {
  onClose: () => void;
  applications: JobApplication[];
  onImportData: (data: JobApplication[], mode: 'replace' | 'merge') => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  isLicensed: boolean;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  onClose,
  applications,
  onImportData,
  onResetSampleData,
  onClearAllData,
  isLicensed,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; data?: JobApplication[]; error?: string } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const followUpCount = applications.filter(a => a.followUpDate).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = parseImportJSON(text);
        setImportResult(res);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.success && importResult.data) {
      onImportData(importResult.data, importMode);
      setImportFile(null);
      setImportResult(null);
      onClose();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-paper rounded-md w-full shadow-sm overflow-hidden border border-black/10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-paper-dim/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-ledger-soft text-ledger rounded-2xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-semibold text-ink">
                Data Backup & Calendar Sync
              </h2>
              <p className="text-xs text-ink-soft/80">
                Export applications, sync calendar follow-ups, or restore backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-soft/60 hover:text-ink-soft hover:bg-paper-dim/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-ink-soft">
          
          {/* Section 1: Calendar Sync */}
          <div className="bg-ledger-soft/60 border border-ledger/80 p-4 rounded-2xl space-y-2.5">
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
              Export all {followUpCount} upcoming application follow-up dates into a single `.ics` calendar bundle file for Google Calendar, Apple Calendar, or Outlook.
            </p>
            <button
              onClick={() => downloadBulkIcsFile(applications)}
              disabled={followUpCount === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs ${
                followUpCount > 0 
                  ? 'bg-ledger hover:bg-ledger text-white' 
                  : 'bg-paper-dim text-ink-soft/60 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Download All Calendar Reminders (.ics)</span>
            </button>
          </div>

          {/* Section 1.5: Google Drive Sync */}
          <LockedGate
            unlocked={isLicensed}
            title="Google Drive Sync is a licensed feature"
            description="Back up your board to your own Drive and restore it on other devices — activate your license to unlock it."
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

          {/* Section 2: Export Data */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider mb-2 flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-ledger" />
              Export Board Backup ({applications.length} items)
            </h3>
            <p className="text-ink-soft/80 mb-3">
              Save a full local copy of all your job applications, interview records, and notes.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportToJSON(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl border border-ink/10 bg-paper-dim hover:bg-paper-dim hover:border-ink/20 font-semibold text-ink transition-all cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-plum" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => exportToCSV(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl border border-ink/10 bg-paper-dim hover:bg-paper-dim hover:border-ink/20 font-semibold text-ink transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-brass" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 3: Import Data */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider mb-2 flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-plum" />
              Restore Backup File
            </h3>
            <p className="text-ink-soft/80 mb-3">
              Upload a previously exported `.json` file to restore your board.
            </p>

            <div className="border-2 border-dashed border-ink/10 rounded-2xl p-4 text-center hover:border-plum transition-colors bg-slate-50/50">
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
                <FileJson className="w-7 h-7 text-plum mb-1" />
                <span className="font-semibold text-ink">
                  {importFile ? importFile.name : 'Click to select JSON backup file'}
                </span>
                <span className="text-[10px] text-ink-soft/60 mt-0.5">
                  Supports job-applications-backup-*.json files
                </span>
              </label>
            </div>

            {/* Validation Feedback */}
            {importResult && (
              <div className="mt-3">
                {importResult.success ? (
                  <div className="p-3 bg-brass-soft border border-brass rounded-xl text-emerald-900 space-y-2">
                    <div className="flex items-center font-semibold">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-brass" />
                      Valid JSON backup detected ({importResult.data?.length} applications)
                    </div>

                    <div className="flex items-center space-x-4 pt-1">
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
                      className="w-full mt-2 py-2 bg-brass hover:bg-brass text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      Confirm & Restore {importResult.data?.length} Applications
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-stamp-soft border border-stamp rounded-xl text-stamp flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-stamp shrink-0" />
                    <span>{importResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 4: Reset / Clear */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider mb-2">
              Board Controls
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  onResetSampleData();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-ink/10 bg-white hover:bg-paper-dim text-ink-soft font-semibold rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-ink-soft/80" />
                <span>Load Sample Data</span>
              </button>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-stamp bg-stamp-soft hover:bg-stamp-soft text-stamp font-semibold rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-stamp" />
                  <span>Clear All Applications</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center space-x-1">
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2 bg-stamp text-white font-bold rounded-xl hover:bg-stamp text-[11px] cursor-pointer"
                  >
                    Confirm Delete All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-2 border border-ink/10 text-ink-soft rounded-xl text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
