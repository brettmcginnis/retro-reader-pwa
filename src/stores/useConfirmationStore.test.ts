import { act } from '@testing-library/react';
import { useConfirmationStore } from './useConfirmationStore';

describe('useConfirmationStore', () => {
  beforeEach(() => {
    useConfirmationStore.setState({
      isOpen: false,
      options: null,
      resolve: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.options).toBeNull();
      expect(state.resolve).toBeNull();
    });
  });

  describe('showConfirmation', () => {
    it('should open dialog with options and return a promise', async () => {
      const options = {
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'Yes',
        cancelText: 'No',
      };

      let promiseResolved = false;

      act(() => {
        const promise = useConfirmationStore.getState().showConfirmation(options);
        promise.then(() => {
          promiseResolved = true;
        });
      });

      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.options).toEqual(options);
      expect(state.resolve).toBeDefined();
      expect(promiseResolved).toBe(false);
    });
  });

  describe('handleConfirm', () => {
    it('should resolve promise with true and close dialog', async () => {
      const options = {
        title: 'Test',
        message: 'Confirm?',
      };

      let resolvedValue: boolean | undefined;

      act(() => {
        const promise = useConfirmationStore.getState().showConfirmation(options);
        promise.then((value) => {
          resolvedValue = value;
        });
      });

      act(() => {
        useConfirmationStore.getState().handleConfirm();
      });

      // Wait for promise to resolve
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(resolvedValue).toBe(true);
      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.options).toBeNull();
      expect(state.resolve).toBeNull();
    });

    it('should handle confirm when no resolve function exists', () => {
      act(() => {
        useConfirmationStore.setState({
          isOpen: true,
          options: { title: 'Test', message: 'Test' },
          resolve: null,
        });
      });

      // Should not throw
      act(() => {
        useConfirmationStore.getState().handleConfirm();
      });

      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  describe('handleCancel', () => {
    it('should resolve promise with false and close dialog', async () => {
      const options = {
        title: 'Test',
        message: 'Cancel?',
      };

      let resolvedValue: boolean | undefined;

      act(() => {
        const promise = useConfirmationStore.getState().showConfirmation(options);
        promise.then((value) => {
          resolvedValue = value;
        });
      });

      act(() => {
        useConfirmationStore.getState().handleCancel();
      });

      // Wait for promise to resolve
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(resolvedValue).toBe(false);
      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.options).toBeNull();
      expect(state.resolve).toBeNull();
    });

    it('should handle cancel when no resolve function exists', () => {
      act(() => {
        useConfirmationStore.setState({
          isOpen: true,
          options: { title: 'Test', message: 'Test' },
          resolve: null,
        });
      });

      // Should not throw
      act(() => {
        useConfirmationStore.getState().handleCancel();
      });

      const state = useConfirmationStore.getState();
      expect(state.isOpen).toBe(false);
    });
  });
});