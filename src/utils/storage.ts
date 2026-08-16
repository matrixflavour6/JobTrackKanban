import { JobApplication, INITIAL_SAMPLE_JOBS, StageId, StorageSnapshot, AISettings } from '../types';

const STORAGE_KEY = 'job_tracker_applications_v1';
const SNAPSHOTS_KEY = 'job_tracker_snapshots_v1';
const LICENSE_KEY_STORAGE = 'job_tracker_gumroad_license_v1';
const AI_SETTINGS_KEY = 'job_tracker_ai_settings_v1';

const DB_NAME = 'JobTrackLocalDB';
const DB_VERSION = 1;
const DB_STORE = 'app_state';

export interface LicenseState {
  isAuthenticated: boolean;
  licenseKey: string;
  userName: string;
  userEmail: string;
  activatedAt: string;
  isGuest: boolean;
  googleLinked: boolean;
}

// -------------------------------------------------------------
// Lightweight Native IndexedDB Engine (Dual-Layer Resilience)
// -------------------------------------------------------------
function openIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// -------------------------------------------------------------
// Application Data Persistence (Dual Layer + Auto Snapshot)
// -------------------------------------------------------------
let lastSnapshotTime = 0;

export function loadApplications(): JobApplication[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saveApplications(INITIAL_SAMPLE_JOBS);
      return INITIAL_SAMPLE_JOBS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Async mirror to IndexedDB for safety
      idbSet(STORAGE_KEY, parsed).catch(() => {});
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load job applications from localStorage:', err);
  }
  return INITIAL_SAMPLE_JOBS;
}

