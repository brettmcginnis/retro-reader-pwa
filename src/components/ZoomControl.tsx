import React from 'react';
import { Button } from './Button';

interface ZoomControlProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomLevel,
  onZoomChange,
  minZoom = 0.5,
  maxZoom = 2,
  zoomStep = 0.1
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-retro-700 dark:text-retro-300">Zoom</span>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onZoomChange(zoomLevel - zoomStep)}
          disabled={zoomLevel <= minZoom}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <span className="text-lg">−</span>
        </Button>
        <span className="text-sm text-retro-700 dark:text-retro-300 w-12 text-center font-medium">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          onClick={() => onZoomChange(zoomLevel + zoomStep)}
          disabled={zoomLevel >= maxZoom}
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <span className="text-lg">+</span>
        </Button>
        <Button
          onClick={() => onZoomChange(1)}
          disabled={zoomLevel === 1}
          variant="secondary"
          size="sm"
          className="px-3 h-10 ml-2"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};