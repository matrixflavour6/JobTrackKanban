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

export function parseJobPortalUrl(urlStr: string): ParsedJobInfo {
  let cleanUrl = urlStr.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let domain = '';
  let pathname = '';
  try {
    const parsedUrl = new URL(cleanUrl);
    domain = parsedUrl.hostname.toLowerCase();
    pathname = parsedUrl.pathname;
  } catch (e) {
    domain = cleanUrl.toLowerCase();
  }

  let portalName = 'Web Import';
  let company = '';
  let position = '';
  let location = 'Remote / Hybrid';
  let salary = '';
  let tags: string[] = ['Portal Sync'];
  let priority: Priority = 'medium';
  let stage: StageId = 'applied';
  let notes = `Imported from ${cleanUrl} on ${new Date().toLocaleDateString()}`;

  // 1. LINKEDIN
  if (domain.includes('linkedin.com')) {
    portalName = 'LinkedIn';
    tags.push('LinkedIn');
    
    // Check URL patterns like linkedin.com/jobs/view/senior-react-developer-at-stripe-123456
    const pathParts = pathname.split('/').filter(Boolean);
    const viewIndex = pathParts.indexOf('view');
    if (viewIndex !== -1 && pathParts[viewIndex + 1]) {
      const slug = decodeURIComponent(pathParts[viewIndex + 1]).replace(/-/g, ' ');
      // Try to match "role-at-company"
      const atMatch = slug.match(/(.+)\s+at\s+(.+?)(?:\s+\d+)?$/i);
      if (atMatch) {
        position = capitalizeWords(atMatch[1]);
        company = capitalizeWords(atMatch[2]);
      } else {
        position = capitalizeWords(slug.replace(/\d+/g, ''));
      }
    }
    
    if (!company) company = 'Tech Company (LinkedIn)';
    if (!position) position = 'Software Engineer / Professional';
  }
  // 2. GREENHOUSE
  else if (domain.includes('greenhouse.io')) {
    portalName = 'Greenhouse';
    tags.push('Greenhouse');
    
    // boards.greenhouse.io/stripe/jobs/123456
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      company = capitalizeWords(parts[0]);
    }
    if (parts.length >= 3 && parts[1] === 'jobs') {
      const titleSlug = parts[2].replace(/-/g, ' ');
      position = capitalizeWords(titleSlug.replace(/\d+/g, ''));
    }
    if (!company) company = 'Greenhouse Board';
    if (!position) position = 'Open Position';
  }
  // 3. LEVER
  else if (domain.includes('lever.co')) {
    portalName = 'Lever';
    tags.push('Lever');
    
    // jobs.lever.co/figma/abc-123
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      company = capitalizeWords(parts[0]);
    }
    if (parts.length >= 2) {
      const slug = parts[1].replace(/-/g, ' ');
      position = capitalizeWords(slug);
    }
    if (!company) company = 'Lever Hiring';
    if (!position) position = 'Open Role';
  }
  // 4. INDEED
  else if (domain.includes('indeed.com')) {
    portalName = 'Indeed';
    tags.push('Indeed');
    company = 'Indeed Employer';
    position = 'Applied Role';
  }
  // 5. WORKDAY
  else if (domain.includes('workday') || domain.includes('myworkdayjobs.com')) {
    portalName = 'Workday';
    tags.push('Workday');
    
    // e.g. company.wd1.myworkdayjobs.com
    const sub = domain.split('.')[0];
    if (sub && sub !== 'www' && sub !== 'jobs') {
      company = capitalizeWords(sub);
    } else {
      company = 'Enterprise Corp (Workday)';
    }
    position = 'Enterprise Role';
  }
  // 6. GLASSDOOR
  else if (domain.includes('glassdoor.com')) {
    portalName = 'Glassdoor';
    tags.push('Glassdoor');
    company = 'Glassdoor Employer';
    position = 'Open Position';
  }
  // 7. WELLFOUND / ANGELLIST
  else if (domain.includes('wellfound.com') || domain.includes('angel.co')) {
    portalName = 'Wellfound';
    tags.push('Wellfound', 'Startup');
    priority = 'high';
    company = 'Startup (Wellfound)';
    position = 'Full-Stack / Tech Role';
  }
  // 8. ZIPRECRUITER
  else if (domain.includes('ziprecruiter.com')) {
    portalName = 'ZipRecruiter';
    tags.push('ZipRecruiter');
    company = 'ZipRecruiter Partner';
    position = 'Applied Role';
  }
  // 9. GENERIC FALLBACK
  else {
    portalName = capitalizeWords(domain.replace('www.', '').split('.')[0]);
    tags.push(portalName);
    const pathParts = pathname.split('/').filter(p => p.length > 2 && !p.includes('.'));
    if (pathParts.length > 0) {
      position = capitalizeWords(pathParts[pathParts.length - 1].replace(/[-_]/g, ' '));
    } else {
      position = 'Software Role';
    }
    company = portalName;
  }

  return {
    company: company || 'Company Name',
    position: position || 'Job Title',
    location,
    salary,
    portalName,
    tags,
    jobUrl: cleanUrl,
    notes,
    priority,
    stage
  };
}

export function parseEmailText(emailBody: string): ParsedJobInfo {
  const text = emailBody.trim();
  let company = '';
  let position = '';
  let location = 'Remote';
  let portalName = 'Email Sync';
  const tags = ['Email Sync'];

  // Try to match "application to [Position] at [Company]" or "applied for [Position] at [Company]"
  const appliedMatch = text.match(/(?:applied (?:for|to)|application for|received your application for)\s+(.+?)\s+(?:at|with)\s+(.+?)(?:[\n\.\,\!]|$)/i);
  if (appliedMatch) {
    position = capitalizeWords(appliedMatch[1]);
    company = capitalizeWords(appliedMatch[2]);
  } else {
    // Try matching "Thank you for applying to [Company]"
    const thanksMatch = text.match(/thank you for applying to\s+(.+?)(?:[\n\.\,\!]|$)/i);
    if (thanksMatch) {
      company = capitalizeWords(thanksMatch[1]);
    }
  }

  if (text.toLowerCase().includes('linkedin')) tags.push('LinkedIn');
  if (text.toLowerCase().includes('greenhouse')) tags.push('Greenhouse');
  if (text.toLowerCase().includes('lever')) tags.push('Lever');

  return {
    company: company || 'Company from Email',
    position: position || 'Role from Confirmation Email',
    location,
    salary: '',
    portalName,
    tags,
    jobUrl: '',
    notes: `Parsed from confirmation email:\n\n${text.slice(0, 300)}...`,
    priority: 'medium',
    stage: 'applied'
  };
}

function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
