import '@testing-library/jest-dom';

// Mock IndexedDB
const mockIDBKeyRange = {
  bound: jest.fn(),
  only: jest.fn(),
  lowerBound: jest.fn(),
  upperBound: jest.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn(),
    deleteDatabase: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: mockIDBKeyRange,
  writable: true,
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve()),
  },
  writable: true,
});