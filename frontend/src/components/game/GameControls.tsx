import React from 'react';
import { Direction } from '@/types/game';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onDirectionChange,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-fit mx-auto mt-4 md:hidden">
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('UP')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
      <div />
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('LEFT')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('DOWN')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('RIGHT')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
    </div>
  );
};
