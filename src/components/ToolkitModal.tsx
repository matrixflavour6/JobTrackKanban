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
  ArrowRight
} from 'lucide-react';

interface ToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'email' | 'salary' | 'checklist'>('email');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', text: 'Research company recent funding news, product updates & values', checked: true },
    { id: '2', text: 'Prepare 3 STAR stories (Situation, Task, Action, Result) for behavioral questions', checked: true },
    { id: '3', text: 'Review job posting requirements & align with 3 specific portfolio examples', checked: false },
    { id: '4', text: 'Prepare 3 insightful questions for the interviewer about team roadmap & culture', checked: false },
    { id: '5', text: 'Test camera, microphone, lighting & internet connection 15 mins prior', checked: false },
    { id: '6', text: 'Send personalized Thank You email within 24 hours of interview conclusion', checked: false },
  ]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Job Search Toolkit
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500 text-white uppercase tracking-wider">
                  Toolkit Included Free
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tested email scripts, cover letter templates & negotiation frameworks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gumroad Upsell Header Banner */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-purple-950">
                Want 25+ More Templates & Salary Negotiation Spreadsheet?
              </span>
              <p className="text-purple-800 text-[11px]">
                Get the complete Gumroad Job Search Master Kit or copy free preview scripts below!
              </p>
            </div>
          </div>
          <a
            href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Get Full Kit
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex space-x-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'email'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Follow-Up Emails ({templates.email.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'cover'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Cover Letters ({templates.cover.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('salary')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'salary'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Negotiation ({templates.salary.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Interview Prep Checklist</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 bg-slate-50/50">
          
          {activeTab !== 'checklist' ? (
            templates[activeTab].map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    {item.title}
                  </h3>
                  <button
                    onClick={() => handleCopy(item.text, item.id)}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    {copiedIndex === item.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1 text-slate-500" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                  {item.text}
                </pre>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Pre-Interview 6-Step Checklist
              </h3>
              <p className="text-slate-500 text-xs">
                Check off items as you prepare for your upcoming interview loop.
              </p>

              <div className="space-y-2 pt-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-slate-400' : 'font-medium text-slate-800'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Copy & paste directly into Gmail, Outlook, or LinkedIn messages.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
