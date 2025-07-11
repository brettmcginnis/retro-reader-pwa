// ts-prune-ignore-next
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

// ts-prune-ignore-next
export interface Bookmark {
  id: string;
  guideId: string;
  line: number;
  title: string;
  note?: string;
  dateCreated: Date;
  isCurrentPosition?: boolean;
}

// ts-prune-ignore-next
export interface ScreenSettings {
  fontSize: number;
  zoomLevel: number;
}

// ts-prune-ignore-next
export interface ReadingProgress {
  guideId: string;
  line: number;
  percentage: number;
  lastRead: Date;
  fontSize?: number;
  zoomLevel?: number;
  screenSettings?: Record<string, ScreenSettings>;
}

// ts-prune-ignore-next
export interface GuideCollection {
  guides: Guide[];
  bookmarks: Bookmark[];
  progress: ReadingProgress[];
  exportDate: Date;
  version: string;
}

// ts-prune-ignore-next
export interface GuideMetadata {
  title: string;
  author?: string;
  gameTitle?: string;
  contentPreview: string;
}

// ts-prune-ignore-next
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// ts-prune-ignore-next
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
