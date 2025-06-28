export interface Guide {
  id: string;
  title: string;
  url: string;
  content: string;
  dateAdded: Date;
  dateModified: Date;
  size: number;
  author?: string;
  gameTitle?: string;
}

export interface Bookmark {
  id: string;
  guideId: string;
  line: number;
  position: number;
  title: string;
  note?: string;
  dateCreated: Date;
}

export interface ReadingProgress {
  guideId: string;
  line: number;
  position: number;
  percentage: number;
  lastRead: Date;
}

export interface GuideCollection {
  guides: Guide[];
  bookmarks: Bookmark[];
  progress: ReadingProgress[];
  exportDate: Date;
  version: string;
}

export interface GuideMetadata {
  title: string;
  author?: string;
  gameTitle?: string;
  contentPreview: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
