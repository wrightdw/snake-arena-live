import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ModeSelector } from '@/components/game/ModeSelector';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { GameOverlay } from '@/components/game/GameOverlay';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LivePlayerCard } from '@/components/spectator/LivePlayerCard';
import { LivePlayer } from '@/types/game';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: true }),
    signup: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    user: null,
  }),
}));

describe('Components', () => {
  describe('LoginForm', () => {
    it('should render email and password inputs', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render login button', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should render switch to signup link', () => {
      const onSwitchToSignup = vi.fn();
      render(<LoginForm onSwitchToSignup={onSwitchToSignup} />);

      const signupLink = screen.getByText(/sign up/i);
      fireEvent.click(signupLink);

      expect(onSwitchToSignup).toHaveBeenCalled();
    });

    it('should show demo credentials', () => {
      render(<LoginForm />);

      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
      expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
    });
  });

  describe('SignupForm', () => {
    it('should render username, email and password inputs', () => {
      render(<SignupForm />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should render create account button', () => {
      render(<SignupForm />);

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render switch to login link', () => {
      const onSwitchToLogin = vi.fn();
      render(<SignupForm onSwitchToLogin={onSwitchToLogin} />);

      const loginLink = screen.getByText(/log in/i);
      fireEvent.click(loginLink);

      expect(onSwitchToLogin).toHaveBeenCalled();
    });
  });

  describe('ModeSelector', () => {
    it('should render both mode buttons', () => {
      render(<ModeSelector currentMode="walls" onModeChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: /walls/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pass-through/i })).toBeInTheDocument();
    });

    it('should call onModeChange when clicking a mode', () => {
      const onModeChange = vi.fn();
      render(<ModeSelector currentMode="walls" onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: /pass-through/i }));

      expect(onModeChange).toHaveBeenCalledWith('pass-through');
    });

    it('should disable buttons when disabled prop is true', () => {
      render(<ModeSelector currentMode="walls" onModeChange={vi.fn()} disabled />);

      expect(screen.getByRole('button', { name: /walls/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /pass-through/i })).toBeDisabled();
    });
  });

  describe('ScoreDisplay', () => {
    it('should display current score', () => {
      render(<ScoreDisplay score={150} highScore={200} />);

      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should display high score', () => {
      render(<ScoreDisplay score={150} highScore={200} />);

      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  describe('GameOverlay', () => {
    const defaultProps = {
      status: 'idle' as const,
      score: 0,
      highScore: 100,
      mode: 'walls' as const,
      onStart: vi.fn(),
      onPause: vi.fn(),
      onReset: vi.fn(),
    };

    it('should show start game button when idle', () => {
      render(<GameOverlay {...defaultProps} status="idle" />);

      expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    });

    it('should show resume and restart buttons when paused', () => {
      render(<GameOverlay {...defaultProps} status="paused" />);

      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
    });

    it('should show game over text and play again button when game over', () => {
      render(<GameOverlay {...defaultProps} status="game-over" score={50} />);

      expect(screen.getByText(/game over/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    it('should show new high score message when score beats high score', () => {
      render(<GameOverlay {...defaultProps} status="game-over" score={150} highScore={100} />);

      expect(screen.getByText(/new high score/i)).toBeInTheDocument();
    });

    it('should return null when playing', () => {
      const { container } = render(<GameOverlay {...defaultProps} status="playing" />);

      expect(container.firstChild).toBeNull();
    });

    it('should call onStart when start button is clicked', () => {
      const onStart = vi.fn();
      render(<GameOverlay {...defaultProps} onStart={onStart} />);

      fireEvent.click(screen.getByRole('button', { name: /start game/i }));

      expect(onStart).toHaveBeenCalled();
    });
  });

  describe('LivePlayerCard', () => {
    const mockPlayer: LivePlayer = {
      id: 'test-player',
      username: 'TestPlayer',
      score: 250,
      mode: 'walls',
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      direction: 'RIGHT',
      status: 'playing',
      viewers: 42,
    };

    it('should display player username', () => {
      render(<LivePlayerCard player={mockPlayer} onWatch={vi.fn()} />);

      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    it('should display player score', () => {
      render(<LivePlayerCard player={mockPlayer} onWatch={vi.fn()} />);

      expect(screen.getByText('250')).toBeInTheDocument();
    });

    it('should display viewer count', () => {
      render(<LivePlayerCard player={mockPlayer} onWatch={vi.fn()} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display game mode', () => {
      render(<LivePlayerCard player={mockPlayer} onWatch={vi.fn()} />);

      expect(screen.getByText(/walls/i)).toBeInTheDocument();
    });

    it('should call onWatch with player ID when watch button is clicked', () => {
      const onWatch = vi.fn();
      render(<LivePlayerCard player={mockPlayer} onWatch={onWatch} />);

      fireEvent.click(screen.getByRole('button', { name: /watch/i }));

      expect(onWatch).toHaveBeenCalledWith('test-player');
    });
  });
});
