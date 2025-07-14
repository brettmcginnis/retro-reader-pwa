import React from 'react';
import { Book, Download, Trash2, Calendar, HardDrive } from 'lucide-react';
import { Guide } from '../stores/useGuideStore';
import { Button } from './Button';

interface GuideCardProps {
  guide: Guide;
  onRead: () => void;
  onExport: () => void;
  onDelete: () => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (date: Date) => string;
}

const GuideCardComponent: React.FC<GuideCardProps> = ({ 
  guide, 
  onRead, 
  onExport, 
  onDelete,
  formatFileSize,
  formatDate
}) => {
  return (
    <div className="bg-white dark:bg-retro-900 rounded-lg shadow-sm border border-retro-200 dark:border-retro-700 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-retro-900 dark:text-retro-100 mb-2 line-clamp-2">
        {guide.title}
      </h3>
      
      <p className="text-sm text-retro-600 dark:text-retro-400 mb-4 line-clamp-2">
        {guide.url.startsWith('manual://') ? 'Manual entry' : guide.url}
      </p>
      
      <div className="flex items-center gap-4 text-xs text-retro-500 dark:text-retro-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(guide.dateAdded)}</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" />
          <span>{formatFileSize(guide.size || 0)}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onRead}
          className="flex items-center gap-1"
        >
          <Book className="w-4 h-4" />
          Read
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};

GuideCardComponent.displayName = 'GuideCard';

export const GuideCard = React.memo(GuideCardComponent);