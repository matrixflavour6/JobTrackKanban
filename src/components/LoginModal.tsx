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

  if (!isOpen) return null;

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
      isGuest: false
    };

    saveLicenseState(license);
    setIsActivating(false);
    onLoginSuccess(license);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="apple-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-8 border border-white/20 bg-white/95">
        
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

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border border-white/20">
            <Briefcase className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">JobTrack <span className="text-blue-400">Kanban Pro</span></h1>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            Commercial Edition • One-Time Purchase on Gumroad
          </p>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gumroad Commercial License Required</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleActivateLicense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gumroad License Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  placeholder="e.g. GUM-9821-4820-XXXX"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-slate-900"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Found in your Gumroad purchase receipt email.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all text-slate-900"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isActivating ? (
                <span>Verifying Key...</span>
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
