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

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  onImportData: (data: JobApplication[], mode: 'replace' | 'merge') => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  applications,
  onImportData,
  onResetSampleData,
  onClearAllData,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; data?: JobApplication[]; error?: string } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-black/10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Data Backup & Calendar Sync
              </h2>
              <p className="text-xs text-slate-500">
                Export applications, sync calendar follow-ups, or restore backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-700">
          
          {/* Section 1: Calendar Sync */}
          <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Bulk Calendar Reminders (.ics)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {followUpCount} Events
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Export all {followUpCount} upcoming application follow-up dates into a single `.ics` calendar bundle file for Google Calendar, Apple Calendar, or Outlook.
            </p>
            <button
              onClick={() => downloadBulkIcsFile(applications)}
              disabled={followUpCount === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs ${
                followUpCount > 0 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Download All Calendar Reminders (.ics)</span>
            </button>
          </div>

          {/* Section 2: Export Data */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-blue-600" />
              Export Board Backup ({applications.length} items)
            </h3>
            <p className="text-slate-500 mb-3">
              Save a full local copy of all your job applications, interview records, and notes.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportToJSON(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 font-semibold text-slate-800 transition-all cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-purple-600" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => exportToCSV(applications)}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 font-semibold text-slate-800 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 3: Import Data */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-purple-600" />
              Restore Backup File
            </h3>
            <p className="text-slate-500 mb-3">
              Upload a previously exported `.json` file to restore your board.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-purple-300 transition-colors bg-slate-50/50">
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
                <FileJson className="w-7 h-7 text-purple-500 mb-1" />
                <span className="font-semibold text-slate-800">
                  {importFile ? importFile.name : 'Click to select JSON backup file'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Supports job-applications-backup-*.json files
                </span>
              </label>
            </div>

            {/* Validation Feedback */}
            {importResult && (
              <div className="mt-3">
                {importResult.success ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
                    <div className="flex items-center font-semibold">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
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
                          className="text-purple-600"
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
                          className="text-purple-600"
                        />
                        <span>Replace existing board</span>
                      </label>
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      Confirm & Restore {importResult.data?.length} Applications
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
                    <span>{importResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Section 4: Reset / Clear */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
              Board Controls
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  onResetSampleData();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Load Sample Data</span>
              </button>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
                    className="flex-1 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 text-[11px] cursor-pointer"
                  >
                    Confirm Delete All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-2 border border-slate-200 text-slate-600 rounded-xl text-[11px] cursor-pointer"
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
