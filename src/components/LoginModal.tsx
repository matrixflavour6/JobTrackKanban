import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Briefcase, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { LicenseState, saveLicenseState } from '../utils/storage';
import { verifyGumroadLicense } from '../utils/gumroadApi';
import { signInWithGoogle, isGoogleConfigured } from '../utils/googleAuth';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (license: LicenseState) => void;
  onEnterDemoMode: () => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onEnterDemoMode,
  onClose
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isGoogleLinking, setIsGoogleLinking] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);

  if (!isOpen) return null;

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
      setErrorMessage('Please enter your valid Gumroad license key.');
      return;
    }
    if (key.length < 5) {
      setErrorMessage('License key format appears invalid (e.g., GUM-8921-X391).');
      return;
    }

    setIsActivating(true);
    
    // Call Gumroad CORS API directly, scoped to our product permalink
    const verification = await verifyGumroadLicense(key, 'job-tracker-kanban');

    if (!verification.success) {
      setIsActivating(false);
      setErrorMessage(verification.message || 'Invalid or refunded Gumroad license key.');
      return;
    }

    const license: LicenseState = {
      isAuthenticated: true,
      licenseKey: key,
      userName: userNameInput.trim() || verification.name || 'Valued Buyer',
      userEmail: userEmailInput.trim() || verification.email || 'buyer@gumroad.com',
      activatedAt: new Date().toISOString(),
      isGuest: false,
      googleLinked
    };

    saveLicenseState(license);
    setIsActivating(false);
    onLoginSuccess(license);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="ledger-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-8 border border-white/20 bg-white/95">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white p-7 relative text-center">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-ledger to-indigo-500 flex items-center justify-center shadow-lg border border-white/20">
            <Briefcase className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">JobTrack <span className="text-ledger">Kanban Pro</span></h1>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            Google Account + One-Time Gumroad License
          </p>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-[11px] font-semibold mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign in, then activate your license</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Google Sign-In */}
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-2">Step 1 — Sign in</p>
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={isGoogleLinking || googleLinked}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border ${
                googleLinked
                  ? 'bg-ledger-soft border-ledger text-ledger'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
              }`}
            >
              {googleLinked ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connected as {userEmailInput}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.2 3 9.5 7.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.4 40.6 16.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2C40.9 36 44 30.6 44 24c0-1.4-.1-2.8-.4-3.5z"/></svg>
                  <span>{isGoogleLinking ? 'Connecting...' : 'Continue with Google'}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Links your Google account for Drive backup and Gmail application scanning — everything still stays local except what you explicitly sync.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-semibold">
            <div className="h-px bg-slate-200 flex-1" />
            <span>Step 2 — activate your license</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <form onSubmit={handleActivateLicense} className="space-y-4">
            <p className="text-[11px] text-slate-500 -mt-1">
              Google Sign-In alone can't confirm a purchase — Gumroad doesn't share that link with third-party apps — so your license key is still what unlocks the full edition. This just ties that license to the Google account above.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gumroad License Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  placeholder={googleLinked ? 'e.g. GUM-9821-4820-XXXX' : 'Connect Google above first'}
                  disabled={!googleLinked}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-ledger focus:ring-2 focus:ring-ledger/20 transition-all font-mono text-slate-900 disabled:opacity-50"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Found in your Gumroad purchase receipt email.
              </p>
            </div>

            {googleLinked ? (
              <div className="px-3 py-2 bg-ledger-soft border border-ledger/40 rounded-xl text-xs text-ink flex items-center justify-between">
                <span className="font-medium">{userNameInput}</span>
                <span className="text-ink-soft/80">{userEmailInput}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={userNameInput}
                    placeholder="Connect Google above"
                    disabled
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={userEmailInput}
                    placeholder="Connect Google above"
                    disabled
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-stamp-soft border border-stamp rounded-xl text-xs text-stamp font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-stamp" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isActivating || !googleLinked}
              className="w-full py-3 bg-ledger hover:bg-ledger active:bg-ledger text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <span>Verifying Key...</span>
              ) : !googleLinked ? (
                <span>Connect Google First</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Activate License & Unlock Full Edition</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Suite Option */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <button
              type="button"
              onClick={onEnterDemoMode}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-black/5"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Explore Demo Suite (Limited Read-Only Preview)</span>
            </button>
            <p className="text-[10px] text-slate-400">
              Demo Suite lets you preview Kanban columns, analytics & sample jobs without editing.
            </p>
          </div>

          {/* Purchase Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <ShoppingBag className="w-4 h-4 text-pink-600" />
              <span>Don't have a license?</span>
            </div>
            <a
              href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-pink-600 hover:text-pink-700 hover:underline flex items-center"
            >
              <span>Get Lifetime License ($8)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
