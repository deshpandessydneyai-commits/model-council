"use client";

import React, { createContext, useContext, useState } from "react";

type SetupModalContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const SetupModalContext = createContext<SetupModalContextType | null>(null);

export function SetupModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SetupModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SetupModalContext.Provider>
  );
}

export function useSetupModal() {
  const context = useContext(SetupModalContext);
  if (!context) {
    throw new Error("useSetupModal must be used within SetupModalProvider");
  }
  return context;
}
