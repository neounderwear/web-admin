import { useState } from "#app";

export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  duration: number;
}

const toastState = () => useState<ToastMessage[]>("toasts", () => []);

export const useToast = () => {
  const toasts = toastState();
  const dismissToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const showToast = (message: string, type: ToastMessage["type"] = "info", duration: number = 3000, title?: string) => {
    const id = Date.now();
    let toastTitle: string;
    if (title) {
      toastTitle = title;
    } else {
      switch (type) {
        case "success":
          toastTitle = "Berhasil!";
          break;
        case "error":
          toastTitle = "Gagal";
          break;
        case "warning":
          toastTitle = "Peringatan";
          break;
        case "info":
        default:
          toastTitle = "Info";
          break;
      }
    }

    toasts.value.push({ id, message, type, duration, title: toastTitle });

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    showToast(message, "success", duration);
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showToast(message, "info", duration);
  };

  const showWarning = (message: string, duration: number = 5000) => {
    showToast(message, "warning", duration);
  };

  const showError = (error: unknown, duration: number = 5000) => {
    let message = "An unknown error occurred.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    showToast(message, "error", duration);
  };

  return {
    toasts,
    showToast,
    dismissToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
