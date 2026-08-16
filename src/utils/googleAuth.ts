// Centralized Google Identity Services (GIS) auth.
//
// One shared consent flow covers everything the app needs from a Google
// account: Drive backup (drive.file), Gmail application-email scanning
// (gmail.readonly), and basic profile info (email/name) used to identify
// the signed-in person in the license flow.
//
// SCOPE NOTE — worth knowing before shipping this publicly:
//   drive.file only grants access to files this app creates, and generally
//   does NOT require Google's app-verification review.
//   gmail.readonly is a "sensitive" scope. Google requires OAuth consent
//   screen verification (and sometimes a CASA security assessment) before
//   it will work for the general public. Until verified, Google shows an
//   "unverified app" warning and restricts usage to up to 100 test users
//   you explicitly add in the Cloud Console's OAuth consent screen. Budget
//   time for that review before promising this to customers at large.
//
// SETUP — see googleDrive.ts for the Cloud Console steps. Use the SAME
// Client ID here as there; scopes below are requested together in one
// consent prompt.
//
// This value is safe to hardcode: OAuth Client IDs are meant to be public
// (every client-side Google Sign-In integration ships one in its JS bundle).
// The actual security boundary is the "Authorized JavaScript origins" list
// set in Google Cloud Console for this Client ID — only requests from an
// origin on that list are honored, regardless of who has the ID itself.

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '629142022944-pqo37cnta5aopu6rolrfj2q9v6uipqd3.apps.googleusercontent.com';

const STORAGE_KEY_TOKEN = 'jobtrack_gauth_token';
const STORAGE_KEY_EXPIRES = 'jobtrack_gauth_expires';
const STORAGE_KEY_PROFILE = 'jobtrack_gauth_profile';

export const SCOPES = {
  drive: 'https://www.googleapis.com/auth/drive.appdata',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
  profile: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
};

const ALL_SCOPES = `${SCOPES.drive} ${SCOPES.gmail} ${SCOPES.profile}`;

declare global {
  interface Window {
    google?: any;
  }
}

let tokenClient: any = null;
let accessToken: string | null = null;
let cachedProfile: { email: string; name: string; picture?: string } | null = null;

// Initialize from storage if still valid
(function initFromStorage() {
  try {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiresAt = parseInt(localStorage.getItem(STORAGE_KEY_EXPIRES) || '0', 10);
    const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);

    if (storedToken && expiresAt > Date.now()) {
      accessToken = storedToken;
      if (storedProfile) {
        cachedProfile = JSON.parse(storedProfile);
      }
    } else {
      clearStoredSession();
    }
  } catch {
    clearStoredSession();
  }
})();

function saveSession(token: string, expiresInSecs: number, profile?: { email: string; name: string; picture?: string }): void {
  accessToken = token;
  const expiresAt = Date.now() + (expiresInSecs || 3500) * 1000;
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt.toString());
  if (profile) {
    cachedProfile = profile;
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }
}

function clearStoredSession(): void {
  accessToken = null;
  cachedProfile = null;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_EXPIRES);
  localStorage.removeItem(STORAGE_KEY_PROFILE);
}

export function isGoogleConfigured(): boolean {
  return !GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID');
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Google Sign-In script.'));
    document.head.appendChild(script);
  });
}

/** Opens the Google consent screen for all app scopes at once. */
export async function signInWithGoogle(): Promise<{ email: string; name: string; picture?: string }> {
  if (!isGoogleConfigured()) {
    throw new Error(
      'Google Sign-In is not configured yet. Set VITE_GOOGLE_CLIENT_ID — see src/utils/googleAuth.ts for setup steps.'
    );
  }
  await loadGisScript();

  await new Promise<void>((resolve, reject) => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: ALL_SCOPES,
      callback: (resp: any) => {
        if (resp.error) return reject(new Error(resp.error));
        const expiresIn = resp.expires_in ? parseInt(resp.expires_in, 10) : 3600;
        saveSession(resp.access_token, expiresIn);
        resolve();
      },
    });
    tokenClient.requestAccessToken();
  });

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Signed in, but could not read your Google profile.');
  const profile = await res.json();
  const userProfile = { email: profile.email, name: profile.name || profile.email, picture: profile.picture };
  saveSession(accessToken!, 3600, userProfile);
  return userProfile;
}

export function signOutGoogle(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  clearStoredSession();
}

export function isGoogleSignedIn(): boolean {
  if (!accessToken) {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiresAt = parseInt(localStorage.getItem(STORAGE_KEY_EXPIRES) || '0', 10);
    if (storedToken && expiresAt > Date.now()) {
      accessToken = storedToken;
      return true;
    }
    return false;
  }
  return true;
}

export function getGoogleAccessToken(): string | null {
  if (isGoogleSignedIn()) {
    return accessToken;
  }
  return null;
}

export function getGoogleProfile(): { email: string; name: string; picture?: string } | null {
  if (isGoogleSignedIn()) {
    return cachedProfile;
  }
  return null;
}
