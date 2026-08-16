// Google Drive backup/sync — uses the shared Google auth session from
// googleAuth.ts (same sign-in as Gmail scanning and account login, one
// consent prompt covers all three).
//
// Scope used: drive.file — only grants access to files this app creates,
// never the user's whole Drive. We store the board as a single JSON file
// inside the user's Drive "appDataFolder", a hidden folder apps can write
// to that never shows up in the user's normal Drive file list.
//
// See src/utils/googleAuth.ts for one-time Google Cloud Console setup.

import { signInWithGoogle, getGoogleAccessToken, isGoogleSignedIn, signOutGoogle } from './googleAuth';

const BACKUP_FILENAME = 'jobtrack-ledger-backup.json';

export async function signIn(): Promise<void> {
  await signInWithGoogle();
}

export function signOut(): void {
  signOutGoogle();
}

export function isSignedIn(): boolean {
  return isGoogleSignedIn();
}

function authHeader(): Record<string, string> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google yet.');
  return { Authorization: `Bearer ${token}` };
}

async function handleDriveError(res: Response, defaultPrefix: string): Promise<never> {
  let detail = '';
  try {
    const errorData = await res.json();
    detail = errorData?.error?.message || '';
  } catch {}

  if (res.status === 401) {
    throw new Error('Google authentication session expired. Please disconnect and reconnect your Google account.');
  }
  if (res.status === 403) {
    throw new Error(
      `Google Drive access denied (403)${detail ? `: ${detail}` : ''}. ` +
      `Ensure "Google Drive API" is enabled in Google Cloud Console and your email is added under OAuth Test Users.`
    );
  }
  throw new Error(`${defaultPrefix} (${res.status})${detail ? `: ${detail}` : ''}`);
}

async function findBackupFileId(): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,modifiedTime)`,
    { headers: authHeader() }
  );
  if (!res.ok) await handleDriveError(res, 'Drive lookup failed');
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

/** Uploads the given JSON string as the backup file, creating or updating it. */
export async function backupToDrive(jsonData: string): Promise<{ savedAt: string }> {
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
    headers: { ...authHeader(), 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });

  if (!res.ok) await handleDriveError(res, 'Drive upload failed');
  return { savedAt: new Date().toISOString() };
}

/** Fetches the backup JSON string from Drive, or null if none exists yet. */
export async function restoreFromDrive(): Promise<string | null> {
  const fileId = await findBackupFileId();
  if (!fileId) return null;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: authHeader(),
  });
  if (!res.ok) await handleDriveError(res, 'Drive download failed');
  return res.text();
}
