import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import { GameCanvas } from './GameCanvas';
import { GameOverlay } from './GameOverlay';
import { GameControls } from './GameControls';
import { ModeSelector } from './ModeSelector';
import { ScoreDisplay } from './ScoreDisplay';

export const SnakeGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
  } = useGameLogic();

  const isPlaying = gameState.status === 'playing';

  return (
    <div className="flex flex-col items-center gap-6">
      <ModeSelector
        currentMode={gameState.mode}
        onModeChange={setMode}
        disabled={isPlaying}
      />
      
      <ScoreDisplay score={gameState.score} highScore={gameState.highScore} />
      
      <div className="relative">
        <GameCanvas
          snake={gameState.snake}
          food={gameState.food}
          status={gameState.status}
        />
        <GameOverlay
          status={gameState.status}
          score={gameState.score}
          highScore={gameState.highScore}
          mode={gameState.mode}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
        />
      </div>

      <GameControls
        onDirectionChange={setDirection}
        disabled={!isPlaying}
      />

      <div className="text-center text-muted-foreground text-sm space-y-1">
        <p>Use <span className="text-primary">Arrow Keys</span> or <span className="text-primary">WASD</span> to move</p>
        <p>Press <span className="text-secondary">SPACE</span> to pause/resume</p>
      </div>
    </div>
  );
};
