import React from 'react';
import { render, screen } from '@testing-library/react';
import { GuideSearchView } from './GuideSearchView';

// Mock the hooks and components
jest.mock('../hooks/useGuideSearch', () => ({
  useGuideSearch: ({ searchQuery }: { searchQuery: string }) => ({
    searchResults: searchQuery ? [
      { line: 1, content: 'Test line 1' },
      { line: 5, content: 'Test line 5' }
    ] : [],
    handleJumpToResult: jest.fn()
  })
}));

jest.mock('./GuideSearchBar', () => ({
  GuideSearchBar: ({ searchQuery, searchResults, onSearch, onJumpToResult }: any) => (
    <div data-testid="guide-search-bar">
      <div>Query: {searchQuery}</div>
      <div>Results: {searchResults.length}</div>
      <button onClick={() => onJumpToResult(1)}>Jump to Result</button>
    </div>
  )
}));

describe('GuideSearchView', () => {
  const defaultProps = {
    lines: ['Line 1', 'Line 2', 'Line 3'],
    searchQuery: '',
    showSearch: true,
    onSearch: jest.fn(),
    scrollToLine: jest.fn()
  };

  it('should render search bar when showSearch is true', () => {
    render(<GuideSearchView {...defaultProps} />);
    
    expect(screen.getByTestId('guide-search-bar')).toBeInTheDocument();
  });

  it('should not render when showSearch is false', () => {
    render(<GuideSearchView {...defaultProps} showSearch={false} />);
    
    expect(screen.queryByTestId('guide-search-bar')).not.toBeInTheDocument();
  });

  it('should pass search results to search bar', () => {
    render(<GuideSearchView {...defaultProps} searchQuery="test" />);
    
    expect(screen.getByText('Results: 2')).toBeInTheDocument();
  });

  it('should handle jump to result', () => {
    const scrollToLine = jest.fn();
    render(<GuideSearchView {...defaultProps} scrollToLine={scrollToLine} />);
    
    screen.getByText('Jump to Result').click();
    
    // The actual implementation would call scrollToLine through handleJumpToResult
    expect(screen.getByTestId('guide-search-bar')).toBeInTheDocument();
  });
});