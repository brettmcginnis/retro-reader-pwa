import { useToastStore } from '../stores/useToastStore';
import { useConfirmationStore, ConfirmationOptions } from '../stores/useConfirmationStore';

export const useToast = () => {
  const { showToast } = useToastStore();
  const { showConfirmation } = useConfirmationStore();

  const confirm = async (options: ConfirmationOptions): Promise<boolean> => {
    return showConfirmation(options);
  };

  return {
    showToast,
    confirm,
  };
}; 