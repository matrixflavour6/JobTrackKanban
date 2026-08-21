import { JobApplication, Priority, StageId } from '../types';

export interface ParsedJobInfo {
  company: string;
  position: string;
  location: string;
  salary: string;
  portalName: string;
  tags: string[];
  jobUrl: string;
  notes: string;
  priority: Priority;
  stage: StageId;
}

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function cleanSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b(jobs?|careers?|apply|positions?|openings?)\b/gi, '')
    .trim();
}

/**
 * Universal job portal URL extractor with pattern support for 18+ ATS systems & job boards.
 */
export function parseJobPortalUrl(urlStr: string): ParsedJobInfo {
  let cleanUrl = urlStr.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let domain = '';
  let pathname = '';
  let searchParams: URLSearchParams | null = null;
  try {
    const parsedUrl = new URL(cleanUrl);
    domain = parsedUrl.hostname.toLowerCase();
    pathname = parsedUrl.pathname;
    searchParams = parsedUrl.searchParams;
  } catch (e) {
    domain = cleanUrl.toLowerCase();
  }

  let portalName = 'Web Link';
  let company = '';
  let position = '';
  let location = 'Remote / Hybrid';
  let salary = '';
  let tags: string[] = ['Portal Import'];
  let priority: Priority = 'medium';
  let stage: StageId = 'applied';
  let notes = `Imported from ${cleanUrl} on ${new Date().toLocaleDateString()}`;

  const pathParts = pathname.split('/').filter(Boolean);

  // 1. LINKEDIN
  if (domain.includes('linkedin.com')) {
    portalName = 'LinkedIn';
    tags.push('LinkedIn');
    const viewIndex = pathParts.indexOf('view');
    if (viewIndex !== -1 && pathParts[viewIndex + 1]) {
      const slug = cleanSlug(pathParts[viewIndex + 1]);
      const atMatch = slug.match(/(.+)\s+at\s+(.+?)(?:\s+\d+)?$/i);
      if (atMatch) {
        position = capitalizeWords(atMatch[1]);
        company = capitalizeWords(atMatch[2]);
      } else {
        position = capitalizeWords(slug.replace(/\d+/g, ''));
      }
    }
  }
  // 2. GREENHOUSE
  else if (domain.includes('greenhouse.io')) {
    portalName = 'Greenhouse';
    tags.push('Greenhouse', 'Direct ATS');
    if (pathParts[0] && pathParts[0] !== 'embed') {
      company = capitalizeWords(pathParts[0].replace(/[-_]/g, ' '));
    }
  }
  // 3. LEVER
  else if (domain.includes('lever.co')) {
    portalName = 'Lever';
    tags.push('Lever', 'Direct ATS');
    if (pathParts[0]) {
      company = capitalizeWords(pathParts[0].replace(/[-_]/g, ' '));
    }
    if (pathParts[1] && pathParts[1] !== 'apply') {
      position = capitalizeWords(cleanSlug(pathParts[1]));
    }
  }
  // 4. ASHBY
  else if (domain.includes('ashbyhq.com')) {
    portalName = 'Ashby';
    tags.push('Ashby', 'Startup');
    if (pathParts[0]) {
      company = capitalizeWords(pathParts[0].replace(/[-_]/g, ' '));
    }
    if (pathParts[1]) {
      position = capitalizeWords(cleanSlug(pathParts[1]));
    }
  }
  // 5. WORKDAY
  else if (domain.includes('myworkdayjobs.com') || domain.includes('workday.com')) {
    portalName = 'Workday';
    tags.push('Workday', 'Enterprise');
    const sub = domain.split('.')[0];
    if (sub && sub !== 'www' && sub !== 'jobs') {
      company = capitalizeWords(sub.replace(/[-_]/g, ' '));
    }
    const jobPart = pathParts.find(p => p.toLowerCase().includes('job') || p.includes('_'));
    if (jobPart) {
      position = capitalizeWords(cleanSlug(jobPart));
    }
  }
  // 6. SMARTRECRUITERS
  else if (domain.includes('smartrecruiters.com')) {
    portalName = 'SmartRecruiters';
    tags.push('SmartRecruiters');
    if (pathParts[0]) company = capitalizeWords(pathParts[0]);
    if (pathParts[1]) position = capitalizeWords(cleanSlug(pathParts[1]));
  }
  // 7. WELLFOUND / ANGELLIST
  else if (domain.includes('wellfound.com') || domain.includes('angel.co')) {
    portalName = 'Wellfound';
    tags.push('Wellfound', 'Startup');
    const companyIndex = pathParts.indexOf('company');
    if (companyIndex !== -1 && pathParts[companyIndex + 1]) {
      company = capitalizeWords(cleanSlug(pathParts[companyIndex + 1]));
    }
    const roleIndex = pathParts.indexOf('jobs');
    if (roleIndex !== -1 && pathParts[roleIndex + 1]) {
      position = capitalizeWords(cleanSlug(pathParts[roleIndex + 1]));
    }
  }
  // 8. INDEED
  else if (domain.includes('indeed.com')) {
    portalName = 'Indeed';
    tags.push('Indeed');
    if (searchParams && searchParams.get('q')) {
      position = capitalizeWords(searchParams.get('q') || '');
    }
  }
  // 9. GLASSDOOR
  else if (domain.includes('glassdoor.com')) {
    portalName = 'Glassdoor';
    tags.push('Glassdoor');
    const jobSlug = pathParts.find(p => p.toLowerCase().includes('job-listing') || p.toLowerCase().includes('job'));
    if (jobSlug) {
      position = capitalizeWords(cleanSlug(jobSlug));
    }
  }
  // 10. REMOTEOK
  else if (domain.includes('remoteok.com') || domain.includes('remoteok.io')) {
    portalName = 'RemoteOK';
    tags.push('RemoteOK', 'Remote');
    location = '100% Remote';
    if (pathParts[1]) {
      const match = pathParts[1].match(/remote-(.+?)-(?:at-)?(.+)/i);
      if (match) {
        position = capitalizeWords(match[1].replace(/-/g, ' '));
        company = capitalizeWords(match[2].replace(/-/g, ' '));
      }
    }
  }
  // 11. Y COMBINATOR
  else if (domain.includes('workatastartup.com') || domain.includes('ycombinator.com')) {
    portalName = 'YC Startup';
    tags.push('Y Combinator', 'Startup');
    const compIdx = pathParts.indexOf('companies');
    if (compIdx !== -1 && pathParts[compIdx + 1]) {
      company = capitalizeWords(cleanSlug(pathParts[compIdx + 1]));
    }
  }
  // 12. OTTA / WELCOME TO THE JUNGLE
  else if (domain.includes('otta.com') || domain.includes('welcometothejungle.com')) {
    portalName = 'Otta';
    tags.push('Otta', 'Tech');
  }
  // 13. ZIPRECRUITER
  else if (domain.includes('ziprecruiter.com')) {
    portalName = 'ZipRecruiter';
    tags.push('ZipRecruiter');
  }
  // 14. HANDSHAKE
  else if (domain.includes('joinhandshake.com')) {
    portalName = 'Handshake';
    tags.push('Handshake', 'University');
  }
  // 15. DICE
  else if (domain.includes('dice.com')) {
    portalName = 'Dice';
    tags.push('Dice', 'Tech');
  }
  // 16. GENERIC CAREER PAGE
  else {
    const mainHost = domain.replace(/^www\./, '').split('.')[0];
    company = capitalizeWords(mainHost);
    const potentialSlug = pathParts[pathParts.length - 1] || '';
    if (potentialSlug && potentialSlug.length > 3) {
      position = capitalizeWords(cleanSlug(potentialSlug));
    }
  }

  // Fallbacks if extraction could not deduce specific tokens
  if (!company) company = capitalizeWords(domain.replace(/^www\./, '').split('.')[0]) || 'Target Company';
  if (!position) position = 'Software Engineer / Role';

  return {
    company,
    position,
    location,
    salary,
    portalName,
    tags: Array.from(new Set(tags)),
    jobUrl: cleanUrl,
    notes,
    priority,
    stage,
  };
}

