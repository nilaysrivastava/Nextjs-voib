"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
export default function Modal({
  isOpen,
  onChange,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-panel">
          <p className="eyebrow modal-brand">VOIB / THE LISTENING ROOM</p>
          <Dialog.Title className="modal-title">{title}</Dialog.Title>
          <Dialog.Description className="modal-description">
            {description}
          </Dialog.Description>
          {children}
          <Dialog.Close className="icon-button modal-close" aria-label="Close">
            <FiX size={21} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
