import React, { useEffect, useState } from 'react';
import { api } from '@/api/backendApi';
import { LivePlayer } from '@/types/game';
import { LivePlayerCard } from './LivePlayerCard';
import { SpectatorView } from './SpectatorView';
import { Loader2, Radio } from 'lucide-react';

export const LivePlayersList: React.FC = () => {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchingPlayerId, setWatchingPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);
      const response = await api.livePlayers.getLivePlayers();
      
      if (response.success && response.data) {
        // Mock API returns array directly in data, backend returns { players: [] }
        const playersData = Array.isArray(response.data)
          ? response.data
          : (response.data as any).players || [];
        setPlayers(playersData);
      } else {
        setError(response.error || 'Failed to load live players');
        setPlayers([]);
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
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
