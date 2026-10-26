import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className={`floating-toast ${toast.type || "info"} animate-fade-in`}>
      <div className="toast-icon">
        {isSuccess && <CheckCircle2 size={16} className="text-emerald" />}
        {isError && <AlertCircle size={16} className="text-rose" />}
        {!isSuccess && !isError && <Info size={16} className="text-primary" />}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button type="button" className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
