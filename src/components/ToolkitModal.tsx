import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Mail, 
  DollarSign, 
  CheckSquare, 
  ExternalLink,
  BookOpen,
  Zap,
  ArrowRight,
  Target,
  AlertTriangle
} from 'lucide-react';
import { matchResumeToJobDescription, KeywordMatchResult } from '../utils/atsMatcher';
import { LockedGate } from './LockedGate';

interface ToolkitModalProps {
  onClose: () => void;
  isLicensed: boolean;
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({ onClose, isLicensed }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'email' | 'salary' | 'checklist' | 'ats'>('email');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [matchResult, setMatchResult] = useState<KeywordMatchResult | null>(null);
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', text: 'Research company recent funding news, product updates & values', checked: true },
    { id: '2', text: 'Prepare 3 STAR stories (Situation, Task, Action, Result) for behavioral questions', checked: true },
    { id: '3', text: 'Review job posting requirements & align with 3 specific portfolio examples', checked: false },
    { id: '4', text: 'Prepare 3 insightful questions for the interviewer about team roadmap & culture', checked: false },
    { id: '5', text: 'Test camera, microphone, lighting & internet connection 15 mins prior', checked: false },
    { id: '6', text: 'Send personalized Thank You email within 24 hours of interview conclusion', checked: false },
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleChecklist = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleRunMatch = () => {
    if (!resumeText.trim() || !jobDescText.trim()) return;
    setMatchResult(matchResumeToJobDescription(resumeText, jobDescText));
  };

  const templates = {
    cover: [
      {
        id: 'cover-1',
        title: 'High-Response Cold Outreach to Hiring Manager',
        text: `Hi [Hiring Manager Name],

I saw [Company] is hiring for a [Job Title], and I wanted to reach out directly. Over the past [X] years, I’ve built [key skill/system], including [mention 1 impressive achievement with metric, e.g. reducing page load by 40%].

I admire [Company]'s recent work on [Specific Product Feature]. I’d love to bring my experience in [Skill 1] and [Skill 2] to help [Company Goal].

Are you open to a brief 10-minute chat this week?

Best regards,
[Your Name]
[Link to Portfolio / LinkedIn]`
      },
      {
        id: 'cover-2',
        title: 'Referral Introduction Note',
        text: `Hi [Name],

Hope you're having a great week! I noticed an opening for [Job Title] at [Company] and immediately thought of our conversation about [Shared Interest / Former Project].

Given my background in [Core Tech Stack / Expertise] and recent experience delivering [Key Project], I feel this role is a great match. 

If you feel comfortable, would you be open to passing my resume along to the hiring team? Happy to send over a short blurbs for easy forwarding.

Thanks so much,
[Your Name]`
      }
    ],
    email: [
      {
        id: 'email-1',
        title: '1-Week Post-Application Follow-Up Script',
        text: `Subject: Following up on [Job Title] application - [Your Name]

Hi [Recruiter / Hiring Manager Name],

I hope you’re having a productive week! 

I submitted my application for the [Job Title] position last week and wanted to reiterate my strong enthusiasm for the role and [Company]'s mission in [Industry/Field].

Given my experience in [1-2 key skills], I am confident I can make an immediate contribution to [Team/Project Name].

Could you let me know if there are any updates regarding the next steps in the interview process?

Best regards,
[Your Name]
[Phone Number] | [LinkedIn Profile]`
      },
      {
        id: 'email-2',
        title: 'Post-Interview Thank You & Value Add (Send within 24h)',
        text: `Subject: Thank you! - [Job Title] Interview / [Your Name]

Hi [Interviewer Name],

Thank you for taking the time to speak with me today about the [Job Title] position. I really enjoyed learning more about [Company]'s upcoming priorities with [Topic discussed in interview].

Our discussion about [Specific Challenge Mentioned] got me thinking—I attached a quick sketch / summary of how I previously solved a similar problem at [Previous Company].

I’m even more excited about the prospect of joining the team. Please let me know if you need any additional information from my side.

Warm regards,
[Your Name]`
      },
      {
        id: 'email-3',
        title: 'Decision Check-In Script (When promised deadline passes)',
        text: `Subject: Re: [Job Title] Interview Status - [Your Name]

Hi [Recruiter Name],

I hope you're doing well! I'm following up on our previous conversation regarding the [Job Title] role. 

I remain very interested in joining [Company] and wanted to check if there are any updates regarding the timeline for next steps.

Please let me know if there is anything else I can provide to assist in your decision process!

Best,
[Your Name]`
      }
    ],
    salary: [
      {
        id: 'salary-1',
        title: '10-15% Base Salary Counter-Offer Script',
        text: `Hi [Recruiter / Manager Name],

Thank you so much for extending the offer for the [Job Title] position! I am thrilled about the opportunity to join [Company] and work with [Team Name].

Based on my extensive background in [Key Skill/Achievment] and current market data for similar roles in [Location/Remote], I was hoping we could discuss the base salary component. 

Would [Company] be able to consider $[Target Amount, e.g. $175,000]? 

With this adjustment, I would be ready to sign the agreement immediately and begin preparing for onboarding.

Thank you again for your time and flexibility!

Best regards,
[Your Name]`
      },
      {
        id: 'salary-2',
        title: 'Equity / Sign-on Bonus Compensation Adjustment',
        text: `Hi [Recruiter Name],

Thank you again for the formal offer! I'm genuinely excited about [Company]'s vision and the impact this team will make.

While the base salary is close to my expectations, I was wondering if we could explore an adjustment in either the equity grant or a one-time sign-on bonus of $[Amount] to help offset [unvested equity at current job / relocation cost].

If we can bridge this gap, I would be delighted to accept right away.

Best,
[Your Name]`
      }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="ledger-card bg-white rounded-2xl w-full overflow-hidden shadow-sm flex flex-col border border-ink/10">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-ink via-plum to-ink text-paper flex items-center justify-between border-b border-ink/40 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-plum/30 text-paper border border-white/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base font-display font-semibold text-paper tracking-tight">
                  Job Search Toolkit
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brass text-ink uppercase tracking-wider shrink-0">
                  $8 Toolkit Free
                </span>
              </div>
              <p className="text-xs text-paper/70 truncate hidden sm:block">
                Tested email scripts, cover letter templates & negotiation frameworks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-paper/70 hover:text-paper hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gumroad Upsell Header Banner */}
        <div className="bg-plum-soft border-b border-plum/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-plum shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-plum">
                Want 25+ More Templates & Salary Negotiation Spreadsheet?
              </span>
              <p className="text-plum/80 text-[11px]">
                Get the complete Gumroad Job Search Master Kit for $8 or copy free preview scripts below.
              </p>
            </div>
          </div>
          <a
            href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-plum hover:opacity-90 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Get Full Kit ($8)
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>

        {/* Navigation Tabs — horizontally scrollable, scrollbar hidden, fade hints on overflow */}
        <div className="relative border-b border-ink/10 bg-paper-dim shrink-0">
          <div className="px-2 sm:px-4 flex text-xs font-semibold overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('email')}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'email'
                  ? 'border-plum text-plum'
                  : 'border-transparent text-ink-soft/80 hover:text-ink'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Follow-Up Emails ({templates.email.length})</span>
              <span className="sm:hidden">Emails</span>
            </button>

            <button
              onClick={() => setActiveTab('cover')}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'cover'
                  ? 'border-plum text-plum'
                  : 'border-transparent text-ink-soft/80 hover:text-ink'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Cover Letters ({templates.cover.length})</span>
              <span className="sm:hidden">Letters</span>
            </button>

            <button
              onClick={() => setActiveTab('salary')}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'salary'
                  ? 'border-plum text-plum'
                  : 'border-transparent text-ink-soft/80 hover:text-ink'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Salary Negotiation ({templates.salary.length})</span>
              <span className="sm:hidden">Salary</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'checklist'
                  ? 'border-plum text-plum'
                  : 'border-transparent text-ink-soft/80 hover:text-ink'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Interview Prep Checklist</span>
              <span className="sm:hidden">Checklist</span>
            </button>

            <button
              onClick={() => setActiveTab('ats')}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'ats'
                  ? 'border-plum text-plum'
                  : 'border-transparent text-ink-soft/80 hover:text-ink'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">ATS Keyword Match</span>
              <span className="sm:hidden">ATS Match</span>
            </button>
          </div>
          {/* Fade hint that more tabs are scrollable — only relevant on narrow viewports */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-paper-dim to-transparent sm:hidden" />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-ink-soft bg-paper-dim/50">
          
          {activeTab === 'ats' ? (
            <LockedGate
              unlocked={isLicensed}
              title="ATS Keyword Match is a licensed feature"
              description="Compare your resume against any job description entirely in your browser — activate your license to unlock it."
              compact
            >
            <div className="space-y-4">
              <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-2xs">
                <h3 className="font-bold text-ink text-sm mb-1 flex items-center">
                  <Target className="w-4 h-4 mr-1.5 text-ledger" />
                  ATS Keyword Match
                </h3>
                <p className="text-ink-soft/80 text-[11px]">
                  Paste your resume and the job description below. This runs a term-frequency comparison entirely in your browser — nothing is uploaded anywhere. It catches exact/near-exact term overlap, not synonyms, so treat it as a quick gap-check, not gospel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">Your Resume Text</label>
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    rows={8}
                    className="w-full px-3 py-2 text-[11px] bg-white border border-ink/10 rounded-lg focus:outline-hidden focus:border-ledger resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">Job Description</label>
                  <textarea
                    value={jobDescText}
                    onChange={e => setJobDescText(e.target.value)}
                    placeholder="Paste the job posting text here..."
                    rows={8}
                    className="w-full px-3 py-2 text-[11px] bg-white border border-ink/10 rounded-lg focus:outline-hidden focus:border-ledger resize-none font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleRunMatch}
                disabled={!resumeText.trim() || !jobDescText.trim()}
                className="px-4 py-2 bg-ledger hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Analyze Match</span>
              </button>

              {matchResult && (
                <div className="bg-white border border-ink/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Match Score</span>
                    <span className={`font-display font-semibold text-lg ${
                      matchResult.matchPercent >= 70 ? 'text-ledger' : matchResult.matchPercent >= 40 ? 'text-brass' : 'text-stamp'
                    }`}>
                      {matchResult.matchPercent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        matchResult.matchPercent >= 70 ? 'bg-ledger' : matchResult.matchPercent >= 40 ? 'bg-brass' : 'bg-stamp'
                      }`}
                      style={{ width: `${matchResult.matchPercent}%` }}
                    />
                  </div>

                  {matchResult.missing.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-stamp mb-1.5 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Missing terms worth adding (if genuinely true of your background)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missing.map(term => (
                          <span key={term} className="px-2 py-0.5 bg-stamp-soft text-stamp text-[10px] font-medium rounded-full border border-stamp/30">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.matched.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-ledger mb-1.5 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Already covered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matched.map(term => (
                          <span key={term} className="px-2 py-0.5 bg-ledger-soft text-ledger text-[10px] font-medium rounded-full border border-ledger/30">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-ink-soft/60 pt-1">
                    Never fabricate skills you don't have just to raise this score — a keyword match gets you through a filter, not an interview.
                  </p>
                </div>
              )}
            </div>
            </LockedGate>
          ) : activeTab !== 'checklist' ? (
            templates[activeTab].map((item) => (
              <div key={item.id} className="bg-white border border-ink/10 rounded-xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-ink text-xs flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1.5 text-brass" />
                    {item.title}
                  </h3>
                  <button
                    onClick={() => handleCopy(item.text, item.id)}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-paper-dim hover:bg-slate-200 text-ink-soft font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedIndex === item.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-brass" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1 text-ink-soft/80" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-paper-dim border border-ink/10 rounded-lg text-ink text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                  {item.text}
                </pre>
              </div>
            ))
          ) : (
            <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-ink text-sm">
                Pre-Interview 6-Step Checklist
              </h3>
              <p className="text-ink-soft/80 text-xs">
                Check off items as you prepare for your upcoming interview loop.
              </p>

              <div className="space-y-2 pt-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg border border-ink/6 hover:bg-paper-dim cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-plum focus:ring-plum cursor-pointer"
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-ink-soft/60' : 'font-medium text-ink'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-ink/10 flex items-center justify-between text-xs shrink-0 gap-3">
          <span className="text-ink-soft/80 hidden sm:inline">
            Copy & paste directly into Gmail, Outlook, or LinkedIn messages.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink text-paper font-semibold rounded-lg hover:opacity-90 transition-colors cursor-pointer ml-auto sm:ml-0"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
