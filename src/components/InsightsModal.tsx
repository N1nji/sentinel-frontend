// src/components/InsightsModal.tsx
export default function InsightsModal({
  open,
  onClose,
  text,
}: {
  open: boolean;
  onClose: () => void;
  text: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative max-w-2xl w-full bg-white rounded p-4 shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Insights gerados</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto whitespace-pre-wrap">
          {text}
        </div>
      </div>
    </div>
  );
}
