import React from 'react';
import { LicenseState } from '../utils/storage';
import { LoginForm } from './LoginForm';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (license: LicenseState) => void;
  onEnterDemoMode: () => void;
  onClose?: () => void;
}

/** Quick-access login overlay from the header badge. See /login (LoginPage) for the full-page version. */
export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess, onEnterDemoMode, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="my-8">
        <LoginForm onLoginSuccess={onLoginSuccess} onEnterDemoMode={onEnterDemoMode} onClose={onClose} />
      </div>
    </div>
  );
};
