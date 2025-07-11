import React from 'react';
import Button from './Button';

interface FeedbackModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const typeStyles = {
  success: 'text-green-700 bg-green-50 border-green-200',
  error: 'text-destructive bg-destructive/10 border-destructive/20',
  info: 'text-blue-700 bg-blue-50 border-blue-200',
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, message, onClose, type = 'info' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className={`bg-card border rounded-lg shadow-xl w-full max-w-sm p-6 text-center ${typeStyles[type]}`}>
        <div className="mb-4 text-base">{message}</div>
        <Button onClick={onClose} className="w-full mt-2">OK</Button>
      </div>
    </div>
  );
};

export default FeedbackModal;
