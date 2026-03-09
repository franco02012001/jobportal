'use client';

import { useEffect, useId } from 'react';

export interface DialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close (e.g. overlay click or escape) */
  onClose: () => void;
  /** Dialog title (also used for aria-labelledby) */
  title: string;
  /** Main content of the dialog */
  children: React.ReactNode;
  /** Optional footer (e.g. Cancel / Confirm buttons). Omit for content-only dialogs. */
  footer?: React.ReactNode;
  /** Max width class. Default: max-w-md */
  maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl';
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
}: DialogProps) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={id}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} rounded-xl border border-slate-200 bg-white p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={id} className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <div className="mt-3 text-sm text-slate-600">{children}</div>
        {footer != null && <div className="mt-6 flex flex-wrap gap-3">{footer}</div>}
      </div>
    </div>
  );
}
