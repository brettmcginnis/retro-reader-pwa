import { act } from '@testing-library/react';
import { useToastStore } from './useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    // Reset store state
    useToastStore.setState({ toasts: [] });
    
    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should have empty toasts array', () => {
      const state = useToastStore.getState();
      expect(state.toasts).toEqual([]);
    });
  });

  describe('showToast', () => {
    it('should add a success toast', () => {
      act(() => {
        useToastStore.getState().showToast('success', 'Success!', 'Operation completed');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toMatchObject({
        id: expect.stringContaining('toast-'),
        type: 'success',
        title: 'Success!',
        message: 'Operation completed',
        duration: 3000,
      });
    });

    it('should add multiple toasts', () => {
      act(() => {
        useToastStore.getState().showToast('error', 'Error!');
        useToastStore.getState().showToast('info', 'Info');
        useToastStore.getState().showToast('warning', 'Warning!');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);
      expect(state.toasts[0].type).toBe('error');
      expect(state.toasts[1].type).toBe('info');
      expect(state.toasts[2].type).toBe('warning');
    });

    it('should auto-dismiss toast after duration', () => {
      act(() => {
        useToastStore.getState().showToast('info', 'Auto dismiss', undefined, 2000);
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should not auto-dismiss if duration is 0', () => {
      act(() => {
        useToastStore.getState().showToast('info', 'Persistent', undefined, 0);
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('should return unique toast ID', () => {
      let id1: string;
      let id2: string;

      act(() => {
        id1 = useToastStore.getState().showToast('info', 'Toast 1');
        id2 = useToastStore.getState().showToast('info', 'Toast 2');
      });

      expect(id1).not.toBe(id2);
    });
  });

  describe('dismissToast', () => {
    it('should remove specific toast by ID', () => {
      let toastId: string;

      act(() => {
        toastId = useToastStore.getState().showToast('info', 'To be dismissed');
        useToastStore.getState().showToast('success', 'Should remain');
      });

      expect(useToastStore.getState().toasts).toHaveLength(2);

      act(() => {
        useToastStore.getState().dismissToast(toastId);
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].title).toBe('Should remain');
    });

    it('should handle dismissing non-existent toast', () => {
      act(() => {
        useToastStore.getState().showToast('info', 'Test toast');
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      act(() => {
        useToastStore.getState().dismissToast('non-existent-id');
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('dismissAllToasts', () => {
    it('should remove all toasts', () => {
      act(() => {
        useToastStore.getState().showToast('error', 'Error 1');
        useToastStore.getState().showToast('warning', 'Warning 1');
        useToastStore.getState().showToast('success', 'Success 1');
      });

      expect(useToastStore.getState().toasts).toHaveLength(3);

      act(() => {
        useToastStore.getState().dismissAllToasts();
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should handle dismissing when no toasts exist', () => {
      expect(useToastStore.getState().toasts).toHaveLength(0);

      act(() => {
        useToastStore.getState().dismissAllToasts();
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });
});