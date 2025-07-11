import React, { useState } from 'react';
import { AuthUser, AuthService } from '../services/authService';
import { TestHistoryEntry } from '../types';
import Button from './Button';
import { HistoryView } from './HistoryView';
import { UserIcon, HistoryIcon, SettingsIcon, LogOutIcon, EditIcon, ChevronLeftIcon, SunIcon, MoonIcon, ArrowUpTrayIcon, DocumentTextIcon, BookOpenIcon, LightBulbIcon } from './Icons';
import { ElsaAvatarIcon } from './Icons';

interface ProfileViewProps {
  user: AuthUser;
  history: TestHistoryEntry[];
  onRetakeTest: (entry: TestHistoryEntry) => void;
  onViewDetails: (entry: TestHistoryEntry) => void;
  onViewScore: (entry: TestHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  onBackToHome: () => void;
}

type ProfileTab = 'profile' | 'history' | 'answerkey' | 'settings' | 'knowtheapp';

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  history,
  onRetakeTest,
  onViewDetails,
  onViewScore,
  onDeleteEntry,
  onClearHistory,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [ ] = useState<number | null>(null);

  const handleSaveName = async () => {
    if (!editName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.updateProfile({ name: editName.trim() });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await AuthService.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const handlePasswordReset = async () => {
    setPasswordResetSent(false);
    setPasswordResetError(null);
    try {
      await AuthService.resetPassword(user.email);
      setPasswordResetSent(true);
    } catch (err: any) {
      setPasswordResetError(err.message || 'Failed to send password reset email.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGravatarUrl = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const positiveHash = Math.abs(hash);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${email}&backgroundColor=${(positiveHash % 16).toString(16)}${((positiveHash >> 4) % 16).toString(16)}${((positiveHash >> 8) % 16).toString(16)}&fontSize=80`;
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  const tabs = [
    { id: 'profile' as ProfileTab, label: 'Profile', icon: UserIcon },
    { id: 'history' as ProfileTab, label: 'Test History', icon: HistoryIcon },
    { id: 'answerkey' as ProfileTab, label: 'Answer Key Check', icon: EditIcon },
    { id: 'settings' as ProfileTab, label: 'Settings', icon: SettingsIcon },
    { id: 'knowtheapp' as ProfileTab, label: 'Know the App', icon: SunIcon }, 
  ];

  const handleCheckNow = () => {
    window.open('/Score', '_blank'); // Opens Score app home in a new tab
  };


  const renderProfileContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={user.avatar_url || getGravatarUrl(user.email)}
                  alt={user.name || user.email}
                  className="w-32 h-32 rounded-full border-4 border-primary/20 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                        <rect width="200" height="200" fill="hsl(var(--primary))" rx="100"/>
                        <text x="100" y="120" font-family="Arial" font-size="60" font-weight="bold" text-anchor="middle" fill="white">
                          ${getInitials(user.name || user.email)}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
              <div className="mt-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-center text-xl font-semibold bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent max-w-xs mx-auto block"
                      placeholder="Enter your name"
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={handleSaveName}
                        size="sm"
                        isLoading={isLoading}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(user.name || '');
                          setError(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        {user.name || 'User'}
                      </h2>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground break-all">{user.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{history.length}</div>
                <div className="text-sm text-muted-foreground">Tests Completed</div>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {history.length > 0 
                    ? Math.round(history.reduce((acc, test) => acc + test.scorePercentage, 0) / history.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {history.reduce((acc, test) => acc + test.totalQuestions, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-secondary rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {history.slice(0, 3).map((test) => (
                    <div key={test.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{test.testName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.dateCompleted).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-semibold text-primary">{test.scorePercentage.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">
                          {test.correctAnswers}/{test.totalQuestions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Test History</h3>
            <HistoryView
              history={history}
              onRetakeTest={onRetakeTest}
              onViewDetails={onViewDetails}
              onViewScore={onViewScore}
              onDeleteEntry={onDeleteEntry}
              onClearHistory={onClearHistory}
              onBackToHome={onBackToHome}
              isEmbedded={true}
            />
          </div>
        );

      case 'answerkey':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
              Check Your Answer Key </h3>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
               Answer Key !!
            </h1>
                 <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
              Launching Soon!!! </h3>
            <button
              onClick={handleCheckNow}
              className="mt-6 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Check Now
            </button>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-border gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled className="self-start sm:self-auto">
                    Change Email
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-border gap-2">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last updated recently</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePasswordReset} className="self-start sm:self-auto">
                    Change Password
                  </Button>
                  {passwordResetSent && (
                    <p className="text-xs text-green-600 mt-2">Password reset email sent! Check your inbox.</p>
                  )}
                  {passwordResetError && (
                    <p className="text-xs text-destructive mt-2">{passwordResetError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 gap-2">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                    leftIcon={isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    className="self-start sm:self-auto"
                  >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p className="font-medium text-destructive">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    size="sm"
                    leftIcon={<LogOutIcon className="w-4 h-4" />}
                    className="self-start sm:self-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'knowtheapp': {
        const knowTheAppFeatures = [
          {
            title: 'Document Upload (PYQ PDFs)',
            icon: <ArrowUpTrayIcon className="w-7 h-7 text-blue-500" />,
            content: 'Upload previous year question papers or any PDF to generate mock tests. The AI extracts questions and options, creating a test for you. Processing time depends on PDF length (max 10MB supported).',
          },
          {
            title: 'Syllabus Upload',
            icon: <BookOpenIcon className="w-7 h-7 text-purple-500" />,
            content: 'Upload your syllabus and select the desired difficulty. The AI generates questions tailored to your syllabus, helping you prepare efficiently.',
          },
          {
            title: 'Keywords',
            icon: <LightBulbIcon className="w-7 h-7 text-pink-500" />,
            content: 'Enter topics or keywords to generate focused questions. The AI uses your input to create relevant and challenging questions for targeted practice.',
          },
          {
            title: 'Test History',
            icon: <HistoryIcon className="w-7 h-7 text-green-500" />,
            content: 'All your completed tests are saved in Test History. Review your scores, see detailed analytics, and retake tests to track your progress over time.',
          },
          {
            title: 'Retest & Details',
            icon: <DocumentTextIcon className="w-7 h-7 text-yellow-500" />,
            content: 'Retake any previous test or dive into detailed reviews. See which questions you got right or wrong, and learn from your mistakes.',
          },
          {
            title: 'AI Explanation & Elsa',
            icon: <img src="/logo.png" alt="TestGenius Logo" className="w-7 h-7 rounded-full" />,
            content: (
              <div className="flex flex-col gap-4 relative min-h-[110px]">
                <span>Elsa, your AI assistant, provides instant explanations for any question. Ask Elsa for help to understand concepts and improve your learning.</span>
                <div className="mt-2 flex items-center space-x-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-lg w-fit">
                  <ElsaAvatarIcon className="w-8 h-8" />
                  <span className="text-sm font-medium text-muted-foreground">Powered by Elsa</span>
                </div>
              </div>
            ),
          },
          {
            title: 'GradeFlow: AI Score Checker',
            icon: <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>,
            content: 'Upload your response sheet and answer key PDFs to instantly calculate your score. Get a question-wise review and ask Elsa about any question for deeper insights.',
            
          },
        ];
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <img src="/logo.png" alt="TestGenius Logo" className="w-16 h-16 mb-2" />
              <h2 className="text-3xl font-extrabold text-foreground mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Know the App</h2>
              <p className="text-muted-foreground text-center max-w-xl">Your all-in-one platform for AI-powered test creation, grading, and review. Explore the features below to get the most out of TestGenius!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {knowTheAppFeatures.map((box, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-xl border border-border bg-gradient-to-br from-background to-secondary shadow-lg p-6 transition-transform hover:scale-[1.025] hover:shadow-2xl flex flex-col items-start min-h-[180px]`}
                >
                  <div className="flex items-center mb-3">
                    {box.icon}
                    <span className="ml-3 text-xl font-bold text-foreground">{box.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{box.content}</div>
                  <span className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">★</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 sm:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onBackToHome}
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
                >
                  Home
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Profile</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-border">
              <nav className="p-4">
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-hidden">
              {renderProfileContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
