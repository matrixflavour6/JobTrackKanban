import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Briefcase, 
  X,
  AlertCircle
} from 'lucide-react';
import { LicenseState, saveLicenseState } from '../utils/storage';
import { verifyGumroadLicense } from '../utils/gumroadApi';
import { signInWithGoogle } from '../utils/googleAuth';

interface LoginFormProps {
  onLoginSuccess: (license: LicenseState) => void;
  onEnterDemoMode: () => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onEnterDemoMode, onClose }) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isGoogleLinking, setIsGoogleLinking] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);

  const handleGoogleConnect = async () => {
    setErrorMessage('');
    setIsGoogleLinking(true);
    try {
      const profile = await signInWithGoogle();
      setUserEmailInput(profile.email);
      setUserNameInput(profile.name);
      setGoogleLinked(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not connect your Google account.');
    } finally {
      setIsGoogleLinking(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const key = licenseKeyInput.trim();
    if (!key) {
      setErrorMessage('Please enter your license key (found in your receipt email).');
      return;
    }
    if (key.length < 5) {
      setErrorMessage('License key format appears invalid (e.g., GUM-8921-X391 or GUM-PRO-ACCESS).');
      return;
    }

    setIsActivating(true);
    const verification = await verifyGumroadLicense(key, 'job-tracker-kanban');

    if (!verification.success) {
      setIsActivating(false);
      setErrorMessage(verification.message || 'Invalid or refunded Gumroad license key.');
      return;
    }

    const license: LicenseState = {
      isAuthenticated: true,
      licenseKey: key,
      userName: userNameInput.trim() || verification.name || 'Pro Member',
      userEmail: userEmailInput.trim() || verification.email || 'member@jobtrack.app',
      activatedAt: new Date().toISOString(),
      isGuest: false,
      googleLinked
    };

    saveLicenseState(license);
    setIsActivating(false);
    onLoginSuccess(license);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-ink/10 bg-paper/95 backdrop-blur-2xl">
      {/* Header Banner */}
      <div className="bg-ink text-paper p-7 relative text-center">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-ledger text-white flex items-center justify-center shadow-lg">
          <Briefcase className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-display font-bold tracking-tight">JobTrack <span className="text-ledger">Pro</span></h1>
        <p className="text-xs text-paper/70 mt-1 max-w-sm mx-auto">
          Activate your lifetime license or connect with Google
        </p>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brass-soft text-brass text-[11px] font-semibold mt-3 border border-brass/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lifetime Access & Local-First Sovereignty</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Google Sign-In Option */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wide">Google Account (Optional)</span>
            {googleLinked && (
              <span className="text-[10px] text-ledger font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleGoogleConnect}
            disabled={isGoogleLinking || googleLinked}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border ${
              googleLinked
                ? 'bg-ledger-soft border-ledger/40 text-ledger'
                : 'bg-paper border-ink/15 text-ink hover:bg-paper-dim shadow-xs'
            }`}
          >
            {googleLinked ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Connected as {userEmailInput || userNameInput}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.2 3 9.5 7.4 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.4 40.6 16.1 45 24 45z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2C40.9 36 44 30.6 44 24c0-1.4-.1-2.8-.4-3.5z"/>
                </svg>
                <span>{isGoogleLinking ? 'Connecting Google...' : 'Link Google for Drive Backup'}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-ink-soft/60 uppercase font-semibold">
          <div className="h-px bg-ink/10 flex-1" />
          <span>License Key Activation</span>
          <div className="h-px bg-ink/10 flex-1" />
        </div>

        <form onSubmit={handleActivateLicense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              License Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="e.g. GUM-9821-4820-XXXX or GUM-PRO-ACCESS"
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-paper-dim border border-ink/10 rounded-xl focus:bg-white focus:outline-hidden focus:border-ledger focus:ring-2 focus:ring-ledger/20 transition-all font-mono text-ink"
              />
              <Key className="w-4 h-4 text-ink-soft/60 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-ink-soft/80 mt-1">
              Found in your Gumroad purchase receipt email, or use passkey <span className="font-mono text-ledger font-semibold">GUM-PRO-ACCESS</span>.
            </p>
          </div>

          {googleLinked ? (
            <div className="px-3 py-2 bg-ledger-soft border border-ledger/40 rounded-xl text-xs text-ink flex items-center justify-between">
              <span className="font-medium">{userNameInput}</span>
              <span className="text-ink-soft/80">{userEmailInput}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Name (Optional)</label>
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 text-xs bg-paper-dim border border-ink/10 rounded-xl text-ink focus:bg-white focus:border-ledger"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 text-xs bg-paper-dim border border-ink/10 rounded-xl text-ink focus:bg-white focus:border-ledger"
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-stamp-soft border border-stamp/30 rounded-xl text-xs text-stamp font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-stamp" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isActivating}
            className="w-full py-3 bg-ledger hover:opacity-90 text-white font-semibold text-xs rounded-xl glow-ledger transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isActivating ? (
              <span>Verifying License...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Activate License & Unlock Full Edition</span>
              </>
            )}
          </button>
        </form>

        {/* Demo / Guest Option */}
        <div className="pt-3 border-t border-ink/8 text-center space-y-1.5">
          <button
            type="button"
            onClick={onEnterDemoMode}
            className="w-full py-2.5 px-4 bg-paper-dim hover:bg-ink/5 text-ink-soft font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-ink/8"
          >
            <span>Continue as Guest (Limited Preview)</span>
          </button>
        </div>

        {/* Purchase Link */}
        <div className="pt-3 border-t border-ink/8 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-ink-soft">
            <ShoppingBag className="w-4 h-4 text-plum" />
            <span>Need a license?</span>
          </div>
          <a
            href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-plum hover:opacity-80 hover:underline flex items-center"
          >
            <span>Get Lifetime License ($8)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
