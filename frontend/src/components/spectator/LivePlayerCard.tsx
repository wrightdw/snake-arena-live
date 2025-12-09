import React from 'react';
import { LivePlayer } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Eye, Users, Zap } from 'lucide-react';

interface LivePlayerCardProps {
  player: LivePlayer;
  onWatch: (playerId: string) => void;
}

export const LivePlayerCard: React.FC<LivePlayerCardProps> = ({ player, onWatch }) => {
  return (
    <div className="bg-card/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary font-bold text-sm">
              {player.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-foreground">{player.username}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {player.mode === 'pass-through' ? 'Pass-Through' : 'Walls'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">{player.viewers}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-secondary" />
          <span className="font-bold text-secondary">{player.score}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWatch(player.id)}
          className="gap-1"
        >
          <Eye className="w-4 h-4" />
          Watch
        </Button>
      </div>

      <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${Math.min(100, player.score / 10)}%` }}
        />
      </div>
    </div>
  );
};
