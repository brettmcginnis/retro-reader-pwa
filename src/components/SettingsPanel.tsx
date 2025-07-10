import React from 'react';
import { FontSizeControl } from './FontSizeControl';
import { ZoomControl } from './ZoomControl';

interface SettingsPanelProps {
  fontSize: number;
  zoomLevel: number;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  fontSize,
  zoomLevel,
  onFontSizeChange,
  onZoomChange
}) => {
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <FontSizeControl
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
      <ZoomControl
        zoomLevel={zoomLevel}
        onZoomChange={onZoomChange}
      />
    </div>
  );
};