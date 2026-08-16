export type StageId = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';
export type Priority = 'low' | 'medium' | 'high';
export type ViewMode = 'kanban' | 'table' | 'offers' | 'calendar' | 'analytics';

export interface StageConfig {
  id: StageId;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  badgeBg: string;
}

export interface InterviewRound {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface OfferScoring {
  commuteMinutes?: number;
  compSatisfaction?: number; // 1-10
  culture?: number; // 1-10
  growth?: number; // 1-10
}

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  salary: string;
  stage: StageId;
  priority?: Priority;
  dateApplied: string;
  followUpDate: string;
  jobUrl: string;
  contactName: string;
  contactEmail: string;
  notes: string;
  tags: string[];
  rating: number; // 1 to 5 stars
  updatedAt: string;
  interviewRounds: InterviewRound[];
  offerScoring?: OfferScoring;
}

export interface StorageSnapshot {
  id: string;
  timestamp: string;
  label: string;
  count: number;
  data: JobApplication[];
}

export interface AISettings {
  apiKey?: string;
  model?: string;
  enabled: boolean;
}

export interface AICoverLetterOutput {
  subject: string;
  opening: string;
  body: string;
  closing: string;
  fullText: string;
}

export interface AIInterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'situational';
  tips: string;
  suggestedFramework: string;
}

export const STAGES: StageConfig[] = [
  {
    id: 'wishlist',
    title: 'Wishlist',
    description: 'Jobs to research or apply for',
    color: 'bg-slate-soft text-slate border-slate',
    borderColor: 'border-slate',
    badgeBg: 'bg-slate-soft text-slate border-slate',
  },
  {
    id: 'applied',
    title: 'Applied',
    description: 'Applications submitted',
    color: 'bg-ledger-soft text-ledger border-ledger',
    borderColor: 'border-ledger',
    badgeBg: 'bg-ledger-soft text-ledger border-ledger',
  },
  {
    id: 'interview',
    title: 'Interviewing',
    description: 'Active interview process',
    color: 'bg-plum-soft text-plum border-plum',
    borderColor: 'border-plum',
    badgeBg: 'bg-plum-soft text-plum border-plum',
  },
  {
    id: 'offer',
    title: 'Offer Received',
    description: 'Pending decision or accepted',
    color: 'bg-brass-soft text-brass border-brass',
    borderColor: 'border-brass',
    badgeBg: 'bg-brass-soft text-brass border-brass',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    description: 'Closed applications',
    color: 'bg-stamp-soft text-stamp border-stamp',
    borderColor: 'border-stamp',
    badgeBg: 'bg-stamp-soft text-stamp border-stamp',
  },
];

export const INITIAL_SAMPLE_JOBS: JobApplication[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    position: 'Senior Frontend Engineer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$180k - $210k',
    stage: 'interview',
    priority: 'high',
    dateApplied: '2026-07-10',
    followUpDate: '2026-07-23',
    jobUrl: 'https://stripe.com/jobs',
    contactName: 'Sarah Jenkins (Recruiter)',
    contactEmail: 'sjenkins@stripe.com',
    notes: 'System design interview scheduled for Thursday. Review React rendering architecture & state sync.',
    tags: ['React', 'TypeScript', 'Fintech', 'Hybrid'],
    rating: 5,
    updatedAt: new Date().toISOString(),
    interviewRounds: [
      { id: 'r1', title: 'Recruiter Screen', date: '2026-07-14', completed: true, notes: 'Went great, asked about past React projects.' },
      { id: 'r2', title: 'Technical Screen', date: '2026-07-18', completed: true, notes: 'Coding exercise on live data structures.' },
      { id: 'r3', title: 'Onsite / Final Loop', date: '2026-07-25', completed: false, notes: 'System design & architecture focus.' },
    ],
  },
  {
    id: 'job-2',
    company: 'Vercel',
    position: 'Full Stack Engineer',
    location: 'Remote (US)',
    salary: '$160k - $190k',
    stage: 'offer',
    priority: 'high',
    dateApplied: '2026-06-28',
    followUpDate: '2026-07-24',
    jobUrl: 'https://vercel.com/careers',
    contactName: 'Alex Rivera',
    contactEmail: 'arivera@vercel.com',
    notes: 'Received initial offer package ($175k base + equity). Deadline to respond is July 28.',
    tags: ['Next.js', 'Remote', 'Full-stack', 'High Priority'],
    rating: 5,
    updatedAt: new Date().toISOString(),
    interviewRounds: [
      { id: 'r1', title: 'Initial Call', date: '2026-07-01', completed: true },
      { id: 'r2', title: 'Take Home Project', date: '2026-07-06', completed: true },
      { id: 'r3', title: 'Team Fit & Offer Chat', date: '2026-07-15', completed: true },
    ],
  },
  {
    id: 'job-3',
    company: 'Figma',
    position: 'Product Designer / UI Developer',
    location: 'New York, NY',
    salary: '$150k - $175k',
    stage: 'applied',
    priority: 'medium',
    dateApplied: '2026-07-19',
    followUpDate: '2026-07-26',
    jobUrl: 'https://figma.com/careers',
    contactName: 'Talent Acquisition Team',
    contactEmail: 'careers@figma.com',
    notes: 'Submitted customized portfolio link highlighting interactive design system components.',
    tags: ['UI/UX', 'Design Systems', 'TypeScript'],
    rating: 4,
    updatedAt: new Date().toISOString(),
    interviewRounds: [],
  },
  {
    id: 'job-4',
    company: 'Linear',
    position: 'Software Engineer - Infrastructure',
    location: 'Remote',
    salary: '$170k - $200k',
    stage: 'applied',
    priority: 'high',
    dateApplied: '2026-07-15',
    followUpDate: '2026-07-22',
    jobUrl: 'https://linear.app/careers',
    contactName: 'Kari (Engineering Manager)',
    contactEmail: 'kari@linear.app',
    notes: 'Follow-up email due today! Sent email checking on application status.',
    tags: ['Remote', 'Systems', 'GraphQL'],
    rating: 5,
    updatedAt: new Date().toISOString(),
    interviewRounds: [],
  },
  {
    id: 'job-5',
    company: 'Airbnb',
    position: 'Senior UI Engineer',
    location: 'San Francisco, CA',
    salary: '$175k - $205k',
    stage: 'wishlist',
    priority: 'medium',
    dateApplied: '',
    followUpDate: '',
    jobUrl: 'https://careers.airbnb.com',
    contactName: 'Referral contact: Mark',
    contactEmail: '',
    notes: 'Need to update resume with latest project metrics before asking Mark for a referral.',
    tags: ['Wishlist', 'React', 'Referral Needed'],
    rating: 4,
    updatedAt: new Date().toISOString(),
    interviewRounds: [],
  },
  {
    id: 'job-6',
    company: 'Datadog',
    position: 'Frontend Engineer',
    location: 'Boston, MA (Hybrid)',
    salary: '$140k - $165k',
    stage: 'rejected',
    priority: 'low',
    dateApplied: '2026-06-15',
    followUpDate: '',
    jobUrl: 'https://datadoghq.com/careers',
    contactName: '',
    contactEmail: '',
    notes: 'Position filled internally. Good learning experience on their initial assessment screen.',
    tags: ['Datavis', 'TypeScript'],
    rating: 3,
    updatedAt: new Date().toISOString(),
    interviewRounds: [
      { id: 'r1', title: 'Recruiter Call', date: '2026-06-20', completed: true },
    ],
  },
];
