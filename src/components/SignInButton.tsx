import React, { useState } from 'react';
import { LogIn, Cloud, CloudOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SignIn from './SignIn';

const SignInButton: React.FC = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm" style={{ backgroundColor: `${currentTheme.colors.status.success}20` }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Cloud className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-sm font-medium text-green-700 hidden sm:inline">Synced to cloud</span>
        <span className="text-sm font-medium text-green-700 sm:hidden">Synced</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <button
          onClick={() => setShowSignIn(true)}
          className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border min-h-[44px]"
          style={{ 
            backgroundColor: `${currentTheme.colors.background.card}f0`,
            borderColor: currentTheme.colors.border.light,
            color: currentTheme.colors.text.secondary
          }}
        >
          <CloudOff className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Sign in to sync</span>
          <span className="text-sm font-medium sm:hidden">Sign in</span>
        </button>
      </div>
      
      {showSignIn && (
        <SignIn onClose={() => setShowSignIn(false)} />
      )}
    </>
  );
};

export default SignInButton;
