import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/tailwind.css';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);