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
  title: string;
  note?: string;
  dateCreated: Date;
  isCurrentPosition?: boolean;
}

export interface ScreenSettings {
  fontSize: number;
  zoomLevel: number;
}


export interface GuideCollection {
  guides: Guide[];
  bookmarks: Bookmark[];
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

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
