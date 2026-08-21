import React from 'react';
import { ShieldCheck, Database, Zap, Lock, Sparkles, Heart } from 'lucide-react';

interface AppFooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = () => {
  return (
    <footer className="w-full border-t border-ink/10 bg-paper-dim/80 backdrop-blur-md py-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-ink text-paper flex items-center justify-center font-bold text-xs shadow-sm">
                JT
              </div>
              <span className="font-display font-bold text-base text-ink tracking-tight">JobTrack Pro</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-ledger/10 text-ledger border border-ledger/20">
                Local-First
              </span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed max-w-md">
              A private, distraction-free career tracker engineered with local-first storage, real-time analytics, and intelligent ATS gap scoring. Your data stays in your browser.
            </p>
            <div className="flex items-center gap-4 mt-4 text-[11px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Lock className="w-3.5 h-3.5 text-ledger" />
                Zero Tracking
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Database className="w-3.5 h-3.5 text-ledger" />
                IndexedDB Persistent
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <Zap className="w-3.5 h-3.5 text-ledger" />
                100% Offline Ready
              </span>
            </div>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Core Toolkit</h4>
            <ul className="space-y-2 text-xs text-ink-soft">
              <li className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-default">
                <Sparkles className="w-3 h-3 text-ledger" />
                ATS Keyword Gap Matcher
              </li>
              <li className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-default">
                <Sparkles className="w-3 h-3 text-ledger" />
                Offer Decision Matrix
              </li>
              <li className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-default">
                <Sparkles className="w-3 h-3 text-ledger" />
                Universal Portal Importer
              </li>
              <li className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-default">
                <Sparkles className="w-3 h-3 text-ledger" />
                Calendar (.ics) Sync
              </li>
            </ul>
          </div>

          {/* Privacy & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Data Promise</h4>
            <p className="text-xs text-ink-soft leading-relaxed mb-3">
              No analytics servers, no third-party tracking scripts, and no credential mining. Everything is saved strictly to your local device and private Google Drive.
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] text-ledger font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Client-Side Sovereign
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-ink/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} JobTrack Pro. Crafted for focused job seekers.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-stamp fill-stamp" /> for career mobility
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
