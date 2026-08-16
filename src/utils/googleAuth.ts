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

export const SCOPES = {
  drive: 'https://www.googleapis.com/auth/drive.file',
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
        accessToken = resp.access_token;
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
  cachedProfile = { email: profile.email, name: profile.name || profile.email, picture: profile.picture };
  return cachedProfile;
}

export function signOutGoogle(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  cachedProfile = null;
}

export function isGoogleSignedIn(): boolean {
  return !!accessToken;
}

export function getGoogleAccessToken(): string | null {
  return accessToken;
}

export function getGoogleProfile(): { email: string; name: string; picture?: string } | null {
  return cachedProfile;
}
