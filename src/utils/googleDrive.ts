// Google Drive backup/sync module.
//
// Scope used: https://www.googleapis.com/auth/drive.file
// This scope ONLY grants access to files this app creates — never the user's
// whole Drive. That matters for two reasons: (1) it's the honest privacy
// story to tell users, and (2) apps requesting broader scopes usually need
// to go through Google's stricter OAuth verification/review process, while
// drive.file generally does not.
//
// We store the board as a single JSON file inside the user's Drive
// "appDataFolder" — a special hidden folder apps can write to that never
// shows up in the user's normal Drive file list, so it doesn't clutter
// their Drive.
//
// SETUP REQUIRED (one-time, in Google Cloud Console) before this works:
//   1. Create a project at https://console.cloud.google.com/
//   2. Enable the "Google Drive API" for that project
//   3. Configure the OAuth consent screen (External, add your app name/logo)
//   4. Create an OAuth 2.0 Client ID (type: "Web application")
//      - Add your site's URL (e.g. https://matrixflavour6.github.io) under
//        "Authorized JavaScript origins"
//   5. Paste that Client ID into GOOGLE_CLIENT_ID below (or wire it to an
//      env var — see vite.config.ts if you want VITE_GOOGLE_CLIENT_ID)
//
// Until a real client ID is set, sync calls will fail gracefully with a
// clear error rather than crashing the app.

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'jobtrack-ledger-backup.json';

declare global {
  interface Window {
    google?: any;
  }
}

let tokenClient: any = null;
let accessToken: string | null = null;

function isConfigured(): boolean {
  return !GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID');
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google Sign-In script.'));
    document.head.appendChild(script);
  });
}

export async function signIn(): Promise<void> {
  if (!isConfigured()) {
    throw new Error(
      'Google Drive sync is not configured yet. Set VITE_GOOGLE_CLIENT_ID (see src/utils/googleDrive.ts for setup steps).'
    );
  }
  await loadGisScript();

  return new Promise((resolve, reject) => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp: any) => {
        if (resp.error) return reject(new Error(resp.error));
        accessToken = resp.access_token;
        resolve();
      },
    });
    tokenClient.requestAccessToken();
  });
}

export function signOut(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
}

export function isSignedIn(): boolean {
  return !!accessToken;
}

async function findBackupFileId(): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Drive lookup failed (${res.status})`);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

/** Uploads the given JSON string as the backup file, creating or updating it. */
export async function backupToDrive(jsonData: string): Promise<{ savedAt: string }> {
  if (!accessToken) throw new Error('Not signed in to Google Drive yet.');

  const existingId = await findBackupFileId();
  const metadata = existingId
    ? { name: BACKUP_FILENAME }
    : { name: BACKUP_FILENAME, parents: ['appDataFolder'] };

  const boundary = 'jobtrack_ledger_boundary';
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${jsonData}\r\n` +
    `--${boundary}--`;

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const res = await fetch(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Drive upload failed (${res.status})`);
  return { savedAt: new Date().toISOString() };
}

/** Fetches the backup JSON string from Drive, or null if none exists yet. */
export async function restoreFromDrive(): Promise<string | null> {
  if (!accessToken) throw new Error('Not signed in to Google Drive yet.');

  const fileId = await findBackupFileId();
  if (!fileId) return null;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive download failed (${res.status})`);
  return res.text();
}
