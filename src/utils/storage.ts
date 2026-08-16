import { JobApplication, INITIAL_SAMPLE_JOBS, StageId } from '../types';

const STORAGE_KEY = 'job_tracker_applications_v1';
const LICENSE_KEY_STORAGE = 'job_tracker_gumroad_license_v1';

export interface LicenseState {
  isAuthenticated: boolean;
  licenseKey: string;
  userName: string;
  userEmail: string;
  activatedAt: string;
  isGuest: boolean;
  googleLinked: boolean;
}

export function loadApplications(): JobApplication[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saveApplications(INITIAL_SAMPLE_JOBS);
      return INITIAL_SAMPLE_JOBS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
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
  } catch (err) {
    console.error('Failed to save job applications to localStorage:', err);
  }
}

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
    // Verify the write actually persisted rather than assuming it did —
    // some browser privacy modes (e.g. Safari with "Block All Cookies",
    // which also blocks Web Storage) silently no-op localStorage writes.
    const readBack = localStorage.getItem(LICENSE_KEY_STORAGE);
    return !!readBack && JSON.parse(readBack).isAuthenticated === license.isAuthenticated;
  } catch (err) {
    console.error('Failed to save license state:', err);
    return false;
  }
}

/** True if this browser will actually retain data written to localStorage. */
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
        interviewRounds: Array.isArray(item.interviewRounds) ? item.interviewRounds : []
      };
    });

    return { success: true, data: sanitized };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }
}
