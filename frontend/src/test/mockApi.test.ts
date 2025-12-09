import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '@/api/mockApi';

describe('Mock API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('snake_user');
  });

  describe('authApi', () => {
    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const result = await api.auth.login({
          email: 'user1@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.username).toBe('PixelMaster');
        expect(result.error).toBeNull();
      });

      it('should fail login with invalid email', async () => {
        const result = await api.auth.login({
          email: 'invalid@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Invalid email or password');
      });

      it('should fail login with invalid password', async () => {
        const result = await api.auth.login({
          email: 'user1@example.com',
          password: 'wrongpassword',
        });

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Invalid email or password');
      });

      it('should store user in localStorage on successful login', async () => {
        await api.auth.login({
          email: 'user1@example.com',
          password: 'password123',
        });

        expect(localStorage.setItem).toHaveBeenCalledWith(
          'snake_user',
          expect.any(String)
        );
      });
    });

    describe('signup', () => {
      it('should successfully create a new account', async () => {
        const result = await api.auth.signup({
          username: 'NewPlayer',
          email: 'newplayer@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.username).toBe('NewPlayer');
        expect(result.data?.email).toBe('newplayer@example.com');
      });

      it('should fail signup with existing email', async () => {
        const result = await api.auth.signup({
          username: 'AnotherUser',
          email: 'user1@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Email already registered');
      });
    });

    describe('logout', () => {
      it('should successfully logout', async () => {
        // First login
        await api.auth.login({
          email: 'user1@example.com',
          password: 'password123',
        });

        // Then logout
        const result = await api.auth.logout();

        expect(result.success).toBe(true);
        expect(localStorage.removeItem).toHaveBeenCalledWith('snake_user');
      });
    });

    describe('getCurrentUser', () => {
      it('should return null when no user is logged in', async () => {
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
        
        const result = await api.auth.getCurrentUser();

        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should return user from localStorage', async () => {
        const mockUser = { id: '1', username: 'TestUser', email: 'test@example.com' };
        (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(mockUser));

        const result = await api.auth.getCurrentUser();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUser);
      });
    });
  });

  describe('leaderboardApi', () => {
    describe('getLeaderboard', () => {
      it('should return all leaderboard entries', async () => {
        const result = await api.leaderboard.getLeaderboard();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.length).toBeGreaterThan(0);
      });

      it('should filter by walls mode', async () => {
        const result = await api.leaderboard.getLeaderboard('walls');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.every(entry => entry.mode === 'walls')).toBe(true);
      });

      it('should filter by pass-through mode', async () => {
        const result = await api.leaderboard.getLeaderboard('pass-through');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.every(entry => entry.mode === 'pass-through')).toBe(true);
      });

      it('should return entries sorted by score descending', async () => {
        const result = await api.leaderboard.getLeaderboard();

        expect(result.success).toBe(true);
        const scores = result.data!.map(e => e.score);
        const sortedScores = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sortedScores);
      });
    });

    describe('submitScore', () => {
      it('should fail when not logged in', async () => {
        const result = await api.leaderboard.submitScore(100, 'walls');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Must be logged in to submit score');
      });
    });
  });

  describe('livePlayersApi', () => {
    describe('getLivePlayers', () => {
      it('should return list of live players', async () => {
        const result = await api.livePlayers.getLivePlayers();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.length).toBeGreaterThan(0);
      });

      it('should return players with required fields', async () => {
        const result = await api.livePlayers.getLivePlayers();

        expect(result.success).toBe(true);
        result.data!.forEach(player => {
          expect(player).toHaveProperty('id');
          expect(player).toHaveProperty('username');
          expect(player).toHaveProperty('score');
          expect(player).toHaveProperty('mode');
          expect(player).toHaveProperty('snake');
          expect(player).toHaveProperty('food');
          expect(player).toHaveProperty('direction');
          expect(player).toHaveProperty('status');
          expect(player).toHaveProperty('viewers');
        });
      });
    });

    describe('getPlayerStream', () => {
      it('should return player by ID', async () => {
        const result = await api.livePlayers.getPlayerStream('live1');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.id).toBe('live1');
      });

      it('should return null for non-existent player', async () => {
        const result = await api.livePlayers.getPlayerStream('nonexistent');

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toBe('Player not found');
      });
    });

    describe('simulatePlayerTick', () => {
      it('should move the snake', async () => {
        const result = await api.livePlayers.getLivePlayers();
        const player = result.data![0];
        const originalHead = { ...player.snake[0] };

        const updatedPlayer = api.livePlayers.simulatePlayerTick(player);

        expect(updatedPlayer.snake[0]).not.toEqual(originalHead);
      });

      it('should increase score when food is eaten', async () => {
        const result = await api.livePlayers.getLivePlayers();
        const player = result.data![0];
        
        // Place food at next position
        const head = player.snake[0];
        let nextX = head.x;
        let nextY = head.y;
        
        switch (player.direction) {
          case 'UP': nextY = (nextY - 1 + 20) % 20; break;
          case 'DOWN': nextY = (nextY + 1) % 20; break;
          case 'LEFT': nextX = (nextX - 1 + 20) % 20; break;
          case 'RIGHT': nextX = (nextX + 1) % 20; break;
        }
        
        player.food = { x: nextX, y: nextY };
        const originalScore = player.score;

        const updatedPlayer = api.livePlayers.simulatePlayerTick(player);

        expect(updatedPlayer.score).toBe(originalScore + 10);
      });
    });
  });
});