export function saveApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    // Asynchronously update IndexedDB backup
    idbSet(STORAGE_KEY, apps).catch(() => {});

    // Automatic rolling snapshot every 30 minutes
    const now = Date.now();
    if (now - lastSnapshotTime > 30 * 60 * 1000) {
      lastSnapshotTime = now;
      createSnapshot(apps, `Auto-backup (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
    }
  } catch (err) {
    console.error('Failed to save job applications to localStorage:', err);
    // If localStorage failed (e.g. quota exceeded), ensure IndexedDB saves it
    idbSet(STORAGE_KEY, apps).catch(() => {});
  }
}

// -------------------------------------------------------------
// Rolling Snapshots / Recovery Rollback
// -------------------------------------------------------------
export function getSnapshots(): StorageSnapshot[] {
  try {
    const saved = localStorage.getItem(SNAPSHOTS_KEY);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    }
  } catch {}
  return [];
}

export function createSnapshot(apps: JobApplication[], label: string = 'Manual Snapshot'): StorageSnapshot {
  const snapshots = getSnapshots();
  const newSnapshot: StorageSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    label,
    count: apps.length,
    data: apps,
  };

  // Keep up to 8 rolling snapshots
  const updated = [newSnapshot, ...snapshots.filter(s => s.id !== newSnapshot.id)].slice(0, 8);
  try {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    idbSet(SNAPSHOTS_KEY, updated).catch(() => {});
  } catch {}
  return newSnapshot;
}

export function restoreSnapshot(snapshotId: string): JobApplication[] | null {
  const snapshots = getSnapshots();
  const target = snapshots.find(s => s.id === snapshotId);
  if (target && Array.isArray(target.data)) {
    saveApplications(target.data);
    return target.data;
  }
  return null;
}

export function deleteSnapshot(snapshotId: string): StorageSnapshot[] {
  const snapshots = getSnapshots().filter(s => s.id !== snapshotId);
  try {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    idbSet(SNAPSHOTS_KEY, snapshots).catch(() => {});
  } catch {}
  return snapshots;
}

// -------------------------------------------------------------
// License & User Management
// -------------------------------------------------------------
export function getLicenseState(): LicenseState {
  try {
    const saved = localStorage.getItem(LICENSE_KEY_STORAGE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load license state:', err);
  }
  return {
    isAuthenticated: false,
    licenseKey: '',
    userName: '',
    userEmail: '',
    activatedAt: '',
    isGuest: false,
    googleLinked: false
  };
}

export function saveLicenseState(license: LicenseState): boolean {
  try {
    localStorage.setItem(LICENSE_KEY_STORAGE, JSON.stringify(license));
    const readBack = localStorage.getItem(LICENSE_KEY_STORAGE);
    return !!readBack && JSON.parse(readBack).isAuthenticated === license.isAuthenticated;
  } catch (err) {
    console.error('Failed to save license state:', err);
    return false;
  }
}

export function isStoragePersistent(): boolean {
  try {
    const testKey = '__jobtrack_storage_test__';
    localStorage.setItem(testKey, '1');
    const ok = localStorage.getItem(testKey) === '1';
    localStorage.removeItem(testKey);
    return ok;
  } catch {
    return false;
  }
}

export function clearLicenseState(): void {
  try {
    localStorage.removeItem(LICENSE_KEY_STORAGE);
  } catch (err) {
    console.error('Failed to clear license state:', err);
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(LICENSE_KEY_STORAGE);
  } catch (err) {
    console.error('Failed to logout user:', err);
  }
}

// -------------------------------------------------------------
// AI Settings Persistence (BYOK)
// -------------------------------------------------------------
export function getAISettings(): AISettings {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    apiKey: '',
    model: 'gemini-1.5-flash',
    enabled: false,
  };
}

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

// -------------------------------------------------------------
// Export & Import Helpers (JSON & CSV)
// -------------------------------------------------------------
export function exportToJSON(apps: JobApplication[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apps, null, 2));
  const downloadAnchor = document.createElement('a');
  const fileName = `job-applications-backup-${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCSV(apps: JobApplication[]): void {
  const headers = [
    'ID',
    'Company',
    'Position',
    'Stage',
    'Priority',
    'Date Applied',
    'Follow Up Date',
    'Salary',
    'Location',
    'Rating',
    'Job URL',
    'Contact Name',
    'Contact Email',
    'Tags',
    'Notes',
    'Updated At'
  ];

  const rows = apps.map(app => [
    app.id,
    `"${(app.company || '').replace(/"/g, '""')}"`,
    `"${(app.position || '').replace(/"/g, '""')}"`,
    app.stage,
    app.priority || 'medium',
    app.dateApplied,
    app.followUpDate,
    `"${(app.salary || '').replace(/"/g, '""')}"`,
    `"${(app.location || '').replace(/"/g, '""')}"`,
    app.rating,
    `"${(app.jobUrl || '').replace(/"/g, '""')}"`,
    `"${(app.contactName || '').replace(/"/g, '""')}"`,
    `"${(app.contactEmail || '').replace(/"/g, '""')}"`,
    `"${(app.tags || []).join('; ')}"`,
    `"${(app.notes || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
    app.updatedAt
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  const fileName = `job-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadAnchor.setAttribute("href", encodedUri);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportJSON(fileContent: string): { success: boolean; data?: JobApplication[]; error?: string } {
  try {
    const parsed = JSON.parse(fileContent);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Uploaded file must contain an array of job applications.' };
    }

    const validStages: StageId[] = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];
    const validPriorities = ['low', 'medium', 'high'];

    const sanitized: JobApplication[] = parsed.map((item: any, index: number) => {
      const stage: StageId = validStages.includes(item.stage) ? item.stage : 'applied';
      const priority = validPriorities.includes(item.priority) ? item.priority : 'medium';
      return {
        id: item.id || `imported-${Date.now()}-${index}`,
        company: item.company || 'Unknown Company',
        position: item.position || 'Unknown Position',
        location: item.location || '',
        salary: item.salary || '',
        stage,
        priority,
        dateApplied: item.dateApplied || '',
        followUpDate: item.followUpDate || '',
        jobUrl: item.jobUrl || '',
        contactName: item.contactName || '',
        contactEmail: item.contactEmail || '',
        notes: item.notes || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        rating: typeof item.rating === 'number' ? Math.max(1, Math.min(5, item.rating)) : 3,
        updatedAt: item.updatedAt || new Date().toISOString(),
        interviewRounds: Array.isArray(item.interviewRounds) ? item.interviewRounds : [],
        offerScoring: item.offerScoring || undefined,
      };
    });

    return { success: true, data: sanitized };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }
}
