import React from 'react';

interface OverlayBackdropProps {
  onClick: () => void;
}

export const OverlayBackdrop: React.FC<OverlayBackdropProps> = ({ onClick }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40"
      onClick={onClick}
    />
  );
};