import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { LicenseState } from '../utils/storage';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  licenseState: LicenseState;
  onLoginSuccess: (license: LicenseState) => void;
  onEnterDemoMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ licenseState, onLoginSuccess, onEnterDemoMode }) => {
  const navigate = useNavigate();

  // Already fully signed in — no reason to show a blank activation form again.
  if (licenseState.isAuthenticated && !licenseState.isGuest) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="ledger-card w-full max-w-sm rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-ledger-soft flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-ledger" />
          </div>
          <h1 className="font-display font-semibold text-ink text-lg mb-1">You're already signed in</h1>
          <p className="text-xs text-ink-soft/80 mb-5">{licenseState.userEmail}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/board')}
              className="w-full py-2.5 bg-ledger hover:opacity-90 glow-ledger text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Go to Board
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-2.5 bg-paper-dim hover:bg-ink/5 text-ink text-xs font-semibold rounded-xl border border-ink/10 cursor-pointer"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 py-10">
      <LoginForm
        onLoginSuccess={(license) => {
          onLoginSuccess(license);
          navigate('/board');
        }}
        onEnterDemoMode={() => {
          onEnterDemoMode();
          navigate('/board');
        }}
      />
    </div>
  );
};
