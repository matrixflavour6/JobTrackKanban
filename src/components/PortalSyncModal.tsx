import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Link as LinkIcon, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Bookmark, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { JobApplication, StageId } from '../types';
import { parseJobPortalUrl, parseEmailText, ParsedJobInfo } from '../utils/portalParser';

interface PortalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (job: Omit<JobApplication, 'id' | 'updatedAt'>) => void;
}

export const PortalSyncModal: React.FC<PortalSyncModalProps> = ({
  isOpen,
  onClose,
  onAddJob
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'email' | 'bookmarklet'>('url');
  
  // URL Tab State
  const [urlInput, setUrlInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedJobInfo | null>(null);
  const [isUrlImported, setIsUrlImported] = useState(false);

  // Email Tab State
  const [emailText, setEmailText] = useState('');
  const [parsedEmailPreview, setParsedEmailPreview] = useState<ParsedJobInfo | null>(null);
  const [isEmailImported, setIsEmailImported] = useState(false);

  // Bookmarklet State
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setIsUrlImported(false);
    if (val.trim().length > 8) {
      const parsed = parseJobPortalUrl(val);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleUrlImport = () => {
    if (!parsedPreview) return;
    onAddJob({
      company: parsedPreview.company,
      position: parsedPreview.position,
      location: parsedPreview.location,
      salary: parsedPreview.salary || '$120k - $160k',
      stage: 'applied',
      priority: parsedPreview.priority,
      dateApplied: new Date().toISOString().slice(0, 10),
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      jobUrl: parsedPreview.jobUrl,
      contactName: '',
      contactEmail: '',
      notes: parsedPreview.notes,
      tags: parsedPreview.tags,
      rating: 4,
      interviewRounds: []
    });
    setIsUrlImported(true);
    setTimeout(() => {
      setUrlInput('');
      setParsedPreview(null);
      setIsUrlImported(false);
      onClose();
    }, 1200);
  };

  const handleEmailChange = (val: string) => {
    setEmailText(val);
    setIsEmailImported(false);
    if (val.trim().length > 15) {
      const parsed = parseEmailText(val);
      setParsedEmailPreview(parsed);
    } else {
      setParsedEmailPreview(null);
    }
  };

  const handleEmailImport = () => {
    if (!parsedEmailPreview) return;
    onAddJob({
      company: parsedEmailPreview.company,
      position: parsedEmailPreview.position,
      location: parsedEmailPreview.location,
      salary: '$130k - $170k',
      stage: 'applied',
      priority: 'medium',
      dateApplied: new Date().toISOString().slice(0, 10),
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      jobUrl: '',
      contactName: '',
      contactEmail: '',
      notes: parsedEmailPreview.notes,
      tags: parsedEmailPreview.tags,
      rating: 4,
      interviewRounds: []
    });
    setIsEmailImported(true);
    setTimeout(() => {
      setEmailText('');
      setParsedEmailPreview(null);
      setIsEmailImported(false);
      onClose();
    }, 1200);
  };

  const bookmarkletCode = `javascript:(function(){const title=document.title;const url=window.location.href;alert('JobTrack Kanban Auto-Clipper:\\n\\nCaptured: '+title+'\\nURL: '+url+'\\n\\nOpen JobTrack Kanban to import!');})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="apple-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-8 border border-black/10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Portal Sync & Auto-Tracker</h2>
              <p className="text-xs text-slate-300">Import applications instantly from LinkedIn, Indeed, Greenhouse, Lever & Email</p>
            </div>
          </div>

          {/* Supported Portals Badges */}
          <div className="flex items-center space-x-1.5 mt-4 pt-3 border-t border-white/10 text-[11px] overflow-x-auto scrollbar-none">
            <span className="text-slate-400 font-medium shrink-0 mr-1">Supported Portals:</span>
            {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Workday', 'Glassdoor', 'ZipRecruiter', 'Wellfound'].map(portal => (
              <span key={portal} className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 font-semibold text-slate-200 shrink-0">
                {portal}
              </span>
            ))}
          </div>
        </div>

        {/* Tab Switcher (Apple-style) */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-black/5">
          <div className="flex space-x-2 bg-slate-200/70 p-1 rounded-xl w-full max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Paste Portal URL</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Email Receipt Parser</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarklet')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'bookmarklet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span>Browser Clipper</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-5">
          
          {/* TAB 1: PASTE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Job Posting URL (LinkedIn, Indeed, Greenhouse, Lever, etc.)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="e.g. https://www.linkedin.com/jobs/view/senior-react-engineer-at-stripe-392810"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Our smart parser automatically detects the job portal, role title, company name, and location metadata.
                </p>
              </div>

              {/* URL Preview Box */}
              {parsedPreview && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                      Detected Portal: {parsedPreview.portalName}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Auto-Parsed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Company</span>
                      <span className="font-bold text-slate-900">{parsedPreview.company}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Position Title</span>
                      <span className="font-bold text-slate-900">{parsedPreview.position}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Default Stage</span>
                      <span className="font-semibold text-emerald-700">Applied</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Tags</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {parsedPreview.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUrlImport}
                    disabled={isUrlImported}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                      isUrlImported
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white active:bg-blue-700'
                    }`}
                  >
                    {isUrlImported ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Successfully Added to Kanban!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Track Application to Kanban Board</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL PARSER */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Paste Confirmation Email / Portal Receipt
                </label>
                <textarea
                  rows={5}
                  value={emailText}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Paste email snippet, e.g.: 'Thank you for applying to Senior Product Designer at Figma. We have received your application...'"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>

              {parsedEmailPreview && (
                <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      <Mail className="w-3 h-3 mr-1 text-purple-600" />
                      Email Parsed
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700">Ready to Track</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Company</span>
                      <span className="font-bold text-slate-900">{parsedEmailPreview.company}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Position</span>
                      <span className="font-bold text-slate-900">{parsedEmailPreview.position}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleEmailImport}
                    disabled={isEmailImported}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                      isEmailImported
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white active:bg-purple-700'
                    }`}
                  >
                    {isEmailImported ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved to Kanban Board!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Import Email Receipt</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKLET */}
          {activeTab === 'bookmarklet' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-5 h-5 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900">1-Click Browser Toolbar Clipper</h4>
                </div>
                <p className="text-xs text-amber-800">
                  Save this bookmarklet to your browser's bookmarks bar. While browsing job posts on LinkedIn, Indeed, or Greenhouse, click the bookmarklet to capture title & URL instantly.
                </p>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={copyBookmarklet}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    {copiedBookmarklet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBookmarklet ? 'Copied Bookmarklet Code!' : 'Copy Bookmarklet JavaScript Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-black/5">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              All portal data parsed client-side in browser memory
            </span>
            <span className="font-semibold text-slate-700">100% Private</span>
          </div>

        </div>
      </div>
    </div>
  );
};
