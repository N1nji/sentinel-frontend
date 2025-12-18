interface AlertModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ open, title, message, onClose }: AlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-gray-700 mb-4 whitespace-pre-line">{message}</p>

        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}
