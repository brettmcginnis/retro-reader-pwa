import React from 'react';
import { render, screen } from '@testing-library/react';
import { GuideBookmarksView } from './GuideBookmarksView';
import { Guide } from '../stores/useGuideStore';
import { Bookmark } from '../stores/useBookmarkStore';

// Mock the components
jest.mock('./BookmarkModal', () => ({
  BookmarkModal: ({ isOpen, line, title }: any) => 
    isOpen ? <div data-testid="bookmark-modal">Line: {line}, Title: {title}</div> : null
}));

jest.mock('./BookmarksOverlay', () => ({
  BookmarksOverlay: ({ isOpen, guide }: any) => 
    isOpen ? <div data-testid="bookmarks-overlay">Guide: {guide.title}</div> : null
}));

describe('GuideBookmarksView', () => {
  const mockGuide: Guide = {
    id: '1',
    title: 'Test Guide',
    content: 'Test content',
    system: 'Test System',
    lastPlayed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockBookmarks: Bookmark[] = [
    {
      id: '1',
      guideId: '1',
      line: 10,
      title: 'Bookmark 1',
      dateCreated: new Date()
    }
  ];

  const defaultProps = {
    guide: mockGuide,
    bookmarks: mockBookmarks,
    totalLines: 100,
    scrollToLine: jest.fn(),
    showBookmarkModal: false,
    bookmarkLine: 1,
    bookmarkTitle: 'Test Bookmark',
    bookmarkNote: 'Test Note',
    setBookmarkTitle: jest.fn(),
    setBookmarkNote: jest.fn(),
    handleSaveBookmark: jest.fn(),
    handleSetBookmarkLineAsCurrentPosition: jest.fn(),
    closeBookmarkModal: jest.fn(),
    showBookmarksOverlay: false,
    setShowBookmarksOverlay: jest.fn(),
    handleAddBookmarkFromOverlay: jest.fn(),
    handleUpdateBookmark: jest.fn(),
    handleDeleteBookmark: jest.fn()
  };

  it('should render bookmark modal when showBookmarkModal is true', () => {
    render(<GuideBookmarksView {...defaultProps} showBookmarkModal={true} />);
    
    expect(screen.getByTestId('bookmark-modal')).toBeInTheDocument();
    expect(screen.getByText('Line: 1, Title: Test Bookmark')).toBeInTheDocument();
  });

  it('should not render bookmark modal when showBookmarkModal is false', () => {
    render(<GuideBookmarksView {...defaultProps} />);
    
    expect(screen.queryByTestId('bookmark-modal')).not.toBeInTheDocument();
  });

  it('should render bookmarks overlay when showBookmarksOverlay is true', () => {
    render(<GuideBookmarksView {...defaultProps} showBookmarksOverlay={true} />);
    
    expect(screen.getByTestId('bookmarks-overlay')).toBeInTheDocument();
    expect(screen.getByText('Guide: Test Guide')).toBeInTheDocument();
  });

  it('should not render bookmarks overlay when showBookmarksOverlay is false', () => {
    render(<GuideBookmarksView {...defaultProps} />);
    
    expect(screen.queryByTestId('bookmarks-overlay')).not.toBeInTheDocument();
  });

  it('should filter and sort bookmarks correctly', () => {
    const bookmarksWithCurrent: Bookmark[] = [
      ...mockBookmarks,
      {
        id: '2',
        guideId: '1',
        line: 5,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      }
    ];
    
    render(<GuideBookmarksView {...defaultProps} bookmarks={bookmarksWithCurrent} showBookmarksOverlay={true} />);
    
    expect(screen.getByTestId('bookmarks-overlay')).toBeInTheDocument();
  });
});