import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

interface LockedGateProps {
  unlocked: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  /** Compact renders a smaller inline card (for use inside modals/tabs); default is a full-page-style card. */
  compact?: boolean;
}

export const LockedGate: React.FC<LockedGateProps> = ({ unlocked, title, description, children, compact }) => {
  const navigate = useNavigate();

  if (unlocked) return <>{children}</>;

  return (
    <div className={`ledger-card rounded-md text-center mx-auto ${compact ? 'p-6 max-w-md' : 'p-10 max-w-lg mt-8'}`}>
      <div className={`mx-auto mb-4 rounded-full bg-ledger-soft flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-12 h-12'}`}>
        <Lock className={`text-ledger ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
      </div>
      <h3 className="font-display font-semibold text-ink text-base mb-1.5">{title}</h3>
      <p className="text-sm text-ink-soft/80 mb-5">{description}</p>
      <button
        onClick={() => navigate('/login')}
        className="px-5 py-2.5 bg-ledger hover:opacity-90 glow-ledger text-white text-sm font-semibold rounded-xl cursor-pointer inline-flex items-center gap-2"
      >
        Activate License — $8
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
