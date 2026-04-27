"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Suspense,
} from "react";
import { LoginModal } from "@/components/auth/login-modal";

interface LoginModalContextType {
  isOpen: boolean;
  openModal: (nextPath?: string) => void;
  closeModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(
  undefined,
);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nextPath, setNextPath] = useState<string | undefined>(undefined);

  const openModal = (path?: string) => {
    setNextPath(path);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setNextPath(undefined);
  };

  return (
    <LoginModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <Suspense fallback={null}>
        <LoginModal
          open={isOpen}
          onOpenChange={setIsOpen}
          nextPath={nextPath}
          triggerLabel="" // No internal trigger
        />
      </Suspense>
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
}
