import React from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div>
      <div onClick={onClose}>Close</div>
      <div>{children}</div>
    </div>
  );
};

export default Modal;
