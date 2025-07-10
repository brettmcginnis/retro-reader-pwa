import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';

// Mock animations for Headless UI
mockAnimationsApi();

// Ensure proper DOM setup for React 19 and React Testing Library compatibility
global.IS_REACT_ACT_ENVIRONMENT = true;

// Fix for Headless UI focus issue with happy-dom and track focus state
if (typeof window !== 'undefined' && window.HTMLElement) {
  // Track the currently focused element
  let currentFocusedElement: Element | null = null;
  
  // Override document.activeElement to return our tracked element
  Object.defineProperty(document, 'activeElement', {
    get: function() {
      return currentFocusedElement || document.body;
    },
    configurable: true
  });
  
  const focusDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'focus');
  
  // If focus has a getter, we need to delete it first and redefine it
  if (focusDescriptor && focusDescriptor.get) {
    delete window.HTMLElement.prototype.focus;
  }
  
  // Define a proper focus implementation
  Object.defineProperty(window.HTMLElement.prototype, 'focus', {
    value: function(this: HTMLElement) {
      // Update the currently focused element
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const element = this;
      currentFocusedElement = element;
      
      // Dispatch focus events
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(focusEvent);
    },
    writable: true,
    configurable: true
  });
  
  // Also implement blur to clear focus
  const blurDescriptor = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'blur');
  if (blurDescriptor && blurDescriptor.get) {
    delete window.HTMLElement.prototype.blur;
  }
  
  Object.defineProperty(window.HTMLElement.prototype, 'blur', {
    value: function(this: HTMLElement) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const element = this;
      if (currentFocusedElement === element) {
        currentFocusedElement = null;
      }
      
      const blurEvent = new FocusEvent('blur', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(blurEvent);
    },
    writable: true,
    configurable: true
  });
}

// Set up a proper container for React Testing Library
if (typeof document !== 'undefined') {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
}

// Simulate autofocus behavior for elements with autoFocus attribute
if (typeof window !== 'undefined') {
  // Override createElement to handle autofocus
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);
    
    // For input elements, we need to handle autofocus after they're added to DOM
    if (tagName.toLowerCase() === 'input') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const el = this;
        originalSetAttribute.call(el, name, value);
        
        // If autofocus is set and element is in DOM, focus it
        if (name === 'autofocus' && el.isConnected) {
          // Use setTimeout to ensure React has finished rendering
          setTimeout(() => {
            (el as HTMLElement).focus();
          }, 0);
        }
      };
    }
    
    return element;
  };
  
  // Also handle React's autoFocus prop by observing DOM mutations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check for autofocus attribute
          if (node.hasAttribute('autofocus')) {
            setTimeout(() => node.focus(), 0);
          }
          // Also check child elements
          const autofocusElements = node.querySelectorAll('[autofocus]');
          autofocusElements.forEach((el) => {
            setTimeout(() => (el as HTMLElement).focus(), 0);
          });
        }
      });
    });
  });
  
  // Start observing the document body for changes
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Mock IndexedDB
const mockIDBKeyRange = {
  bound: jest.fn(),
  only: jest.fn(),
  lowerBound: jest.fn(),
  upperBound: jest.fn(),
};

// Mock IDBRequest
class MockIDBRequest extends EventTarget {
  result: IDBDatabase | undefined;
  error: DOMException | null = null;
  source: IDBObjectStore | IDBIndex | IDBCursor | null = null;
  transaction: IDBTransaction | null = null;
  readyState: 'pending' | 'done' = 'pending';
  
  constructor() {
    super();
  }
  
  onsuccess: ((this: IDBRequest, ev: Event) => void) | null = null;
  onerror: ((this: IDBRequest, ev: Event) => void) | null = null;
}

// Mock IDBDatabase
class MockIDBDatabase extends EventTarget {
  name = 'test-db';
  version = 1;
  objectStoreNames = { contains: jest.fn(), item: jest.fn(), length: 0 };
  
  createObjectStore = jest.fn();
  deleteObjectStore = jest.fn();
  transaction = jest.fn();
  close = jest.fn();
}

// Mock IDBObjectStore
class MockIDBObjectStore {
  name = 'test-store';
  keyPath = null;
  indexNames = { contains: jest.fn(), item: jest.fn(), length: 0 };
  transaction = null;
  autoIncrement = false;
  
  add = jest.fn();
  clear = jest.fn();
  count = jest.fn();
  createIndex = jest.fn();
  delete = jest.fn();
  deleteIndex = jest.fn();
  get = jest.fn();
  getAll = jest.fn();
  getAllKeys = jest.fn();
  getKey = jest.fn();
  index = jest.fn();
  openCursor = jest.fn();
  openKeyCursor = jest.fn();
  put = jest.fn();
}

// Mock IDBTransaction
class MockIDBTransaction extends EventTarget {
  db = new MockIDBDatabase();
  durability = 'default';
  error = null;
  mode = 'readonly';
  objectStoreNames = { contains: jest.fn(), item: jest.fn(), length: 0 };
  
  abort = jest.fn();
  commit = jest.fn();
  objectStore = jest.fn(() => new MockIDBObjectStore());
  
  onabort: ((this: IDBTransaction, ev: Event) => void) | null = null;
  oncomplete: ((this: IDBTransaction, ev: Event) => void) | null = null;
  onerror: ((this: IDBTransaction, ev: Event) => void) | null = null;
}

// Global mocks
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn(() => {
      const request = new MockIDBRequest();
      setTimeout(() => {
        request.result = new MockIDBDatabase();
        request.readyState = 'done';
        if (request.onsuccess) {
          request.onsuccess.call(request, new Event('success'));
        }
      }, 0);
      return request;
    }),
    deleteDatabase: jest.fn(() => new MockIDBRequest()),
  },
  writable: true,
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: mockIDBKeyRange,
  writable: true,
});

Object.defineProperty(window, 'IDBRequest', {
  value: MockIDBRequest,
  writable: true,
});

Object.defineProperty(window, 'IDBDatabase', {
  value: MockIDBDatabase,
  writable: true,
});

Object.defineProperty(window, 'IDBTransaction', {
  value: MockIDBTransaction,
  writable: true,
});

Object.defineProperty(window, 'IDBObjectStore', {
  value: MockIDBObjectStore,
  writable: true,
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve({
      scope: '/retro-reader-pwa/',
      updateViaCache: 'none',
      active: null,
      installing: null,
      waiting: null,
    })),
  },
  writable: true,
});