import React, { useState, useEffect } from 'react';
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
import { scanGmailForApplications, GmailCandidate } from '../utils/gmailSync';
import { isGoogleSignedIn, signInWithGoogle } from '../utils/googleAuth';
import { LockedGate } from './LockedGate';

interface PortalSyncModalProps {
  onClose: () => void;
  onAddJob: (job: Omit<JobApplication, 'id' | 'updatedAt'>) => void;
  initialClippedJob?: ParsedJobInfo | null;
  isLicensed: boolean;
}

export const PortalSyncModal: React.FC<PortalSyncModalProps> = ({
  onClose,
  onAddJob,
  initialClippedJob,
  isLicensed
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'email' | 'bookmarklet' | 'clipped'>('url');

  // Auto-Clipped Tab State
  const [clippedJob, setClippedJob] = useState<ParsedJobInfo | null>(initialClippedJob || null);
  const [isClippedImported, setIsClippedImported] = useState(false);

  useEffect(() => {
    if (initialClippedJob) {
      setClippedJob(initialClippedJob);
      setActiveTab('clipped');
      setIsClippedImported(false);
    }
  }, [initialClippedJob]);
  
  // URL Tab State
  const [urlInput, setUrlInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedJobInfo | null>(null);
  const [isUrlImported, setIsUrlImported] = useState(false);

  // Email Tab State
  const [emailText, setEmailText] = useState('');
  const [parsedEmailPreview, setParsedEmailPreview] = useState<ParsedJobInfo | null>(null);
  const [isEmailImported, setIsEmailImported] = useState(false);

  // Gmail Auto-Scan State
  const [gmailCandidates, setGmailCandidates] = useState<GmailCandidate[]>([]);
  const [addedMessageIds, setAddedMessageIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  // Bookmarklet State
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

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

  const handleGmailScan = async () => {
    setIsScanning(true);
    setScanError('');
    try {
      if (!isGoogleSignedIn()) {
        await signInWithGoogle();
      }
      const results = await scanGmailForApplications(20);
      setGmailCandidates(results);
      setHasScanned(true);
    } catch (err: any) {
      setScanError(err.message || 'Could not scan Gmail.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddGmailCandidate = (candidate: GmailCandidate) => {
    const parsed = candidate.parsed;
    onAddJob({
      company: parsed.company,
      position: parsed.position,
      location: parsed.location || 'Remote',
      salary: parsed.salary || '',
      stage: 'applied',
      priority: parsed.priority,
      dateApplied: new Date().toISOString().slice(0, 10),
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      jobUrl: '',
      contactName: '',
      contactEmail: '',
      notes: parsed.notes,
      tags: [...parsed.tags, 'Gmail Sync'],
      rating: 4,
      interviewRounds: []
    });
    setAddedMessageIds(prev => new Set(prev).add(candidate.messageId));
  };

  const handleClippedImport = () => {
    if (!clippedJob) return;
    onAddJob({
      company: clippedJob.company,
      position: clippedJob.position,
      location: clippedJob.location || 'Remote / Hybrid',
      salary: clippedJob.salary || '',
      stage: 'applied',
      priority: clippedJob.priority,
      dateApplied: new Date().toISOString().slice(0, 10),
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      jobUrl: clippedJob.jobUrl,
      contactName: '',
      contactEmail: '',
      notes: clippedJob.notes,
      tags: clippedJob.tags,
      rating: 4,
      interviewRounds: []
    });
    setIsClippedImported(true);
    setTimeout(() => {
      setClippedJob(null);
      setIsClippedImported(false);
      onClose();
    }, 1200);
  };

  const appUrl = `${window.location.origin}${window.location.pathname}`;

  const bookmarkletSource = `
(function(){
  function meta(name){
    var el = document.querySelector('meta[property="'+name+'"]') || document.querySelector('meta[name="'+name+'"]');
    return el ? el.getAttribute('content') : '';
  }
  var job = null;
  try {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var items = Array.isArray(data) ? data : (data['@graph'] || [data]);
        for (var j = 0; j < items.length; j++) {
          var it = items[j];
          var type = it && it['@type'];
          if (type === 'JobPosting' || (Array.isArray(type) && type.indexOf('JobPosting') > -1)) {
            job = it;
            break;
          }
        }
      } catch (e) {}
      if (job) break;
    }
  } catch (e) {}

  var company = '', position = '', location = '', salary = '', description = '';
  if (job) {
    position = job.title || '';
    if (job.hiringOrganization) {
      company = typeof job.hiringOrganization === 'string' ? job.hiringOrganization : (job.hiringOrganization.name || '');
    }
    if (job.jobLocation) {
      var loc = Array.isArray(job.jobLocation) ? job.jobLocation[0] : job.jobLocation;
      if (loc && loc.address) {
        var a = loc.address;
        location = [a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(', ');
      }
    }
    if (job.baseSalary) {
      var bs = job.baseSalary.value || job.baseSalary;
      var cur = job.baseSalary.currency || '';
      if (bs && bs.minValue && bs.maxValue) salary = (cur + ' ' + bs.minValue + ' - ' + bs.maxValue).trim();
      else if (bs && bs.value) salary = (cur + ' ' + bs.value).trim();
    }
    description = (job.description || '').replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim().slice(0, 400);
  }
  if (!position) position = meta('og:title') || document.title || '';
  if (!company) company = meta('og:site_name') || '';
  if (!description) description = meta('og:description') || '';
  if (!company && position) {
    var m = position.match(/(.+?)\\s+(?:at|@|\\-|\\|)\\s+([^|]+)/i);
    if (m) { position = m[1].trim(); company = m[2].trim(); }
  }

  var payload = {
    company: company, position: position, location: location, salary: salary,
    notes: description, jobUrl: window.location.href, portalName: document.location.hostname
  };
  var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  window.open('${appUrl}?clip=' + encodeURIComponent(b64), '_blank');
})();
`.replace(/\s+/g, ' ').trim();

  const bookmarkletCode = `javascript:${bookmarkletSource}`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="min-h-screen bg-paper-dim flex items-start sm:items-center justify-center sm:p-4 sm:py-10">
      <div className="ledger-card w-full max-w-2xl rounded-none sm:rounded-3xl overflow-hidden shadow-2xl min-h-screen sm:min-h-0 sm:my-8 border-0 sm:border border-black/10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-ink via-plum to-ink text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-ledger/20 border border-ledger/30 rounded-2xl">
              <Globe className="w-6 h-6 text-ledger" />
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
          <div className="flex space-x-2 bg-slate-200/70 p-1 rounded-xl w-full max-w-2xl mx-auto">
            {clippedJob && (
              <button
                onClick={() => setActiveTab('clipped')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeTab === 'clipped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-brass" />
                <span>Auto-Clipped</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-ledger" />
              <span>Paste Portal URL</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-plum" />
              <span>Email Receipt Parser</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarklet')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'bookmarklet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-brass" />
              <span>Browser Clipper</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-5">
          
          {/* TAB 0: AUTO-CLIPPED */}
          {activeTab === 'clipped' && clippedJob && (
            <div className="space-y-4">
              <div className="bg-brass-soft/60 border border-brass/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-brass-soft text-brass border border-brass">
                    <Zap className="w-3 h-3 mr-1 text-brass" />
                    Captured from {clippedJob.portalName}
                  </span>
                  <span className="text-[11px] font-semibold text-brass">Ready to Track</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Company</span>
                    <span className="font-bold text-slate-900">{clippedJob.company}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Position Title</span>
                    <span className="font-bold text-slate-900">{clippedJob.position}</span>
                  </div>
                  {clippedJob.location && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Location</span>
                      <span className="font-semibold text-slate-800">{clippedJob.location}</span>
                    </div>
                  )}
                  {clippedJob.salary && (
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px]">Salary</span>
                      <span className="font-semibold text-slate-800">{clippedJob.salary}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleClippedImport}
                  disabled={isClippedImported}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                    isClippedImported
                      ? 'bg-brass text-white'
                      : 'bg-brass hover:bg-brass text-white active:bg-brass'
                  }`}
                >
                  {isClippedImported ? (
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
            </div>
          )}

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
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-ledger focus:ring-2 focus:ring-ledger/20 transition-all"
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
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-ledger-soft text-ledger border border-ledger">
                      <Sparkles className="w-3 h-3 mr-1 text-ledger" />
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
                      <span className="font-semibold text-brass">Applied</span>
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
                        ? 'bg-brass text-white'
                        : 'bg-ledger hover:bg-ledger text-white active:bg-ledger'
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
              {/* Gmail Auto-Scan */}
              <LockedGate
                unlocked={isLicensed}
                title="Gmail Auto-Scan is a licensed feature"
                description="Scan your inbox for application-confirmation emails and add them automatically — activate your license to unlock it."
                compact
              >
              <div className="p-4 bg-plum-soft/50 border border-plum/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-plum" />
                    <h4 className="text-xs font-bold text-plum">Scan Gmail Automatically</h4>
                  </div>
                  {isGoogleSignedIn() && (
                    <span className="text-[10px] font-semibold text-plum bg-white/60 px-2 py-0.5 rounded-full">Connected</span>
                  )}
                </div>
                <p className="text-xs text-plum/90">
                  Signs in with your Google account (read-only) and searches for application-confirmation emails from the last 120 days — nothing is sent anywhere except Google's own API, called directly from your browser.
                </p>
                <button
                  onClick={handleGmailScan}
                  disabled={isScanning}
                  className="px-4 py-2 bg-plum hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs disabled:opacity-60"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isScanning ? 'Scanning inbox...' : hasScanned ? 'Scan Again' : 'Scan My Inbox'}</span>
                </button>

                {scanError && (
                  <p className="text-[11px] text-stamp font-medium">{scanError}</p>
                )}

                {hasScanned && !isScanning && gmailCandidates.length === 0 && !scanError && (
                  <p className="text-[11px] text-plum/80">No likely application emails found in the last 120 days.</p>
                )}

                {gmailCandidates.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {gmailCandidates.map(candidate => {
                      const added = addedMessageIds.has(candidate.messageId);
                      return (
                        <div key={candidate.messageId} className="bg-white/80 border border-plum/30 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{candidate.parsed.position || 'Unknown role'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{candidate.parsed.company || 'Unknown company'} · {candidate.date ? new Date(candidate.date).toLocaleDateString() : ''}</p>
                          </div>
                          <button
                            onClick={() => handleAddGmailCandidate(candidate)}
                            disabled={added}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              added ? 'bg-brass-soft text-brass' : 'bg-ledger text-white hover:opacity-90'
                            }`}
                          >
                            {added ? 'Added ✓' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </LockedGate>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                <div className="h-px bg-slate-200 flex-1" />
                <span>or paste one manually</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Paste Confirmation Email / Portal Receipt
                </label>
                <textarea
                  rows={5}
                  value={emailText}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Paste email snippet, e.g.: 'Thank you for applying to Senior Product Designer at Figma. We have received your application...'"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition-all font-mono"
                />
              </div>

              {parsedEmailPreview && (
                <div className="bg-plum-soft/50 border border-plum/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-plum-soft text-plum border border-plum">
                      <Mail className="w-3 h-3 mr-1 text-plum" />
                      Email Parsed
                    </span>
                    <span className="text-[11px] font-semibold text-plum">Ready to Track</span>
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
                        ? 'bg-brass text-white'
                        : 'bg-plum hover:bg-plum text-white active:bg-plum'
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
              <div className="p-4 bg-brass-soft/60 border border-brass/80 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-5 h-5 text-brass" />
                  <h4 className="text-xs font-bold text-brass">1-Click Browser Toolbar Clipper</h4>
                </div>
                <p className="text-xs text-brass">
                  Save this bookmarklet to your browser's bookmarks bar. While viewing a job posting on LinkedIn, Indeed, Greenhouse, Lever, Workday, or most other boards, click it to scan the page for structured job data (title, company, location, salary) and open this app with it pre-filled — ready to add in one click.
                </p>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={copyBookmarklet}
                    className="px-4 py-2 bg-brass hover:bg-brass text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
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
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brass" />
              All portal data parsed client-side in browser memory
            </span>
            <span className="font-semibold text-slate-700">100% Private</span>
          </div>

        </div>
      </div>
    </div>
  );
};
