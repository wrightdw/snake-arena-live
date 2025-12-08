import React from 'react';
import { Trophy, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, highScore }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-[400px] mx-auto">
      <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
        <Zap className="w-5 h-5 text-secondary" />
        <div>
          <p className="text-xs text-muted-foreground uppercase">Score</p>
          <p className="text-xl font-bold text-secondary neon-text-cyan">{score}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
        <Trophy className="w-5 h-5 text-neon-yellow" />
        <div>
          <p className="text-xs text-muted-foreground uppercase">Best</p>
          <p className="text-xl font-bold text-neon-yellow">{highScore}</p>
        </div>
      </div>
    </div>
  );
};
