"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getUserFriendlyError } from "@/lib/errors";

type AlertOptions = {
  title?: string;
  confirmText?: string;
};

type AlertState = {
  title: string;
  message: string;
  confirmText: string;
  resolve?: () => void;
};

type AlertContextValue = {
  /** Pass a string or any caught error — technical messages are shown in plain language. */
  showAlert: (message: string | unknown, options?: AlertOptions) => Promise<void>;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const showAlert = useCallback((message: string | unknown, options?: AlertOptions) => {
    const needsNormalization =
      message instanceof Error ||
      typeof message !== "string" ||
      /prisma|invocation|cannot reach|failed to fetch|HTTP error|localhost:\d+|pnpm --filter|ExceptionHandler/i.test(
        String(message),
      );

    const friendly = needsNormalization
      ? getUserFriendlyError(message)
      : typeof message === "string"
        ? message
        : getUserFriendlyError(message);

    return new Promise<void>((resolve) => {
      setAlertState({
        title: options?.title ?? (needsNormalization ? "Something went wrong" : "Heads up"),
        message: friendly,
        confirmText: options?.confirmText ?? "Got it",
        resolve,
      });
    });
  }, []);

  const handleDismiss = useCallback(() => {
    setAlertState((prev) => {
      prev?.resolve?.();
      return null;
    });
  }, []);

  const value = useMemo(() => ({ showAlert }), [showAlert]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nativeAlert = window.alert;
    window.alert = (message?: string) => {
      const normalized =
        typeof message === "string"
          ? message
          : message === undefined || message === null
          ? ""
          : String(message);
      void showAlert(normalized);
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {alertState ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-sm rounded-3xl border border-brand-mist bg-white p-6 text-center shadow-2xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-brand">{alertState.title}</p>
              <p className="mt-3 text-base text-brand-dark">{alertState.message}</p>
              <button
                autoFocus
                onClick={handleDismiss}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {alertState.confirmText}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

