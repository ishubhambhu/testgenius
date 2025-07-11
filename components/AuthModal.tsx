import React, { useState } from 'react';
import Button from './Button';
import { XIcon, GeminiIcon } from './Icons';
import { AuthService } from '../services/authService';
import FeedbackModal from './FeedbackModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setShowForgotPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isPasswordValid = (pwd: string) => {
    return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (showForgotPassword) {
        await AuthService.resetPassword(email);
        setError(null);
        setFeedback('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else if (mode === 'signup') {
        if (!isPasswordValid(password)) {
          setError('Password must include at least one uppercase letter, one lowercase letter, and one number.');
          setIsLoading(false);
          return;
        }
        await AuthService.signUp(email, password, name);
        setFeedback('Account created! Successfully signed in.');
        handleClose();
      } else {
        await AuthService.signIn(email, password);
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await AuthService.signInWithGoogle();
      // The redirect will handle the rest
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {showForgotPassword ? 'Reset Password' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <Button onClick={handleClose} variant="ghost" size="icon">
              <XIcon className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-0"
                placeholder="Enter your email"
                required
              />
            </div>

            {!showForgotPassword && (
              <>
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-0"
                      placeholder="Enter your name"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-0"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {showForgotPassword ? 'Send Reset Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            {!showForgotPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  isLoading={isLoading}
                  leftIcon={<GeminiIcon className="w-5 h-5" />}
                >
                  Google
                </Button>
              </>
            )}

            <div className="text-center space-y-2">
              {!showForgotPassword && mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              )}

              {showForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Back to sign in
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-primary hover:underline"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      <FeedbackModal
        isOpen={!!feedback}
        message={feedback || ''}
        onClose={() => setFeedback(null)}
      />
    </>
  );
};