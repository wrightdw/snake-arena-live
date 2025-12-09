import React, { useState } from 'react';
import { GameStatus, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '@/api/backendApi';
import { getToken } from '@/api/backendApi';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  mode: GameMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  status,
  score,
  highScore,
  mode,
  onStart,
  onPause,
  onReset,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitScore = async () => {
    if (!getToken()) {
      setSubmitError('Please log in to submit your score');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await api.leaderboard.submitScore(score, mode);
      if (response.success) {
        // Score submitted successfully
        console.log('Score submitted:', response.data);
      } else {
        setSubmitError(response.error || 'Failed to submit score');
      }
    } catch (error) {
      setSubmitError('Error submitting score');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'playing') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="text-center space-y-6">
        {status === 'idle' && (
          <>
            <h2 className="text-3xl font-bold text-primary neon-text font-pixel">
              SNAKE
            </h2>
            <p className="text-secondary text-sm uppercase tracking-widest">
              Mode: {mode === 'walls' ? 'Walls' : 'Pass-Through'}
            </p>
            <Button variant="neon" size="xl" onClick={onStart}>
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
            <p className="text-muted-foreground text-xs">
              Press SPACE or click to start
            </p>
          </>
        )}

        {status === 'paused' && (
          <>
            <h2 className="text-3xl font-bold text-secondary neon-text-cyan font-pixel">
              PAUSED
            </h2>
            <p className="text-xl text-foreground">Score: {score}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="neon-cyan" size="lg" onClick={onPause}>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button variant="outline" size="lg" onClick={onReset}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Restart
              </Button>
            </div>
          </>
        )}

        {status === 'game-over' && (
          <>
            <h2 className="text-3xl font-bold text-accent neon-text-pink font-pixel animate-pulse-neon">
              GAME OVER
            </h2>
            <div className="space-y-2">
              <p className="text-2xl text-foreground">Score: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-primary neon-text text-lg">New High Score!</p>
              )}
              <p className="text-muted-foreground">Best: {highScore}</p>
            </div>
            
            {getToken() && score > 0 && (
              <Button 
                variant="neon-cyan" 
                size="lg" 
                onClick={handleSubmitScore}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Score'
                )}
              </Button>
            )}
            
            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}
            
            <Button variant="neon-pink" size="xl" onClick={onReset}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
