import { act } from '@testing-library/react';

/**
 * Stable utilities for testing scroll behavior
 */

/**
 * Simulates a scroll event on an element with proper timing
 * @param element The element to scroll
 * @param scrollTop The target scroll position
 */
export const simulateScroll = async (element: HTMLElement, scrollTop: number) => {
  await act(async () => {
    // Set the scroll position
    Object.defineProperty(element, 'scrollTop', {
      writable: true,
      configurable: true,
      value: scrollTop
    });
    
    // Dispatch the scroll event
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    
    // Wait for any async updates
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

/**
 * Waits for scroll position to stabilize
 * @param element The element being scrolled
 * @param expectedScrollTop The expected final scroll position
 * @param timeout Maximum time to wait in ms
 */
export const waitForScrollPosition = async (
  element: HTMLElement,
  expectedScrollTop: number,
  timeout = 1000
) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (element.scrollTop === expectedScrollTop) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return false;
};

/**
 * Mocks requestAnimationFrame for synchronous testing
 */
export const mockRequestAnimationFrame = () => {
  const originalRAF = window.requestAnimationFrame;
  
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  };
  
  return () => {
    window.requestAnimationFrame = originalRAF;
  };
};

/**
 * Sets up a stable scroll container for testing
 * @param height Container height
 * @param scrollHeight Total scrollable height
 */
export const setupScrollContainer = (height: number, scrollHeight: number) => {
  const container = document.createElement('div');
  
  Object.defineProperties(container, {
    clientHeight: {
      writable: true,
      configurable: true,
      value: height
    },
    scrollHeight: {
      writable: true,
      configurable: true,
      value: scrollHeight
    },
    scrollTop: {
      writable: true,
      configurable: true,
      value: 0
    }
  });
  
  return container;
};