import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '@/api/mockApi';
import { LivePlayer } from '@/types/game';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Zap, Loader2 } from 'lucide-react';

interface SpectatorViewProps {
  playerId: string;
  onBack: () => void;
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({ playerId, onBack }) => {
  const [player, setPlayer] = useState<LivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const fetchPlayer = useCallback(async () => {
    const response = await api.livePlayers.getPlayerStream(playerId);
    if (response.data) {
      setPlayer(response.data);
    }
    setIsLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();

    // Simulate game ticks
    intervalRef.current = window.setInterval(() => {
      setPlayer((prev) => {
        if (!prev) return prev;
        return api.livePlayers.simulatePlayerTick(prev);
      });
    }, 150);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPlayer]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Player not found or stream ended</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Streams
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <span className="text-accent font-bold text-xs">
                {player.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-foreground">{player.username}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{player.viewers + 1}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-border">
            <Zap className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Score</p>
              <p className="text-xl font-bold text-secondary neon-text-cyan">{player.score}</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Mode</p>
            <p className="text-sm font-bold text-foreground capitalize">
              {player.mode === 'pass-through' ? 'Pass-Through' : 'Walls'}
            </p>
          </div>
        </div>

        <div className="relative">
          <GameCanvas
            snake={player.snake}
            food={player.food}
            status={player.status}
            isSpectator={true}
          />
          
          <div className="absolute top-2 left-2 bg-accent/90 text-accent-foreground px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent-foreground animate-pulse" />
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
};
