import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LicenseState } from '../utils/storage';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  onLoginSuccess: (license: LicenseState) => void;
  onEnterDemoMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onEnterDemoMode }) => {
  const navigate = useNavigate();

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
