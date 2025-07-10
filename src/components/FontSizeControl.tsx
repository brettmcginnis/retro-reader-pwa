import React from 'react';
import { Button } from './Button';

interface FontSizeControlProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  fontSize,
  onFontSizeChange,
  minSize = 10,
  maxSize = 24
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-retro-700 dark:text-retro-300">Font Size</span>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= minSize}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <span className="text-lg">−</span>
        </Button>
        <span className="text-sm text-retro-700 dark:text-retro-300 w-12 text-center font-medium">
          {fontSize}px
        </span>
        <Button
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= maxSize}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <span className="text-lg">+</span>
        </Button>
      </div>
    </div>
  );
};