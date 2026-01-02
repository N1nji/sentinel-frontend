import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        transition-opacity
      "
    >
      <div
        className="
          w-full max-w-sm
          bg-white dark:bg-slate-900
          rounded-xl shadow-xl
          p-6
          animate-fade-in
          border border-slate-200 dark:border-slate-800
        "
      >
        {/* HEADER */}
        <div className="flex items-start gap-3">
          <div
            className={`
              p-2 rounded-lg
              ${
                danger
                  ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              }
            `}
          >
            {danger ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-md text-sm font-medium
              border border-slate-300 dark:border-slate-700
              text-slate-700 dark:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors
            "
          >
            <XCircle size={14} />
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`
              inline-flex items-center gap-2
              px-4 py-2 rounded-md text-sm font-medium text-white
              transition-colors
              ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            <CheckCircle2 size={14} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
