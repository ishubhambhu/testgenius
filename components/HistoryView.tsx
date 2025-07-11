import React, { useState } from 'react';
import { TestHistoryEntry, TestInputMethod } from '../types';
import Button from './Button';
import { ArrowPathIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChartBarIcon, EditIcon } from './Icons';
import { HistoryService } from '../services/historyService';

const difficultyLevelMap: { [key: number]: string } = {
  1: 'Foundation',
  2: 'Growth',
  3: 'Proficient',
  4: 'Achiever',
  5: 'Mastery',
};

interface HistoryViewProps {
  history: TestHistoryEntry[];
  onRetakeTest: (entry: TestHistoryEntry) => void;
  onViewDetails: (entry: TestHistoryEntry) => void;
  onViewScore: (entry: TestHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  onBackToHome: () => void;
  isEmbedded?: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  history, 
  onRetakeTest, 
  onViewDetails, 
  onViewScore, 
  onDeleteEntry, 
  onClearHistory, 
  onBackToHome,
  isEmbedded = false
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const containerClasses = isEmbedded 
    ? "space-y-6" 
    : "p-4 sm:p-6 md:p-8 max-w-4xl mx-auto my-8";

  const cardClasses = isEmbedded 
    ? "space-y-6" 
    : "bg-card border border-border p-6 sm:p-8 rounded-lg shadow-xl";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const handleRename = async (entry: TestHistoryEntry) => {
    setRenameLoading(true);
    setRenameError(null);
    try {
      await HistoryService.saveTestHistory({ ...entry, testName: newName });
      setEditingId(null);
      setNewName('');
    } catch (err: any) {
      setRenameError(err.message || 'Failed to rename test');
    } finally {
      setRenameLoading(false);
    }
  };

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {!isEmbedded && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-border gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Test History</h2>
            <Button onClick={onBackToHome} variant="outline" size="sm" leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
              Home
            </Button>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No test history found.</p>
            <p className="text-sm text-muted-foreground/80 mt-2">Complete some tests to see them here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...history].sort((a,b) => b.dateCompleted - a.dateCompleted).map((entry) => {
              const level = entry.originalConfig.difficultyLevel;
              const isDifficultyApplicable = (entry.originalConfig.inputMethod === TestInputMethod.SYLLABUS || entry.originalConfig.inputMethod === TestInputMethod.TOPIC) && level;
              
              return (
                <div key={entry.id} className="p-4 sm:p-5 border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-background">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                    {editingId === entry.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          className="flex-1 rounded-md border-input bg-background px-2 py-1 text-sm focus:border-primary focus:ring-0"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          disabled={renameLoading}
                        />
                        <Button size="sm" onClick={() => handleRename(entry)} isLoading={renameLoading}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setNewName(''); }}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center w-full">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-0 truncate flex-1" title={entry.testName}>
                          {entry.testName || "Untitled Test"}
                        </h3>
                        <button
                          className="ml-2 text-primary hover:text-primary-dark p-1 rounded-full"
                          onClick={() => { setEditingId(entry.id); setNewName(entry.testName || ''); }}
                          aria-label="Rename test"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(entry.dateCompleted)}
                    </p>
                  </div>
                  {renameError && editingId === entry.id && (
                    <div className="text-xs text-destructive mb-2">{renameError}</div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4 p-3 bg-secondary rounded-md border border-border">
                      <div className="font-medium text-foreground">
                          <span className="text-primary text-xl sm:text-2xl font-bold">{entry.scorePercentage.toFixed(1)}%</span>
                          <p className="text-xs text-muted-foreground">Score {entry.wasCorrectedByUser && "(Adj.)"}</p>
                      </div>
                      <div>
                          <span className="font-bold text-lg">{entry.correctAnswers}/{entry.attemptedQuestions}</span>
                          <p className="text-xs text-muted-foreground">Correct</p>
                      </div>
                      <div>
                          <span className="font-bold text-lg">{entry.totalQuestions}</span>
                          <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                      <div>
                          <span className="font-bold text-lg">
                              {isDifficultyApplicable
                                  ? (difficultyLevelMap[level] ? `${difficultyLevelMap[level]} (${level}/5)` : `${level}/5`)
                                  : 'N/A'}
                          </span>
                          <p className="text-xs text-muted-foreground">Difficulty</p>
                      </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-start gap-2 mt-4 sm:justify-end">
                    <Button 
                        onClick={() => onViewScore(entry)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<ChartBarIcon className="w-4 h-4"/>}
                    >
                        Score
                    </Button>
                    <Button 
                        onClick={() => onViewDetails(entry)}
                        variant="outline"
                        size="sm"
                        leftIcon={<EyeIcon className="w-4 h-4"/>}
                    >
                        Details
                    </Button>
                    <Button 
                      onClick={() => onRetakeTest(entry)} 
                      variant="default" 
                      size="sm"
                      leftIcon={<ArrowPathIcon className="w-4 h-4"/>}
                    >
                      Retake
                    </Button>
                    <Button
                        onClick={() => onDeleteEntry(entry.id)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        aria-label="Delete test entry"
                        title="Delete test entry"
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="mt-8 pt-6 border-t border-border flex justify-end">
              <Button 
                onClick={onClearHistory}
                variant="destructive"
                size="sm"
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Clear All History
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};