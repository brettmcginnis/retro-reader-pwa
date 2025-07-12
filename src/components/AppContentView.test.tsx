import { render, screen } from '@testing-library/react';
import { AppContentView } from './AppContentView';

// Mock the child components
jest.mock('./GuideLibrary', () => ({
  GuideLibrary: () => <div data-testid="guide-library">Guide Library</div>
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
    currentView: 'library' as const,
    currentGuideId: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('View Rendering', () => {
    it('should render GuideLibrary when currentView is library', () => {
      render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
    });

    it('should render GuideReader when currentView is reader and guideId is provided', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuideId="test-guide-1"
        />
      );
      
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      expect(screen.getByText('Guide Reader: test-guide-1')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-library')).not.toBeInTheDocument();
    });


    it('should fallback to GuideLibrary when no guideId in reader view', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuideId={null}
        />
      );
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {

    it('should handle default case by rendering GuideLibrary', () => {
      // Cast to unknown then to the expected type to simulate an unexpected view value
      const props = {
        ...defaultProps,
        currentView: 'unexpected' as unknown as 'library' | 'reader'
      };
      
      render(<AppContentView {...props} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle switching between views', () => {
      const { rerender } = render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuideId="test-guide-1"
        />
      );
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          {...defaultProps} 
          currentView="library"
        />
      );
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
    });
  });
});