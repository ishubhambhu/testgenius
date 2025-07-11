import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../constants';
import { MortarBoardIcon, EyeIcon, EyeSlashIcon, ElsaAvatarIcon } from './Icons';
import Button from './Button';
import { AuthService } from '../services/authService';

interface WelcomeScreenProps {
  onAuthSuccess: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'One number', test: (pwd) => /\d/.test(pwd) },
  { label: 'One special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  const metRequirements = passwordRequirements.filter(req => req.test(password)).length;
  
  if (metRequirements === 0) return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
  if (metRequirements <= 2) return { score: 20, label: 'Weak', color: 'bg-red-400' };
  if (metRequirements <= 3) return { score: 40, label: 'Fair', color: 'bg-yellow-500' };
  if (metRequirements <= 4) return { score: 70, label: 'Good', color: 'bg-blue-500' };
  return { score: 100, label: 'Strong', color: 'bg-green-500' };
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOpenAuth = (authMode: 'signin' | 'signup') => {
    setMode(authMode);
    setShowAuthModal(true);
    setShowForgotPassword(false);
    setError(null);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setShowForgotPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (showForgotPassword) {
        await AuthService.resetPassword(email);
        setError(null);
        alert('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        await AuthService.signUp(email, password, name);
        alert('Account created! Successfully signed in.');
        handleCloseAuth();
        onAuthSuccess();
      } else {
        await AuthService.signIn(email, password);
        handleCloseAuth();
        onAuthSuccess();
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

  return (
    <>
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, 
              hsl(var(--background)) 0%, 
              hsl(var(--secondary)) 25%, 
              hsl(var(--background)) 50%, 
              hsl(var(--accent)) 75%, 
              hsl(var(--background)) 100%
            )
          `,
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Powered by Elsa - Bottom Left */}
        <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-lg">
          <ElsaAvatarIcon className="w-8 h-8" />
          <span className="text-sm font-medium text-muted-foreground">Powered by Elsa</span>
        </div>

        <div className="w-full max-w-6xl flex items-center justify-between relative z-10">
          {/* Left side - Welcome message (Desktop) / Full content (Mobile) */}
          <div className="flex flex-col items-center lg:items-start justify-center flex-1 lg:pr-12">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center bg-card shadow-lg">
                <MortarBoardIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="ml-3">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500" style={{ fontSize: '2.5rem', lineHeight: '4.25rem' }}>
                  {APP_NAME}
                </h1>
              </div>
            </div>

            {/* Desktop logo and welcome */}
            <div className="hidden lg:flex items-center space-x-4 mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center bg-card/80 backdrop-blur-sm shadow-2xl">
                <MortarBoardIcon className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome to
                </h1>
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                  {APP_NAME}!
                </h2>
              </div>
            </div>

            {/* Mobile welcome text */}
            <div className="lg:hidden text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome!</h2>
              <p className="text-muted-foreground">
                Join TestGenius to start creating intelligent tests
              </p>
            </div>
            
            {/* Desktop description */}
            <p className="hidden lg:block text-xl text-muted-foreground max-w-md leading-relaxed mb-8">
              Create intelligent tests from documents, syllabus, or topics with AI-powered question generation and instant feedback.
            </p>
            
            {/* Feature points */}
            <div className="grid grid-cols-1 gap-4 max-w-md w-full mb-8">
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">AI-powered question generation</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Multiple input formats supported</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">Instant feedback and explanations</span>
              </div>
            </div>

            {/* Mobile auth buttons - Full width with proper spacing */}
            <div className="lg:hidden flex flex-col gap-4 w-full max-w-sm px-4">
              <Button
                onClick={() => handleOpenAuth('signin')}
                variant="default"
                size="lg"
                className="w-full h-12 text-base font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleOpenAuth('signup')}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium"
              >
                Create Account
              </Button>
            </div>
          </div>

          {/* Right side - Auth form (Desktop only) */}
          <div className="hidden lg:block w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {showForgotPassword ? 'Reset Password' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-muted-foreground">
                {showForgotPassword 
                  ? 'Enter your email to reset your password' 
                  : mode === 'signin' 
                    ? 'Welcome back! Please sign in to continue' 
                    : 'Join TestGenius to start creating intelligent tests'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {mode === 'signup' && !showForgotPassword && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name 
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter your Name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {!showForgotPassword && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'signup' && password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Password Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score >= 70 ? 'text-green-600 dark:text-green-400' :
                          passwordStrength.score >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              req.test(password) ? 'bg-green-500' : 'bg-muted'
                            }`} />
                            <span className={`text-xs ${
                              req.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full py-3" isLoading={isLoading}>
                {showForgotPassword ? 'Send Reset Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              {!showForgotPassword && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3"
                    onClick={handleGoogleSignIn}
                    isLoading={isLoading}
                    leftIcon={
                      <img src="/google.png" alt="Google" className="w-5 h-5" />
                    }
                  >
                    Sign in with Google
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
                    Forgot Password?
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
                      onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="text-primary hover:underline font-medium"
                    >
                      {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Auth Modal (Mobile only) */}
      {showAuthModal && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="text-center p-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {showForgotPassword ? 'Reset Password' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-muted-foreground">
                {showForgotPassword 
                  ? 'Enter your email to reset your password' 
                  : mode === 'signin' 
                    ? 'Welcome back! Please sign in to continue' 
                    : 'Join TestGenius to start creating intelligent tests'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {mode === 'signup' && !showForgotPassword && (
                <div>
                  <label htmlFor="modal-name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="modal-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="modal-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {!showForgotPassword && (
                <div>
                  <label htmlFor="modal-password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="modal-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'signup' && password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Password Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score >= 70 ? 'text-green-600 dark:text-green-400' :
                          passwordStrength.score >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              req.test(password) ? 'bg-green-500' : 'bg-muted'
                            }`} />
                            <span className={`text-xs ${
                              req.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full py-3" isLoading={isLoading}>
                {showForgotPassword ? 'Send Reset Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              {!showForgotPassword && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3"
                    onClick={handleGoogleSignIn}
                    isLoading={isLoading}
                    leftIcon={
                      <img src="/google.png" alt="Google" className="w-5 h-5" />
                    }
                  >
                    Sign in with Google
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
                    Forgot Password?
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
                      onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="text-primary hover:underline font-medium"
                    >
                      {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>
            </form>

            <div className="p-4 border-t border-border">
              <Button
                onClick={handleCloseAuth}
                variant="ghost"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};