/**
 * Smart raw text job description parser.
 * Extracts title, company, salary estimate, location, and requirements from pasted job posts.
 */
export function parseRawJobDescription(text: string): Partial<JobApplication> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return {};

  let company = '';
  let position = '';
  let salary = '';
  let location = '';
  const tags: string[] = ['Pasted JD'];

  // Look for Salary patterns like $140,000 - $180,000 or $150k - $200k
  const salaryMatch = text.match(/\$\s*(\d{2,3}(?:,\d{3})*(?:\s*k|\s*K)?(?:\s*-\s*\$?\s*\d{2,3}(?:,\d{3})*(?:\s*k|\s*K)?)?)/i);
  if (salaryMatch) {
    salary = salaryMatch[0].trim();
  }

  // Look for Location / Work Mode
  if (/remote/i.test(text)) {
    location = 'Remote';
    tags.push('Remote');
  } else if (/hybrid/i.test(text)) {
    location = 'Hybrid';
    tags.push('Hybrid');
  } else if (/san francisco|sf|new york|nyc|seattle|austin|boston|london/i.test(text)) {
    const locMatch = text.match(/\b(San Francisco|SF|New York|NYC|Seattle|Austin|Boston|London|Chicago|Toronto)\b/i);
    if (locMatch) location = locMatch[0];
  }

  // Tech tags extraction
  const techKeywords = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'AWS', 'Next.js', 'GraphQL', 'Tailwind', 'PostgreSQL', 'Docker', 'Kubernetes', 'Java', 'Rust', 'C++', 'Swift', 'Flutter', 'AI', 'Machine Learning'];
  techKeywords.forEach(k => {
    const regex = new RegExp(`\\b${k.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(text)) {
      tags.push(k);
    }
  });

  // Extract Title and Company from top lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (/engineer|developer|designer|manager|lead|architect|specialist|analyst|associate|director/i.test(line) && !position) {
      position = line.replace(/^[•\-\*#\s]+/, '').slice(0, 60);
    } else if (/company|at\s+([A-Z][a-zA-Z0-9]+)|about\s+([A-Z][a-zA-Z0-9]+)/i.test(line) && !company) {
      const match = line.match(/(?:at|about|company:?)\s+([A-Z][a-zA-Z0-9\s&]+)/i);
      if (match) company = match[1].trim();
    }
  }

  if (!position && lines[0]) {
    position = lines[0].slice(0, 50);
  }
  if (!company && lines[1] && lines[1].length < 40) {
    company = lines[1];
  }

  return {
    company: company || 'Company from Posting',
    position: position || 'Role from Posting',
    location: location || 'Remote / Hybrid',
    salary: salary || '',
    tags: Array.from(new Set(tags)).slice(0, 6),
    notes: `Pasted Job Posting Summary:\n\n${text.slice(0, 500)}${text.length > 500 ? '...' : ''}`,
    priority: 'high',
    stage: 'wishlist',
  };
}

/**
 * Parses recruiter or application confirmation emails into structured application records.
 */
export function parseEmailText(emailText: string): ParsedJobInfo {
  const lines = emailText.split('\n').map(l => l.trim()).filter(Boolean);
  let company = '';
  let position = '';
  let stage: StageId = 'applied';

  // Detect stage from keywords
  if (/interview|schedule|phone screen|chat with|technical assessment/i.test(emailText)) {
    stage = 'interview';
  } else if (/offer|congratulations|package|compensation/i.test(emailText)) {
    stage = 'offer';
  } else if (/unfortunately|not moving forward|other candidates|at this time/i.test(emailText)) {
    stage = 'rejected';
  }

  // Detect company
  const compMatch = emailText.match(/(?:at|from|with|joining)\s+([A-Z][a-zA-Z0-9]+)/i);
  if (compMatch) {
    company = capitalizeWords(compMatch[1]);
  }

  // Detect position
  const roleMatch = emailText.match(/(?:for the|role of|position of|as a)\s+([A-Za-z\s]+?)(?:role|position|\.|\n|,)/i);
  if (roleMatch) {
    position = capitalizeWords(roleMatch[1].trim());
  }

  if (!company && lines[0]) company = lines[0].slice(0, 40);
  if (!position) position = 'Software Engineer';

  return {
    company: company || 'Recruiter Inbound',
    position: position || 'Software Engineer',
    location: 'Remote / Hybrid',
    salary: '',
    portalName: 'Email Inbound',
    tags: ['Email Sync', 'Inbound'],
    jobUrl: '',
    notes: `Parsed from Email:\n\n${emailText.slice(0, 400)}`,
    priority: 'high',
    stage,
  };
}

/**
 * Parses payload passed from bookmarklet (?clip=...)
 */
export function parseClipboardImport(clipPayload: string): ParsedJobInfo | null {
  try {
    const decoded = decodeURIComponent(clipPayload);
    try {
      const obj = JSON.parse(decoded);
      return {
        company: obj.company || 'Clipped Company',
        position: obj.position || obj.title || 'Clipped Position',
        location: obj.location || 'Remote',
        salary: obj.salary || '',
        portalName: obj.portalName || 'Browser Clip',
        tags: Array.isArray(obj.tags) ? obj.tags : ['Bookmarklet'],
        jobUrl: obj.url || '',
        notes: obj.notes || `Clipped from ${obj.url || 'web'}`,
        priority: obj.priority || 'medium',
        stage: obj.stage || 'applied',
      };
    } catch {
      // If it's a raw URL string
      return parseJobPortalUrl(decoded);
    }
  } catch {
    return null;
  }
}
