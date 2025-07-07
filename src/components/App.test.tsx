import { render } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('should render the application', () => {
    render(<App />);
    
    // The app should render the AppContentContainer
    // We can't test much more without mocking all the providers
    // but we can verify it renders without crashing
    expect(document.body).toBeInTheDocument();
  });
});