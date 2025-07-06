// components/LoginDialogContext.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { LoginDialog } from "@/components/login-dialog";

type LoginDialogContextType = {
  open: () => void;
  close: () => void;
};

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(
  undefined
);

export function useLoginDialog() {
  const ctx = useContext(LoginDialogContext);
  if (!ctx)
    throw new Error("useLoginDialog must be used within LoginDialogProvider");
  return ctx;
}

export function LoginDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <LoginDialogContext.Provider
      value={{ open: openDialog, close: closeDialog }}
    >
      {children}
      <LoginDialog isOpen={open} onClose={closeDialog} />
    </LoginDialogContext.Provider>
  );
}
