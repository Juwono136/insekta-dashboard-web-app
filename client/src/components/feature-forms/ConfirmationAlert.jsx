import { FiAlertTriangle } from "react-icons/fi";

const ConfirmationAlert = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 animate-fade-in">
      <div className="bg-white shadow-2xl border border-red-100 rounded-xl p-6 max-w-xs text-center transform scale-100 transition-all ring-1 ring-gray-100">
        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiAlertTriangle size={24} />
        </div>
        <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn btn-xs btn-ghost flex-1">
            Batal
          </button>
          <button onClick={onConfirm} className="btn btn-xs btn-error text-white flex-1">
            Ya
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationAlert;
