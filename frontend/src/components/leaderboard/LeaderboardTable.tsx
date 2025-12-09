import React, { useEffect, useState } from 'react';
import { api } from '@/api/mockApi';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

interface LeaderboardTableProps {
  filterMode?: GameMode | 'all';
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  filterMode = 'all',
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<GameMode | 'all'>(filterMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      const mode = activeFilter === 'all' ? undefined : activeFilter;
      const response = await api.leaderboard.getLeaderboard(mode);
      
      if (response.success && response.data) {
        // Mock API returns array directly in data, backend returns { entries: [] }
        const leaderboardData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).entries || [];
        setEntries(leaderboardData);
      } else {
        setError(response.error || 'Failed to load leaderboard');
        setEntries([]);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [activeFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-neon-yellow/10 border-neon-yellow/30';
      case 2:
        return 'bg-muted/30 border-muted-foreground/30';
      case 3:
        return 'bg-orange-500/10 border-orange-500/30';
      default:
        return 'bg-card/50 border-border';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          variant={activeFilter === 'all' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All
        </Button>
        <Button
          variant={activeFilter === 'walls' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('walls')}
        >
          Walls
        </Button>
        <Button
          variant={activeFilter === 'pass-through' ? 'neon-cyan' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('pass-through')}
        >
          Pass-Through
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
          >
            Try Again
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No leaderboard entries found
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-3 rounded-lg border ${getRankStyle(entry.rank)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{entry.username}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {entry.mode === 'pass-through' ? 'Pass-Through' : 'Walls'} • {entry.date}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-lg ${entry.rank === 1 ? 'text-neon-yellow' : entry.rank <= 3 ? 'text-primary' : 'text-foreground'}`}>
                  {entry.score.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
