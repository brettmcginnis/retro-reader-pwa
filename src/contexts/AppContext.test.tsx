import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from './AppContext';
import { useApp } from './useApp';

// Test component to access context values
const TestComponent = () => {
  const { 
    navigationTargetLine, 
    setNavigationTargetLine,
    currentView,
    setCurrentView,
    currentGuideId,
    setCurrentGuideId,
    theme,
    toggleTheme
  } = useApp();
  
  return (
    <div>
      <div data-testid="navigation-target">{navigationTargetLine ?? 'null'}</div>
      <div data-testid="current-view">{currentView}</div>
      <div data-testid="current-guide">{currentGuideId ?? 'null'}</div>
      <div data-testid="theme">{theme}</div>
      <button onClick={() => setNavigationTargetLine(42)}>Set Navigation Target</button>
      <button onClick={() => setNavigationTargetLine(null)}>Clear Navigation Target</button>
      <button onClick={() => setCurrentView('reader')}>Switch to Reader</button>
      <button onClick={() => setCurrentGuideId('test-guide')}>Set Guide ID</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Navigation Target Line', () => {
    it('should have initial navigation target as null', () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('navigation-target')).toHaveTextContent('null');
    });

    it('should update navigation target line when set', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await user.click(screen.getByText('Set Navigation Target'));
      expect(screen.getByTestId('navigation-target')).toHaveTextContent('42');
    });

    it('should clear navigation target line when set to null', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      // Set a value first
      await user.click(screen.getByText('Set Navigation Target'));
      expect(screen.getByTestId('navigation-target')).toHaveTextContent('42');

      // Clear it
      await user.click(screen.getByText('Clear Navigation Target'));
      expect(screen.getByTestId('navigation-target')).toHaveTextContent('null');
    });
  });

  describe('Existing Context Values', () => {
    it('should have initial current view as library', () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('current-view')).toHaveTextContent('library');
    });

    it('should update current view', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await user.click(screen.getByText('Switch to Reader'));
      expect(screen.getByTestId('current-view')).toHaveTextContent('reader');
    });

    it('should have initial guide ID as null', () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('current-guide')).toHaveTextContent('null');
    });

    it('should update guide ID', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await user.click(screen.getByText('Set Guide ID'));
      expect(screen.getByTestId('current-guide')).toHaveTextContent('test-guide');
    });

    it('should load theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should toggle theme and save to localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      
      await user.click(screen.getByText('Toggle Theme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
      
      await user.click(screen.getByText('Toggle Theme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('Multiple Components', () => {
    const AnotherTestComponent = () => {
      const { navigationTargetLine } = useApp();
      return <div data-testid="another-navigation-target">{navigationTargetLine ?? 'null'}</div>;
    };

    it('should share state between multiple components', async () => {
      const user = userEvent.setup();
      
      render(
        <AppProvider>
          <TestComponent />
          <AnotherTestComponent />
        </AppProvider>
      );

      expect(screen.getByTestId('navigation-target')).toHaveTextContent('null');
      expect(screen.getByTestId('another-navigation-target')).toHaveTextContent('null');

      await user.click(screen.getByText('Set Navigation Target'));
      
      expect(screen.getByTestId('navigation-target')).toHaveTextContent('42');
      expect(screen.getByTestId('another-navigation-target')).toHaveTextContent('42');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useApp is used outside of AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const ComponentOutsideProvider = () => {
        useApp();
        return null;
      };

      expect(() => {
        render(<ComponentOutsideProvider />);
      }).toThrow('useApp must be used within an AppProvider');

      // Restore console.error
      console.error = originalError;
    });
  });
});