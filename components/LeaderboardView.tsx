import React, { useState, useEffect } from 'react';
import { AuthUser } from '../services/authService';
import { LeaderboardService, LeaderboardEntry } from '../services/leaderboardService';
import Button from './Button';
import { ChevronLeftIcon, TrophyIcon, CrownIcon, MedalIcon } from './Icons';

interface LeaderboardViewProps {
  user: AuthUser | null;
  onBackToHome: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user, onBackToHome }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await LeaderboardService.getLeaderboard();
      setLeaderboard(data);
      
      if (user) {
        const rank = await LeaderboardService.getUserRank(user.id);
        setUserRank(rank);
      }
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <MedalIcon className="w-4 h-4 text-gray-400" />;
      case 3:
        return <MedalIcon className="w-4 h-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-24';
      case 2: return 'h-20';
      case 3: return 'h-16';
      default: return 'h-12';
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-t from-yellow-400 to-yellow-300';
      case 2: return 'bg-gradient-to-t from-gray-400 to-gray-300';
      case 3: return 'bg-gradient-to-t from-amber-600 to-amber-500';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <div className="bg-card border border-border rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <div className="bg-card border border-border rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
              <Button
                onClick={onBackToHome}
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
              >
                Back
              </Button>
            </div>
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadLeaderboard} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

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
                  Back
                </Button>
                <div className="flex items-center space-x-3">
                  <TrophyIcon className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leaderboard</h1>
                    <p className="text-sm text-muted-foreground">Top performers on TestGenius</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrophyIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* User's Rank Display */}
            {user && userRank && (
              <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold text-primary">#{userRank}</p>
              </div>
            )}

            {/* Top 3 Champions Podium */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-center mb-6 text-foreground">Top 3 Champions</h2>
                <div className="flex items-end justify-center space-x-4 mb-8">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        <img
                          src={topThree[1].avatar_url || getGravatarUrl(topThree[1].email)}
                          alt={topThree[1].name}
                          className="w-12 h-12 rounded-full border-2 border-gray-400"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                <rect width="48" height="48" fill="#9CA3AF" rx="24"/>
                                <text x="24" y="30" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">
                                  ${getInitials(topThree[1].display_name)}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <p className="text-sm font-medium text-center mt-1">{topThree[1].display_name}</p>
                        <p className="text-xs text-muted-foreground text-center">{topThree[1].final_score.toFixed(1)}%</p>
                      </div>
                      <div className={`${getPodiumHeight(2)} ${getPodiumColor(2)} w-20 rounded-t-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">2nd</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        <img
                          src={topThree[0].avatar_url || getGravatarUrl(topThree[0].email)}
                          alt={topThree[0].name}
                          className="w-16 h-16 rounded-full border-4 border-yellow-400"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                                <rect width="64" height="64" fill="#FCD34D" rx="32"/>
                                <text x="32" y="40" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="white">
                                  ${getInitials(topThree[0].display_name)}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <p className="text-sm font-medium text-center mt-1">{topThree[0].display_name}</p>
                        <p className="text-xs text-muted-foreground text-center">{topThree[0].final_score.toFixed(1)}%</p>
                      </div>
                      <div className={`${getPodiumHeight(1)} ${getPodiumColor(1)} w-24 rounded-t-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">1st</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        <img
                          src={topThree[2].avatar_url || getGravatarUrl(topThree[2].email)}
                          alt={topThree[2].name}
                          className="w-12 h-12 rounded-full border-2 border-amber-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                <rect width="48" height="48" fill="#D97706" rx="24"/>
                                <text x="24" y="30" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">
                                  ${getInitials(topThree[2].display_name)}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <p className="text-sm font-medium text-center mt-1">{topThree[2].display_name}</p>
                        <p className="text-xs text-muted-foreground text-center">{topThree[2].final_score.toFixed(1)}%</p>
                      </div>
                      <div className={`${getPodiumHeight(3)} ${getPodiumColor(3)} w-20 rounded-t-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">3rd</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tests</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Avg Score</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Questions</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.user_id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(index + 1)}
                          <span className={`font-medium ${index < 3 ? 'text-primary' : 'text-foreground'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={entry.avatar_url || getGravatarUrl(entry.email)}
                            alt={entry.display_name}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `data:image/svg+xml;base64,${btoa(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                  <rect width="32" height="32" fill="hsl(var(--primary))" rx="16"/>
                                  <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="white">
                                    ${getInitials(entry.display_name)}
                                  </text>
                                </svg>
                              `)}`;
                            }}
                          />
                          <div>
                            <p className="font-medium text-foreground">{entry.display_name}</p>
                            {user && entry.user_id === user.id && (
                              <p className="text-xs text-primary">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-foreground">{entry.tests_completed}</td>
                      <td className="py-3 px-4 text-center font-medium text-foreground">{entry.avg_score.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center font-medium text-foreground">{entry.total_questions_attempted}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${index < 3 ? 'text-primary' : 'text-foreground'}`}>
                          {entry.final_score.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <TrophyIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">No rankings yet</p>
                <p className="text-sm text-muted-foreground">Complete some tests to see the leaderboard!</p>
              </div>
            )}

            {/* How Rankings Are Calculated */}
            <div className="mt-8 p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">How Rankings Are Calculated</h3>
              <p className="text-sm text-muted-foreground">
                Rankings are calculated using a comprehensive scoring system that considers your average test performance, 
                number of tests completed, and total questions attempted. The final score is normalized to provide 
                fair rankings across all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};