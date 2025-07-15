import { render, screen } from '@testing-library/react';
import { AppContentView } from './AppContentView';

// Mock the child components
jest.mock('../containers/GuideLibraryContainer', () => ({
  GuideLibraryContainer: () => <div data-testid="guide-library">Guide Library</div>
}));

jest.mock('./GuideReader', () => ({
  GuideReader: ({ guideId }: { guideId: string }) => (
    <div data-testid="guide-reader">
      Guide Reader: {guideId}
    </div>
  )
}));


describe('AppContentView', () => {
  const defaultProps = {
    currentGuideId: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('View Rendering', () => {
    it('should render GuideLibrary when currentGuideId is null', () => {
      render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
    });

    it('should render GuideReader when currentGuideId is provided', () => {
      render(
        <AppContentView 
          currentGuideId="test-guide-1"
        />
      );
      
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      expect(screen.getByText('Guide Reader: test-guide-1')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-library')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle switching between views', () => {
      const { rerender } = render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          currentGuideId="test-guide-1"
        />
      );
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          currentGuideId={null}
        />
      );
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
    });

    it('should handle changing guide IDs', () => {
      const { rerender } = render(
        <AppContentView 
          currentGuideId="test-guide-1"
        />
      );
      
      expect(screen.getByText('Guide Reader: test-guide-1')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          currentGuideId="test-guide-2"
        />
      );
      expect(screen.getByText('Guide Reader: test-guide-2')).toBeInTheDocument();
    });
  });
});