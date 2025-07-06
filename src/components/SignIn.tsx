import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SignInProps {
  onClose?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const SignIn: React.FC<SignInProps> = ({ onClose }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { currentTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        setSuccess('Signed in successfully! Your data will be synced to the cloud.');
        setTimeout(() => onClose?.(), 1500);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        setSuccess('Account created successfully! Your data will be synced to the cloud.');
        setTimeout(() => onClose?.(), 1500);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      setSuccess('Signed in with Google successfully! Your data will be synced to the cloud.');
      setTimeout(() => onClose?.(), 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Sign In';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset': return 'Send Reset Email';
      default: return 'Sign In';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl border backdrop-blur-xl relative overflow-hidden animate-modal-slide-in ${currentTheme.colors.background.panel} ${currentTheme.colors.border.light}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${currentTheme.colors.primary.from} ${currentTheme.colors.secondary.from}`} />
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div 
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative bg-gradient-to-br ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to}`}
              style={{
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm"></div>
              <Chrome className="w-8 h-8 text-white relative z-10" />
            </div>
            <h1 
              className={`text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent`}
              style={{ 
                backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
              }}
            >
              <span className={`bg-gradient-to-r ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to} bg-clip-text text-transparent`}>
                {getTitle()}
              </span>
            </h1>
            <p className={`text-sm opacity-70 leading-relaxed ${currentTheme.colors.text.secondary}`}>
              {mode === 'signin' && 'Sign in to sync your dev notes across devices'}
              {mode === 'signup' && 'Create your account to sync your notes across devices'}
              {mode === 'reset' && 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className={`block text-sm font-medium ${currentTheme.colors.text.primary}`}>
                  Display Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 ${currentTheme.colors.text.muted}`} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${currentTheme.colors.background.card} ${currentTheme.colors.border.light} ${currentTheme.colors.text.primary}`}
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className={`block text-sm font-medium ${currentTheme.colors.text.primary}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 ${currentTheme.colors.text.muted}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${currentTheme.colors.background.card} ${currentTheme.colors.border.light} ${currentTheme.colors.text.primary}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <label className={`block text-sm font-medium ${currentTheme.colors.text.primary}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 ${currentTheme.colors.text.muted}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${currentTheme.colors.background.card} ${currentTheme.colors.border.light} ${currentTheme.colors.text.primary}`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors ${currentTheme.colors.text.muted}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl bg-gradient-to-r ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  getButtonText()
                )}
              </button>
            </div>
          </form>

          {/* Google Sign In */}
          {mode !== 'reset' && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className={`px-4 text-xs font-medium ${currentTheme.colors.text.muted}`}>
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border flex items-center justify-center gap-3 shadow-sm hover:shadow-md ${currentTheme.colors.background.card} ${currentTheme.colors.border.light} ${currentTheme.colors.text.primary}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center">
            {mode === 'signin' && (
              <div className="space-y-3">
                <button
                  onClick={() => setMode('reset')}
                  className={`text-sm font-medium hover:underline transition-colors ${currentTheme.colors.primary.text}`}
                >
                  Forgot your password?
                </button>
                <div className="text-sm">
                  <span className={currentTheme.colors.text.muted}>Don't have an account? </span>
                  <button
                    onClick={() => setMode('signup')}
                    className={`font-medium hover:underline transition-colors ${currentTheme.colors.primary.text}`}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div className="text-sm">
                <span className={currentTheme.colors.text.muted}>Already have an account? </span>
                <button
                  onClick={() => setMode('signin')}
                  className={`font-medium hover:underline transition-colors ${currentTheme.colors.primary.text}`}
                >
                  Sign in
                </button>
              </div>
            )}
            {mode === 'reset' && (
              <div className="text-sm">
                <span className={currentTheme.colors.text.muted}>Remember your password? </span>
                <button
                  onClick={() => setMode('signin')}
                  className={`font-medium hover:underline transition-colors ${currentTheme.colors.primary.text}`}
                >
                  Sign in
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:bg-gray-100 z-20 ${currentTheme.colors.text.muted}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
