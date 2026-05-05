"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

const icons = {
  success: <CheckCircle size={16} className="text-green-600" />,
  error: <AlertCircle size={16} className="text-red-600" />,
  info: <Info size={16} className="text-blue-600" />,
};

const bgColors = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
};

const textColors = {
  success: "text-green-900",
  error: "text-red-900",
  info: "text-blue-900",
};

type Props = {
  toasts: Toast[];
  onRemove: (id: string) => void;
};

export function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(
      () => onRemove(toast.id),
      toast.duration ?? 3000
    );
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 border px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-right-5 ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <span className={`text-sm font-medium ${textColors[toast.type]} flex-1`}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className={`text-${toast.type === "success" ? "green" : toast.type === "error" ? "red" : "blue"}-600 hover:opacity-70 transition-opacity`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
