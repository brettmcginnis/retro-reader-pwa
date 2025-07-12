import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useConfirmationStore } from '../stores/useConfirmationStore';

export const ConfirmationDialog: React.FC = () => {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmationStore();

  if (!options) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options.title}
      size="sm"
    >
      <div className="mt-2">
        <p className="text-sm text-retro-600 dark:text-retro-400">
          {options.message}
        </p>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <Button variant="secondary" onClick={handleCancel}>
          {options.cancelText || 'Cancel'}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {options.confirmText || 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
};