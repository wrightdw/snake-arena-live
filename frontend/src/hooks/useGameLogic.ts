import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode, GameStatus } from '@/types/game';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

const generateRandomPosition = (excludePositions: Position[]): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (excludePositions.some(p => p.x === position.x && p.y === position.y));
  return position;
};

const createInitialState = (mode: GameMode): GameState => {
  const initialSnake: Position[] = [
    { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) },
    { x: Math.floor(GRID_SIZE / 2) - 1, y: Math.floor(GRID_SIZE / 2) },
    { x: Math.floor(GRID_SIZE / 2) - 2, y: Math.floor(GRID_SIZE / 2) },
  ];

  return {
    snake: initialSnake,
    food: generateRandomPosition(initialSnake),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    highScore: parseInt(localStorage.getItem(`snake_highscore_${mode}`) || '0'),
    status: 'idle',
    mode,
    speed: INITIAL_SPEED,
  };
};

export const moveSnake = (
  snake: Position[],
  direction: Direction,
  mode: GameMode
): { newSnake: Position[]; collision: boolean } => {
  const head = snake[0];
  let newHead: Position;

  switch (direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (mode === 'pass-through') {
    newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
    newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
  } else {
    // walls mode - check for wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      return { newSnake: snake, collision: true };
    }
  }

  // Check self collision (excluding tail since it will move, and the segment right after head since it shifts away)
  const bodyToCheck = snake.slice(2, -1);
  const selfCollision = bodyToCheck.some(
    segment => segment.x === newHead.x && segment.y === newHead.y
  );

  if (selfCollision) {
    return { newSnake: snake, collision: true };
  }

  const newSnake = [newHead, ...snake.slice(0, -1)];
  return { newSnake, collision: false };
};

export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const growSnake = (snake: Position[]): Position[] => {
  const tail = snake[snake.length - 1];
  return [...snake, { ...tail }];
};

export const calculateSpeed = (score: number): number => {
  const speedReduction = Math.floor(score / 50) * SPEED_INCREMENT;
  return Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);
};

export const useGameLogic = (initialMode: GameMode = 'walls') => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const resetGame = useCallback((mode?: GameMode) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(createInitialState(mode || gameState.mode));
  }, [gameState.mode]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      if (newDirection === getOppositeDirection(prev.direction)) return prev;
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    resetGame(mode);
  }, [resetGame]);

  const tick = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const direction = prev.nextDirection;
      const { newSnake, collision } = moveSnake(prev.snake, direction, prev.mode);

      if (collision) {
        // Update high score if needed
        if (prev.score > prev.highScore) {
          localStorage.setItem(`snake_highscore_${prev.mode}`, prev.score.toString());
        }
        return {
          ...prev,
          status: 'game-over',
          highScore: Math.max(prev.score, prev.highScore),
        };
      }

      const head = newSnake[0];
      const ateFood = checkFoodCollision(head, prev.food);

      if (ateFood) {
        const grownSnake = growSnake(newSnake);
        const newScore = prev.score + 10;
        const newHighScore = Math.max(newScore, prev.highScore);
        
        if (newScore > prev.highScore) {
          localStorage.setItem(`snake_highscore_${prev.mode}`, newHighScore.toString());
        }

        return {
          ...prev,
          snake: grownSnake,
          food: generateRandomPosition(grownSnake),
          direction,
          score: newScore,
          highScore: newHighScore,
          speed: calculateSpeed(newScore),
        };
      }

      return {
        ...prev,
        snake: newSnake,
        direction,
      };
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= gameState.speed) {
        tick();
        lastUpdateRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed, tick]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard controls if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.status === 'idle') {
            startGame();
          } else if (gameState.status === 'playing' || gameState.status === 'paused') {
            pauseGame();
          } else if (gameState.status === 'game-over') {
            resetGame();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (gameState.status === 'playing') {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, startGame, pauseGame, resetGame, gameState.status]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
    tick,
  };
};
