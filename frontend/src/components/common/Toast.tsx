import React from 'react';

export interface ToastProps {
  show: boolean;
  title: string;
  desc?: string;
  hash?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  show,
  title,
  desc,
  hash,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl z-50 flex items-center gap-space-md transition-all duration-300 max-w-lg border border-outline/20">
      <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[18px]">done_all</span>
      </div>
      <div className="flex flex-col flex-1">
        <span className="font-headline-sm text-body-md font-semibold text-inverse-on-surface">
          {title}
        </span>
        {desc && (
          <span className="font-body-sm text-xs text-inverse-on-surface/80 mt-0.5">
            {desc}
          </span>
        )}
        {hash && (
          <span className="font-code-id text-code-id text-inverse-primary mt-0.5">
            {hash}
          </span>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};
