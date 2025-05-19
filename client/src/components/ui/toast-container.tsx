import { useEffect, useState } from "react";
import { ShoppingBag, AlertCircle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info" | "cart";
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Subscribe to custom toast events
  useEffect(() => {
    const handleToast = (event: CustomEvent<Toast>) => {
      const newToast = {
        id: Math.random().toString(36).substring(2, 9),
        ...event.detail,
      };
      
      setToasts((prev) => [...prev, newToast]);
      
      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('show-toast' as any, handleToast);
    
    return () => {
      window.removeEventListener('show-toast' as any, handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "toast flex items-center gap-2 px-4 py-3 rounded-md shadow-lg max-w-xs",
            {
              "bg-success text-white": toast.variant === "success",
              "bg-destructive text-white": toast.variant === "error",
              "bg-primary text-white": toast.variant === "cart" || toast.variant === "default",
              "bg-blue-500 text-white": toast.variant === "info",
            }
          )}
        >
          {toast.variant === "success" && <Check size={18} />}
          {toast.variant === "error" && <AlertCircle size={18} />}
          {toast.variant === "cart" && <ShoppingBag size={18} />}
          {toast.variant === "info" && <Info size={18} />}
          
          <div className="flex-1">
            <div className="font-medium">{toast.title}</div>
            {toast.description && <div className="text-sm">{toast.description}</div>}
          </div>
          
          <button onClick={() => removeToast(toast.id)} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Custom function to show toast
export const showToast = (toast: Omit<Toast, "id">) => {
  const event = new CustomEvent('show-toast', {
    detail: toast,
  });
  window.dispatchEvent(event as any);
};

export default ToastContainer;
