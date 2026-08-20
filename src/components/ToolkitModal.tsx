import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Sparkles, FileText, Mail, DollarSign, 
  CheckSquare, Key, RefreshCw, Send, BrainCircuit, Target, AlertCircle
} from 'lucide-react';
import { matchResumeToJobDescription, KeywordMatchResult } from '../utils/atsMatcher';
import { generateCoverLetter, generateInterviewPrep, generateNegotiationStrategy } from '../utils/aiAssistant';
import { getAISettings, saveAISettings } from '../utils/storage';
import { AICoverLetterOutput, AIInterviewQuestion } from '../types';

interface ToolkitModalProps {
  onClose: () => void;
  isLicensed: boolean;
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({ onClose, isLicensed }) => {
  const [activeTab, setActiveTab] = useState<'ats' | 'cover' | 'interview' | 'negotiate' | 'settings'>('ats');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. ATS Matcher State
  const [resumeText, setResumeText] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [matchResult, setMatchResult] = useState<KeywordMatchResult | null>(null);

  // 2. Cover Letter State
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [candidateNotes, setCandidateNotes] = useState('5 years React, TypeScript, backend APIs, distributed state');
  const [generatedLetter, setGeneratedLetter] = useState<AICoverLetterOutput | null>(null);
  const [loadingLetter, setLoadingLetter] = useState(false);

  // 3. Interview Prep State
  const [interviewQuestions, setInterviewQuestions] = useState<AIInterviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // 4. Negotiation State
  const [offerCompany, setOfferCompany] = useState('Acme Corp');
  const [offerRole, setOfferRole] = useState('Staff Engineer');
  const [targetSalary, setTargetSalary] = useState(175000);
  const [negotiationResult, setNegotiationResult] = useState<ReturnType<typeof generateNegotiationStrategy> | null>(null);

  // 5. Settings State (BYOK Gemini API)
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    const settings = getAISettings();
    if (settings.apiKey) setApiKey(settings.apiKey);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunMatch = () => {
    if (!resumeText.trim() || !jobDescText.trim()) return;
    setMatchResult(matchResumeToJobDescription(resumeText, jobDescText));
  };

  const handleGenerateLetter = async () => {
    setLoadingLetter(true);
    try {
      const res = await generateCoverLetter(
        { company: targetCompany, position: targetRole },
        candidateNotes
      );
      setGeneratedLetter(res);
    } finally {
      setLoadingLetter(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await generateInterviewPrep({ company: targetCompany, position: targetRole });
      setInterviewQuestions(res);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCalculateNegotiation = () => {
    const res = generateNegotiationStrategy(
      { company: offerCompany, position: offerRole },
      targetSalary
    );
    setNegotiationResult(res);
  };

  const handleSaveApiKey = () => {
    saveAISettings({ apiKey: apiKey.trim(), enabled: !!apiKey.trim(), model: 'gemini-1.5-flash' });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-paper rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-paper-dim/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-ledger/10 text-ledger">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-ink">Career Intelligence & Toolkit</h3>
              <p className="text-xs text-ink-soft">ATS Matcher, AI Cover Letters, Interview Preparation & Negotiation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ink/10 px-6 bg-paper-dim/20 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('ats')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ats' ? 'border-ledger text-ledger' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <Target className="w-4 h-4" />
            ATS Keyword Gap Matcher
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cover' ? 'border-ledger text-ledger' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            AI Cover Letter Builder
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'interview' ? 'border-ledger text-ledger' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Interview Loop Prep
          </button>
          <button
            onClick={() => setActiveTab('negotiate')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'negotiate' ? 'border-ledger text-ledger' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Offer Negotiation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'border-ledger text-ledger' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <Key className="w-4 h-4" />
            AI Settings (BYOK)
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. ATS MATCHER TAB */}
          {activeTab === 'ats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Your Resume Text</label>
                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume markdown or plain text here..."
                    className="w-full text-xs p-3 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Target Job Description</label>
                  <textarea
                    rows={8}
                    value={jobDescText}
                    onChange={(e) => setJobDescText(e.target.value)}
                    placeholder="Paste the job posting requirements & description..."
                    className="w-full text-xs p-3 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-ink-soft">
                  Client-side ATS scoring extracts frequency tokens & technical phrases without sending your data to any external server.
                </p>
                <button
                  onClick={handleRunMatch}
                  disabled={!resumeText.trim() || !jobDescText.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-ledger text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
                >
                  Calculate ATS Match Score
                </button>
              </div>

              {matchResult && (
                <div className="p-5 rounded-2xl bg-paper-dim/50 border border-ink/10 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-ink">ATS Match Evaluation</h4>
                      <p className="text-xs text-ink-soft">
                        {matchResult.matched.length} of {matchResult.jobKeywords.length} primary posting keywords identified in your resume.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-display font-extrabold ${
                        matchResult.matchPercent >= 70 ? 'text-ledger' :
                        matchResult.matchPercent >= 45 ? 'text-brass' : 'text-stamp'
                      }`}>
                        {matchResult.matchPercent}%
                      </span>
                      <p className="text-[10px] uppercase font-semibold text-ink-soft">Match Density</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h5 className="text-xs font-bold text-ledger mb-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Matched Keywords ({matchResult.matched.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matched.map((kw) => (
                          <span key={kw} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ledger-soft text-ledger border border-ledger/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stamp mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing / Gap Keywords ({matchResult.missing.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missing.map((kw) => (
                          <span key={kw} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stamp-soft text-stamp border border-stamp/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. COVER LETTER TAB */}
          {activeTab === 'cover' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Target Company</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Target Position</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Your Key Highlights / Skills to Emphasize</label>
                <textarea
                  rows={3}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="e.g. 5+ years building scalable React systems, led design system team, reduced bundle size by 40%..."
                  className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateLetter}
                  disabled={loadingLetter}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-ledger text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingLetter ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate Tailored Cover Letter
                </button>
              </div>

              {generatedLetter && (
                <div className="mt-4 p-5 rounded-2xl bg-paper-dim/40 border border-ink/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Subject: {generatedLetter.subject}</span>
                    <button
                      onClick={() => handleCopy(generatedLetter.fullText, 'cover-full')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ledger hover:underline cursor-pointer"
                    >
                      {copiedId === 'cover-full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === 'cover-full' ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                  <div className="text-xs text-ink-soft whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-ink/10">
                    {generatedLetter.fullText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. INTERVIEW PREP TAB */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">Interview Simulation & Frameworks</h4>
                  <p className="text-xs text-ink-soft">Targeted questions and response frameworks tailored to your role</p>
                </div>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loadingQuestions}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-ledger text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingQuestions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                  Generate 5 Interview Questions
                </button>
              </div>

              <div className="space-y-3 mt-4">
                {(interviewQuestions.length > 0 ? interviewQuestions : [
                  {
                    question: `How would you architect a distributed state management flow in React 19 for real-time multiplayer editing?`,
                    category: 'technical' as const,
                    tips: `Walk through optimistic updates, conflict resolution (CRDTs), websocket latency, and memory cleanup.`,
                    suggestedFramework: `Requirements -> System Boundaries -> Data Flow -> Trade-offs`,
                  },
                  {
                    question: `Tell me about a time you identified technical debt that was slowing down product velocity. How did you advocate for refactoring it?`,
                    category: 'behavioral' as const,
                    tips: `Anchor on business metrics: how developer velocity was impacted and the ROI of the refactoring initiative.`,
                    suggestedFramework: `STAR (Situation, Task, Action, Result)`,
                  },
                ]).map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-paper-dim/40 border border-ink/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-plum-soft text-plum">
                        {q.category}
                      </span>
                      <button
                        onClick={() => handleCopy(q.question, `q-${idx}`)}
                        className="text-ink-soft hover:text-ink text-xs cursor-pointer p-1"
                      >
                        {copiedId === `q-${idx}` ? <Check className="w-3.5 h-3.5 text-ledger" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-ink">{q.question}</p>
                    <div className="text-[11px] text-ink-soft bg-white p-2.5 rounded-lg border border-ink/5 space-y-1">
                      <p><span className="font-semibold text-ink">Strategy:</span> {q.tips}</p>
                      <p><span className="font-semibold text-ledger">Framework:</span> {q.suggestedFramework}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. OFFER NEGOTIATION TAB */}
          {activeTab === 'negotiate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Company</label>
                  <input
                    type="text"
                    value={offerCompany}
                    onChange={(e) => setOfferCompany(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Role Title</label>
                  <input
                    type="text"
                    value={offerRole}
                    onChange={(e) => setOfferRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Target Base Comp ($)</label>
                  <input
                    type="number"
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCalculateNegotiation}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-ledger text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Generate Counter-Offer Strategy & Email
                </button>
              </div>

              {negotiationResult && (
                <div className="mt-4 p-5 rounded-2xl bg-paper-dim/40 border border-ink/10 space-y-4 animate-in fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Counter-Offer Email Draft</h4>
                    <div className="relative">
                      <pre className="text-xs text-ink-soft whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-ink/10 font-sans">
                        {negotiationResult.script}
                      </pre>
                      <button
                        onClick={() => handleCopy(negotiationResult.script, 'neg-script')}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-paper-dim hover:bg-paper border border-ink/10 text-xs font-medium cursor-pointer"
                      >
                        {copiedId === 'neg-script' ? <Check className="w-3.5 h-3.5 text-ledger" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-ink mb-1.5">Negotiation Best Practices</h5>
                    <ul className="space-y-1 text-xs text-ink-soft list-disc list-inside">
                      {negotiationResult.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. AI SETTINGS (BYOK) TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h4 className="text-sm font-bold text-ink">Bring Your Own Key (BYOK)</h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  Provide your own Google Gemini API key to unlock unlimited, direct AI generation for custom cover letters, interview loops, and resume feedback.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-ledger-soft/50 border border-ledger/20 text-xs text-ink space-y-1.5">
                <p className="font-semibold text-ledger flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> 100% Client-Side Privacy Guarantee
                </p>
                <p className="text-ink-soft text-[11px]">
                  Your API key is saved exclusively in your browser's local storage and communicated strictly between your browser and Google's Generative AI API endpoints.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Google Gemini API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-ink/10 bg-paper-dim/30 text-ink focus:border-ledger"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-ink text-paper hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
                {apiKeySaved && (
                  <p className="text-xs text-ledger font-semibold mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> API Key saved successfully.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
