import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, activeTab, onTabChange }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary neon-text font-pixel hidden sm:block">
              SNAKE
            </h1>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Button
              variant={activeTab === 'play' ? 'neon' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('play')}
            >
              Play
            </Button>
            <Button
              variant={activeTab === 'leaderboard' ? 'neon-cyan' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('leaderboard')}
            >
              Leaderboard
            </Button>
            <Button
              variant={activeTab === 'spectate' ? 'neon-pink' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('spectate')}
            >
              Watch
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-lg border border-border">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{user.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={onLoginClick}>
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
