import React, { useRef, useEffect } from 'react';
import { Position, GameStatus } from '@/types/game';
import { GRID_SIZE } from '@/hooks/useGameLogic';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  status: GameStatus;
  cellSize?: number;
  isSpectator?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  snake,
  food,
  status,
  cellSize = 20,
  isSpectator = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = GRID_SIZE * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 15%, 18%)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    
    // Food glow
    const foodGradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, cellSize);
    foodGradient.addColorStop(0, 'hsla(0, 100%, 60%, 1)');
    foodGradient.addColorStop(0.5, 'hsla(0, 100%, 60%, 0.5)');
    foodGradient.addColorStop(1, 'hsla(0, 100%, 60%, 0)');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, cellSize, 0, Math.PI * 2);
    ctx.fill();

    // Food core
    ctx.fillStyle = 'hsl(0, 100%, 60%)';
    ctx.beginPath();
    ctx.arc(foodX, foodY, cellSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const isHead = index === 0;

      // Snake glow (stronger for head)
      ctx.shadowColor = 'hsl(142, 100%, 50%)';
      ctx.shadowBlur = isHead ? 15 : 8;

      // Snake body
      const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      if (isHead) {
        gradient.addColorStop(0, 'hsl(142, 100%, 60%)');
        gradient.addColorStop(1, 'hsl(142, 100%, 45%)');
      } else {
        const brightness = Math.max(40, 55 - index * 2);
        gradient.addColorStop(0, `hsl(142, 100%, ${brightness}%)`);
        gradient.addColorStop(1, `hsl(142, 100%, ${brightness - 10}%)`);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Reset shadow
      ctx.shadowBlur = 0;

      // Head eyes
      if (isHead) {
        ctx.fillStyle = 'hsl(220, 20%, 6%)';
        const eyeSize = cellSize / 6;
        const eyeOffset = cellSize / 4;
        ctx.beginPath();
        ctx.arc(x + cellSize / 2 - eyeOffset, y + cellSize / 2 - eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + cellSize / 2 + eyeOffset, y + cellSize / 2 - eyeOffset / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Overlay for non-playing states
    if (status !== 'playing' && !isSpectator) {
      ctx.fillStyle = 'hsla(220, 20%, 6%, 0.7)';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
  }, [snake, food, status, cellSize, canvasSize, isSpectator]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border-2 border-primary rounded-lg shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
