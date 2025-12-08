import {
  User,
  LeaderboardEntry,
  LivePlayer,
  LoginCredentials,
  SignupCredentials,
  ApiResponse,
  GameMode,
  Position,
  Direction,
} from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;
const mockUsers: Map<string, User & { password: string }> = new Map([
  ['user1@example.com', {
    id: '1',
    username: 'PixelMaster',
    email: 'user1@example.com',
    password: 'password123',
    avatar: undefined,
    createdAt: '2024-01-15',
  }],
  ['user2@example.com', {
    id: '2',
    username: 'SnakeKing',
    email: 'user2@example.com',
    password: 'password123',
    avatar: undefined,
    createdAt: '2024-02-20',
  }],
]);

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'NeonViper', score: 2450, mode: 'walls', date: '2024-12-07' },
  { id: '2', rank: 2, username: 'PixelMaster', score: 2100, mode: 'walls', date: '2024-12-06' },
  { id: '3', rank: 3, username: 'CyberSnake', score: 1890, mode: 'pass-through', date: '2024-12-05' },
  { id: '4', rank: 4, username: 'RetroGamer', score: 1750, mode: 'walls', date: '2024-12-04' },
  { id: '5', rank: 5, username: 'ArcadeKing', score: 1620, mode: 'pass-through', date: '2024-12-03' },
  { id: '6', rank: 6, username: 'SnakeCharmer', score: 1500, mode: 'walls', date: '2024-12-02' },
  { id: '7', rank: 7, username: 'BitRunner', score: 1380, mode: 'pass-through', date: '2024-12-01' },
  { id: '8', rank: 8, username: 'GridMaster', score: 1200, mode: 'walls', date: '2024-11-30' },
  { id: '9', rank: 9, username: 'NightCrawler', score: 1100, mode: 'pass-through', date: '2024-11-29' },
  { id: '10', rank: 10, username: 'VectorKing', score: 980, mode: 'walls', date: '2024-11-28' },
];

// Helper to generate random snake position
const generateRandomSnake = (gridSize: number): Position[] => {
  const startX = Math.floor(Math.random() * (gridSize - 10)) + 5;
  const startY = Math.floor(Math.random() * (gridSize - 10)) + 5;
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
};

const generateRandomFood = (gridSize: number, snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const mockLivePlayers: LivePlayer[] = [
  {
    id: 'live1',
    username: 'StreamerPro',
    score: 340,
    mode: 'walls',
    snake: generateRandomSnake(20),
    food: { x: 10, y: 10 },
    direction: 'RIGHT',
    status: 'playing',
    viewers: 42,
  },
  {
    id: 'live2',
    username: 'NightOwl',
    score: 180,
    mode: 'pass-through',
    snake: generateRandomSnake(20),
    food: { x: 15, y: 5 },
    direction: 'UP',
    status: 'playing',
    viewers: 28,
  },
  {
    id: 'live3',
    username: 'ProGamer99',
    score: 560,
    mode: 'walls',
    snake: generateRandomSnake(20),
    food: { x: 8, y: 12 },
    direction: 'LEFT',
    status: 'playing',
    viewers: 156,
  },
];

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    await delay(800);
    
    const storedUser = mockUsers.get(credentials.email);
    if (storedUser && storedUser.password === credentials.password) {
      const { password, ...user } = storedUser;
      currentUser = user;
      localStorage.setItem('snake_user', JSON.stringify(user));
      return { data: user, error: null, success: true };
    }
    
    return { data: null, error: 'Invalid email or password', success: false };
  },

  signup: async (credentials: SignupCredentials): Promise<ApiResponse<User>> => {
    await delay(1000);
    
    if (mockUsers.has(credentials.email)) {
      return { data: null, error: 'Email already registered', success: false };
    }
    
    const newUser: User & { password: string } = {
      id: String(mockUsers.size + 1),
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    mockUsers.set(credentials.email, newUser);
    const { password, ...user } = newUser;
    currentUser = user;
    localStorage.setItem('snake_user', JSON.stringify(user));
    
    return { data: user, error: null, success: true };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    await delay(300);
    currentUser = null;
    localStorage.removeItem('snake_user');
    return { data: null, error: null, success: true };
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    await delay(200);
    
    const storedUser = localStorage.getItem('snake_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      currentUser = user;
      return { data: user, error: null, success: true };
    }
    
    return { data: null, error: null, success: true };
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async (mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> => {
    await delay(500);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return { data: entries, error: null, success: true };
  },

  submitScore: async (score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry | null>> => {
    await delay(600);
    
    if (!currentUser) {
      return { data: null, error: 'Must be logged in to submit score', success: false };
    }
    
    const newEntry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      rank: 0,
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0],
    };
    
    mockLeaderboard.push(newEntry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    mockLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    const updatedEntry = mockLeaderboard.find(e => e.id === newEntry.id);
    
    return { data: updatedEntry || null, error: null, success: true };
  },
};

// Live players API
export const livePlayersApi = {
  getLivePlayers: async (): Promise<ApiResponse<LivePlayer[]>> => {
    await delay(400);
    return { data: [...mockLivePlayers], error: null, success: true };
  },

  getPlayerStream: async (playerId: string): Promise<ApiResponse<LivePlayer | null>> => {
    await delay(200);
    const player = mockLivePlayers.find(p => p.id === playerId);
    return { data: player || null, error: player ? null : 'Player not found', success: !!player };
  },

  // Simulates player movement for spectator mode
  simulatePlayerTick: (player: LivePlayer, gridSize: number = 20): LivePlayer => {
    const { snake, direction, food, score } = player;
    const head = snake[0];
    
    // Calculate new head position
    let newHead: Position;
    switch (direction) {
      case 'UP':
        newHead = { x: head.x, y: (head.y - 1 + gridSize) % gridSize };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: (head.y + 1) % gridSize };
        break;
      case 'LEFT':
        newHead = { x: (head.x - 1 + gridSize) % gridSize, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: (head.x + 1) % gridSize, y: head.y };
        break;
    }
    
    const newSnake = [newHead, ...snake];
    let newFood = food;
    let newScore = score;
    
    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      newFood = generateRandomFood(gridSize, newSnake);
      newScore += 10;
    } else {
      newSnake.pop();
    }
    
    // Random direction change (30% chance)
    let newDirection = direction;
    if (Math.random() < 0.3) {
      const possibleDirections = directions.filter(d => {
        if (direction === 'UP' && d === 'DOWN') return false;
        if (direction === 'DOWN' && d === 'UP') return false;
        if (direction === 'LEFT' && d === 'RIGHT') return false;
        if (direction === 'RIGHT' && d === 'LEFT') return false;
        return true;
      });
      newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
    
    return {
      ...player,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
    };
  },
};

// Export all APIs as a single object for centralized access
export const api = {
  auth: authApi,
  leaderboard: leaderboardApi,
  livePlayers: livePlayersApi,
};
