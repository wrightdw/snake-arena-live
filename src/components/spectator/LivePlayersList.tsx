import React, { useEffect, useState } from 'react';
import { api } from '@/api/mockApi';
import { LivePlayer } from '@/types/game';
import { LivePlayerCard } from './LivePlayerCard';
import { SpectatorView } from './SpectatorView';
import { Loader2, Radio } from 'lucide-react';

export const LivePlayersList: React.FC = () => {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchingPlayerId, setWatchingPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await api.livePlayers.getLivePlayers();
      if (response.data) {
        setPlayers(response.data);
      }
      setIsLoading(false);
    };

    fetchPlayers();
  }, []);

  if (watchingPlayerId) {
    return (
      <SpectatorView
        playerId={watchingPlayerId}
        onBack={() => setWatchingPlayerId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-center text-accent">
        <Radio className="w-5 h-5 animate-pulse" />
        <span className="font-bold uppercase tracking-wider">Live Now</span>
      </div>

      {players.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No players currently live
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <LivePlayerCard
              key={player.id}
              player={player}
              onWatch={setWatchingPlayerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
