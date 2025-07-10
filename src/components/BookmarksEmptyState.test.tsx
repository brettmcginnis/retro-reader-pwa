import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookmarksEmptyState } from './BookmarksEmptyState';

describe('BookmarksEmptyState', () => {
  it('should render empty state message', () => {
    render(<BookmarksEmptyState />);
    
    expect(screen.getByText('No bookmarks yet')).toBeInTheDocument();
  });

  it('should render instruction text', () => {
    render(<BookmarksEmptyState />);
    
    expect(screen.getByText('Long press on any line to create one')).toBeInTheDocument();
  });

  it('should render bookmark icon', () => {
    const { container } = render(<BookmarksEmptyState />);
    
    const bookmarkIcon = container.querySelector('svg.lucide-bookmark');
    expect(bookmarkIcon).toBeInTheDocument();
  });

  it('should have correct styling', () => {
    const { container } = render(<BookmarksEmptyState />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center', 'py-8', 'text-retro-600');
  });

  it('should render icon with correct size', () => {
    const { container } = render(<BookmarksEmptyState />);
    
    const bookmarkIcon = container.querySelector('svg.lucide-bookmark');
    expect(bookmarkIcon).toHaveClass('w-12', 'h-12', 'mx-auto', 'mb-3', 'opacity-50');
  });
});