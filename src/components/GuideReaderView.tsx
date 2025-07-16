import React, { useState } from 'react';

import { Guide } from '../stores/useGuideStore';
import { Bookmark } from '../stores/useBookmarkStore';
import { useGuideScroll } from '../hooks/useGuideScroll';
import { useBookmarkUI } from '../hooks/useBookmarkUI';
import { useGuideSearch } from '../hooks/useGuideSearch';

import { GuideContent } from './GuideContent';
import { TopNavigationBar } from './TopNavigationBar';
import { SimpleBottomNavigation } from './SimpleBottomNavigation';
import { NavigationModal } from './NavigationModal';
import { BookmarksOverlay } from './BookmarksOverlay';
import { BookmarkModal } from './BookmarkModal';
import { FloatingProgressIndicator } from './FloatingProgressIndicator';
import { GuideSearchBar } from './GuideSearchBar';

interface GuideReaderViewProps {
  guide: Guide;
  lines: string[];
  totalLines: number;
  isLoading: boolean;
  searchQuery: string;
  bookmarks: Bookmark[];
  currentLine: number;
  fontSize: number;
  zoomLevel: number;
  onSearch: (query: string) => void;
  onAddBookmark: (line: number, title: string, note?: string) => Promise<boolean>;
  onSetAsCurrentPosition: (line: number) => Promise<boolean>;
  onJumpToCurrentPosition: () => void;
  onScrollingStateChange: (isScrolling: boolean) => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
  onDeleteBookmark: (id: string) => Promise<void>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onRefreshBookmarks: () => Promise<void>;
}

const GuideReaderViewComponent: React.FC<GuideReaderViewProps> = ({
  guide,
  lines,
  totalLines,
  isLoading,
  searchQuery,
  bookmarks,
  currentLine,
  fontSize,
  zoomLevel,
  onSearch,
  onAddBookmark,
  onSetAsCurrentPosition,
  onJumpToCurrentPosition,
  onScrollingStateChange,
  onFontSizeChange,
  onZoomChange,
  onDeleteBookmark,
  onUpdateBookmark,
  onRefreshBookmarks
}) => {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  
  // Use custom hooks for scroll management
  const {
    containerRef,
    contentRef,
    visibleRange,
    showFloatingProgress,
    lineHeight,
    scrollToLine,
    handleScroll
  } = useGuideScroll({
    totalLines,
    currentLine,
    fontSize,
    zoomLevel,
    isLoading,
    onScrollingStateChange
  });

  // Use custom hook for bookmark UI
  const {
    showBookmarkModal,
    bookmarkLine,
    bookmarkTitle,
    bookmarkNote,
    showBookmarksOverlay,
    bookmarkedLines,
    setBookmarkTitle,
    setBookmarkNote,
    setShowBookmarksOverlay,
    handleLineDoubleClick,
    handleSaveBookmark,
    handleDeleteBookmark,
    handleAddBookmarkFromOverlay,
    handleUpdateBookmark,
    handleSetBookmarkLineAsCurrentPosition,
    closeBookmarkModal,
    openBookmarksOverlay
  } = useBookmarkUI({
    lines,
    bookmarks,
    onAddBookmark,
    onDeleteBookmark,
    onUpdateBookmark,
    onSetAsCurrentPosition,
    onRefreshBookmarks
  });

  // Use custom hook for search
  const {
    showSearch,
    searchResults,
    toggleSearch,
    handleJumpToResult
  } = useGuideSearch({
    lines,
    searchQuery
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
        <div className="text-lg text-retro-600 dark:text-retro-400">Loading guide...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-retro-50 dark:bg-retro-950">
      <TopNavigationBar
        guideTitle={guide.title}
        currentLine={currentLine}
        totalLines={totalLines}
        fontSize={fontSize}
        zoomLevel={zoomLevel}
        searchQuery={searchQuery}
        isSearching={showSearch}
        onSearch={onSearch}
        onSearchToggle={toggleSearch}
        onFontSizeChange={onFontSizeChange}
        onZoomChange={onZoomChange}
      />

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-retro-50 dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700">
          <GuideSearchBar
            searchQuery={searchQuery}
            searchResults={searchResults}
            onSearch={onSearch}
            onJumpToResult={(line) => handleJumpToResult(line, scrollToLine)}
          />
        </div>
      )}

      <GuideContent
        containerRef={containerRef}
        contentRef={contentRef}
        lines={lines}
        visibleRange={visibleRange}
        currentLine={currentLine}
        lineHeight={lineHeight}
        totalLines={totalLines}
        fontSize={fontSize}
        zoomLevel={zoomLevel}
        searchQuery={searchQuery}
        bookmarkedLines={bookmarkedLines}
        isLoading={isLoading}
        onScroll={handleScroll}
        onLineClick={handleLineDoubleClick}
        scrollToLine={scrollToLine}
      />

      <BookmarkModal
        isOpen={showBookmarkModal}
        line={bookmarkLine}
        title={bookmarkTitle}
        note={bookmarkNote}
        onTitleChange={setBookmarkTitle}
        onNoteChange={setBookmarkNote}
        onSave={handleSaveBookmark}
        onSetAsCurrentPosition={handleSetBookmarkLineAsCurrentPosition}
        onClose={closeBookmarkModal}
      />

      <NavigationModal
        isOpen={showNavigationModal}
        currentLine={currentLine}
        totalLines={totalLines}
        onNavigate={scrollToLine}
        onClose={() => setShowNavigationModal(false)}
        onJumpToCurrentPosition={onJumpToCurrentPosition}
      />

      <BookmarksOverlay
        isOpen={showBookmarksOverlay}
        guide={guide}
        currentPositionBookmark={bookmarks.find(b => b.isCurrentPosition)}
        sortedBookmarks={bookmarks.filter(b => !b.isCurrentPosition).sort((a, b) => a.line - b.line)}
        lineCount={totalLines}
        onClose={() => setShowBookmarksOverlay(false)}
        onGotoLine={scrollToLine}
        onAddBookmark={handleAddBookmarkFromOverlay}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      <SimpleBottomNavigation
        onNavigate={() => setShowNavigationModal(true)}
        onBookmarks={openBookmarksOverlay}
        disabled={isLoading}
      />

      {/* Floating Progress Indicator - Only on mobile */}
      <FloatingProgressIndicator
        currentLine={currentLine}
        totalLines={totalLines}
        isVisible={showFloatingProgress}
      />
    </div>
  );
};

GuideReaderViewComponent.displayName = 'GuideReaderView';

export const GuideReaderView = React.memo(GuideReaderViewComponent);
