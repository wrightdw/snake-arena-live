import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SnakeGame } from '@/components/game/SnakeGame';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LivePlayersList } from '@/components/spectator/LivePlayersList';
import { AuthModal } from '@/components/auth/AuthModal';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'spectate'>('play');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50" />
      
      <Header
        onLoginClick={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'play' && (
          <div className="max-w-2xl mx-auto">
            <SnakeGame />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-secondary neon-text-cyan font-pixel">
              LEADERBOARD
            </h2>
            <LeaderboardTable />
          </div>
        )}

        {activeTab === 'spectate' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-accent neon-text-pink font-pixel">
              SPECTATE
            </h2>
            <LivePlayersList />
          </div>
        )}
      </main>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;
