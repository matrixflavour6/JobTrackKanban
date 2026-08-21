import React, { useMemo, useState } from 'react';
import { User, ShieldCheck, LogOut, Mail, HardDrive, Briefcase, Award, Clock, Trash2 } from 'lucide-react';
import { JobApplication } from '../types';
import { LicenseState, clearLicenseState } from '../utils/storage';
import { isGoogleSignedIn, getGoogleProfile, signOutGoogle } from '../utils/googleAuth';

interface ProfilePageProps {
  applications: JobApplication[];
  licenseState: LicenseState;
  onLicenseChange: (license: LicenseState) => void;
  onNavigateLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ applications, licenseState, onLicenseChange, onNavigateLogin }) => {
  const [, forceRerender] = useState(0);
  const googleProfile = getGoogleProfile();
  const googleConnected = isGoogleSignedIn();

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter(a => a.stage !== 'wishlist').length;
    const interviews = applications.filter(a => (a.interviewRounds?.length || 0) >= 1).length;
    const offers = applications.filter(a => a.stage === 'offer').length;
    const oldestDate = applications.reduce((oldest: string | null, a) => {
      if (!a.dateApplied) return oldest;
      if (!oldest || a.dateApplied < oldest) return a.dateApplied;
      return oldest;
    }, null);
    return { total, applied, interviews, offers, oldestDate };
  }, [applications]);

  const handleGoogleDisconnect = () => {
    signOutGoogle();
    forceRerender(n => n + 1);
  };

  const handleLicenseSignOut = () => {
    clearLicenseState();
    onLicenseChange({
      isAuthenticated: false,
      licenseKey: '',
      userName: '',
      userEmail: '',
      activatedAt: '',
      isGuest: true,
      googleLinked: false,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="font-display font-semibold text-ink text-xl flex items-center">
          <User className="w-5 h-5 mr-2 text-ledger" />
          Profile
        </h2>
        <p className="text-xs text-ink-soft/80 mt-0.5">Your account, connections, and job-search snapshot — all computed locally.</p>
      </div>

      {/* Account / License Card */}
      <div className="ledger-card rounded-md p-5">
        <h3 className="font-display font-semibold text-ink text-sm mb-3">License</h3>
        {licenseState.isAuthenticated && !licenseState.isGuest ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="ledger-stamp text-brass bg-brass-soft">Licensed</div>
                <span className="text-xs text-ink font-medium">{licenseState.userName}</span>
              </div>
              <button
                onClick={handleLicenseSignOut}
                className="text-[11px] text-ink-soft hover:text-stamp flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
            <div className="text-[11px] text-ink-soft/80 font-ledger-mono space-y-0.5">
              <p>{licenseState.userEmail}</p>
              <p>Activated {licenseState.activatedAt ? new Date(licenseState.activatedAt).toLocaleDateString() : '—'}</p>
              <p className="truncate">Key: {licenseState.licenseKey.slice(0, 4)}••••••••</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-soft/80">You're in Demo mode — activate a license to unlock the full edition.</p>
            <button
              onClick={onNavigateLogin}
              className="px-3 py-1.5 bg-ledger text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer shrink-0 ml-3"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Google Connection Card */}
      <div className="ledger-card rounded-md p-5">
        <h3 className="font-display font-semibold text-ink text-sm mb-3 flex items-center">
          <Mail className="w-4 h-4 mr-1.5 text-plum" />
          Google Account
        </h3>
        {googleConnected && googleProfile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {googleProfile.picture && (
                <img src={googleProfile.picture} alt="" className="w-8 h-8 rounded-full border border-ink/10" />
              )}
              <div>
                <p className="text-xs font-medium text-ink">{googleProfile.name}</p>
                <p className="text-[11px] text-ink-soft/80">{googleProfile.email}</p>
              </div>
            </div>
            <button
              onClick={handleGoogleDisconnect}
              className="text-[11px] text-ink-soft hover:text-stamp flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-soft/80">Not connected. Connect from Sign In to enable Drive backup and Gmail scanning.</p>
            <button
              onClick={onNavigateLogin}
              className="px-3 py-1.5 bg-paper-dim text-ink text-xs font-semibold rounded-lg border border-ink/10 hover:bg-white cursor-pointer shrink-0 ml-3"
            >
              Connect
            </button>
          </div>
        )}
        <p className="text-[11px] text-ink-soft/60 mt-3 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" />
          Drive access is scoped to files this app creates — never your full Drive.
        </p>
      </div>

      {/* Snapshot Stats */}
      <div className="ledger-card rounded-md p-5">
        <h3 className="font-display font-semibold text-ink text-sm mb-4">Your Job Search Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-ink-soft/70 text-[11px] mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Total Applied
            </div>
            <p className="font-display font-semibold text-ink text-xl">{stats.applied}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-ink-soft/70 text-[11px] mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Interviews
            </div>
            <p className="font-display font-semibold text-plum text-xl">{stats.interviews}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-ink-soft/70 text-[11px] mb-1">
              <Award className="w-3.5 h-3.5" /> Offers
            </div>
            <p className="font-display font-semibold text-brass text-xl">{stats.offers}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-ink-soft/70 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5" /> Tracking Since
            </div>
            <p className="font-display font-semibold text-ink text-sm">
              {stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-ink-soft/60 text-center flex items-center justify-center gap-1.5">
        <Trash2 className="w-3 h-3" />
        Signing out of your license or Google account never deletes your board data — that stays in this browser either way.
      </p>
    </div>
  );
};
