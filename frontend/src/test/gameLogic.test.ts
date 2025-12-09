import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  moveSnake,
  checkFoodCollision,
  growSnake,
  calculateSpeed,
  GRID_SIZE,
  INITIAL_SPEED,
  MIN_SPEED,
} from '@/hooks/useGameLogic';
import { Position, Direction, GameMode } from '@/types/game';

describe('Game Logic', () => {
  describe('moveSnake', () => {
    const initialSnake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    describe('basic movement', () => {
      it('should move snake RIGHT', () => {
        const { newSnake, collision } = moveSnake(initialSnake, 'RIGHT', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 11, y: 10 });
        expect(newSnake.length).toBe(initialSnake.length);
      });

      it('should move snake LEFT', () => {
        const { newSnake, collision } = moveSnake(initialSnake, 'LEFT', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 9, y: 10 });
      });

      it('should move snake UP', () => {
        const { newSnake, collision } = moveSnake(initialSnake, 'UP', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 10, y: 9 });
      });

      it('should move snake DOWN', () => {
        const { newSnake, collision } = moveSnake(initialSnake, 'DOWN', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 10, y: 11 });
      });
    });

    describe('pass-through mode', () => {
      it('should wrap around when going through right wall', () => {
        const snakeAtEdge: Position[] = [
          { x: GRID_SIZE - 1, y: 10 },
          { x: GRID_SIZE - 2, y: 10 },
        ];
        const { newSnake, collision } = moveSnake(snakeAtEdge, 'RIGHT', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 0, y: 10 });
      });

      it('should wrap around when going through left wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
        ];
        const { newSnake, collision } = moveSnake(snakeAtEdge, 'LEFT', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: GRID_SIZE - 1, y: 10 });
      });

      it('should wrap around when going through top wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
        ];
        const { newSnake, collision } = moveSnake(snakeAtEdge, 'UP', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 10, y: GRID_SIZE - 1 });
      });

      it('should wrap around when going through bottom wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 10, y: GRID_SIZE - 1 },
          { x: 10, y: GRID_SIZE - 2 },
        ];
        const { newSnake, collision } = moveSnake(snakeAtEdge, 'DOWN', 'pass-through');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: 10, y: 0 });
      });
    });

    describe('walls mode', () => {
      it('should detect collision with right wall', () => {
        const snakeAtEdge: Position[] = [
          { x: GRID_SIZE - 1, y: 10 },
          { x: GRID_SIZE - 2, y: 10 },
        ];
        const { collision } = moveSnake(snakeAtEdge, 'RIGHT', 'walls');
        expect(collision).toBe(true);
      });

      it('should detect collision with left wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
        ];
        const { collision } = moveSnake(snakeAtEdge, 'LEFT', 'walls');
        expect(collision).toBe(true);
      });

      it('should detect collision with top wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
        ];
        const { collision } = moveSnake(snakeAtEdge, 'UP', 'walls');
        expect(collision).toBe(true);
      });

      it('should detect collision with bottom wall', () => {
        const snakeAtEdge: Position[] = [
          { x: 10, y: GRID_SIZE - 1 },
          { x: 10, y: GRID_SIZE - 2 },
        ];
        const { collision } = moveSnake(snakeAtEdge, 'DOWN', 'walls');
        expect(collision).toBe(true);
      });

      it('should allow movement away from wall', () => {
        const snakeAtEdge: Position[] = [
          { x: GRID_SIZE - 1, y: 10 },
          { x: GRID_SIZE - 2, y: 10 },
        ];
        const { newSnake, collision } = moveSnake(snakeAtEdge, 'UP', 'walls');
        expect(collision).toBe(false);
        expect(newSnake[0]).toEqual({ x: GRID_SIZE - 1, y: 9 });
      });
    });

    describe('self-collision detection', () => {
      it('should detect self collision when snake hits its body', () => {
        const snakeWithLoop: Position[] = [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
        ];
        const { collision } = moveSnake(snakeWithLoop, 'DOWN', 'pass-through');
        expect(collision).toBe(true);
      });

      it('should not detect collision with tail (tail moves)', () => {
        const snake: Position[] = [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ];
        const { collision } = moveSnake(snake, 'RIGHT', 'pass-through');
        expect(collision).toBe(false);
      });
    });
  });

  describe('checkFoodCollision', () => {
    it('should return true when head is at food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 5 };
      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('should return false when head is not at food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 10, y: 10 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });

    it('should return false when only x matches', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 10 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });

    it('should return false when only y matches', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 10, y: 5 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('growSnake', () => {
    it('should add one segment to the snake', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      const grownSnake = growSnake(snake);
      expect(grownSnake.length).toBe(snake.length + 1);
    });

    it('should add segment at the tail position', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      const grownSnake = growSnake(snake);
      expect(grownSnake[grownSnake.length - 1]).toEqual({ x: 8, y: 10 });
    });

    it('should not modify the original snake', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ];
      const originalLength = snake.length;
      growSnake(snake);
      expect(snake.length).toBe(originalLength);
    });
  });

  describe('calculateSpeed', () => {
    it('should return initial speed for score 0', () => {
      expect(calculateSpeed(0)).toBe(INITIAL_SPEED);
    });

    it('should decrease speed as score increases', () => {
      const speedAt0 = calculateSpeed(0);
      const speedAt100 = calculateSpeed(100);
      expect(speedAt100).toBeLessThan(speedAt0);
    });

    it('should not go below minimum speed', () => {
      const speedAtHighScore = calculateSpeed(10000);
      expect(speedAtHighScore).toBeGreaterThanOrEqual(MIN_SPEED);
    });

    it('should decrease by 5ms for every 50 points', () => {
      const speedAt50 = calculateSpeed(50);
      expect(speedAt50).toBe(INITIAL_SPEED - 5);
      
      const speedAt100 = calculateSpeed(100);
      expect(speedAt100).toBe(INITIAL_SPEED - 10);
    });
  });
});
