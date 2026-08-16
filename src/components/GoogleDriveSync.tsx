import React, { useState } from 'react';
import { Cloud, CloudUpload, CloudDownload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { JobApplication } from '../types';
import { signIn, signOut, isSignedIn, backupToDrive, restoreFromDrive } from '../utils/googleDrive';

interface GoogleDriveSyncProps {
  applications: JobApplication[];
  onRestoreData: (data: JobApplication[]) => void;
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ applications, onRestoreData }) => {
  const [status, setStatus] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [signedIn, setSignedIn] = useState(isSignedIn());

  const handleConnect = async () => {
    setStatus('working');
    setMessage('Connecting to Google...');
    try {
      await signIn();
      setSignedIn(true);
      setStatus('idle');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not connect to Google Drive.');
    }
  };

  const handleBackup = async () => {
    setStatus('working');
    setMessage('Backing up to Drive...');
    try {
      if (!signedIn) await signIn();
      setSignedIn(true);
      const json = JSON.stringify(applications, null, 2);
      await backupToDrive(json);
      setStatus('success');
      setMessage('Backed up just now.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Backup failed.');
    }
  };

  const handleRestore = async () => {
    setStatus('working');
    setMessage('Fetching your backup...');
    try {
      if (!signedIn) await signIn();
      setSignedIn(true);
      const json = await restoreFromDrive();
      if (!json) {
        setStatus('error');
        setMessage('No backup found in Drive yet — back up from another device first.');
        return;
      }
      const parsed = JSON.parse(json) as JobApplication[];
      onRestoreData(parsed);
      setStatus('success');
      setMessage(`Restored ${parsed.length} applications.`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Restore failed.');
    }
  };

  const handleDisconnect = () => {
    signOut();
    setSignedIn(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="ledger-card rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-semibold text-ink text-sm flex items-center">
          <Cloud className="w-4 h-4 mr-2 text-ledger" />
          Google Drive Sync
        </h4>
        {signedIn && (
          <button onClick={handleDisconnect} className="text-[11px] text-ink-soft hover:text-ink cursor-pointer">
            Disconnect
          </button>
        )}
      </div>
      <p className="text-[11px] text-ink-soft/80 mb-3">
        Optional. Saves one JSON file into a private, hidden app folder in your own Drive — not a shared or visible
        file — so you can restore your board on another device. Nothing is sent anywhere else.
      </p>

      <div className="flex flex-wrap gap-2">
        {!signedIn ? (
          <button
            onClick={handleConnect}
            disabled={status === 'working'}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded bg-ink text-paper hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {status === 'working' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5 mr-1.5" />}
            Connect Google Account
          </button>
        ) : (
          <>
            <button
              onClick={handleBackup}
              disabled={status === 'working'}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded bg-ledger text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
              Back Up Now
            </button>
            <button
              onClick={handleRestore}
              disabled={status === 'working'}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded bg-paper-dim text-ink border border-ink/10 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <CloudDownload className="w-3.5 h-3.5 mr-1.5" />
              Restore on This Device
            </button>
          </>
        )}
      </div>

      {message && (
        <div className={`mt-2.5 flex items-center text-[11px] font-medium ${
          status === 'error' ? 'text-stamp' : status === 'success' ? 'text-ledger' : 'text-ink-soft'
        }`}>
          {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
          {status === 'error' && <AlertCircle className="w-3.5 h-3.5 mr-1.5" />}
          {message}
        </div>
      )}
    </div>
  );
};
