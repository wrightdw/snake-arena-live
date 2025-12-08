import React from 'react';
import { GameStatus, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
