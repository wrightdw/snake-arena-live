import React from 'react';
import { GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Blocks, Zap } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        variant={currentMode === 'walls' ? 'neon' : 'outline'}
        onClick={() => onModeChange('walls')}
        disabled={disabled}
        className="min-w-[140px]"
      >
        <Blocks className="w-4 h-4 mr-2" />
        Walls
      </Button>
      <Button
        variant={currentMode === 'pass-through' ? 'neon-cyan' : 'outline'}
        onClick={() => onModeChange('pass-through')}
        disabled={disabled}
        className="min-w-[140px]"
      >
        <Zap className="w-4 h-4 mr-2" />
        Pass-Through
      </Button>
    </div>
  );
};
