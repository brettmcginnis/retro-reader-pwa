import { create } from 'zustand';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmationActions {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

type ConfirmationStore = ConfirmationState & ConfirmationActions;

export const useConfirmationStore = create<ConfirmationStore>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,

  showConfirmation: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options,
        resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolve } = get();
    if (resolve) {
      resolve(true);
    }
    set({
      isOpen: false,
      options: null,
      resolve: null,
    });
  },

  handleCancel: () => {
    const { resolve } = get();
    if (resolve) {
      resolve(false);
    }
    set({
      isOpen: false,
      options: null,
      resolve: null,
    });
  },
}));