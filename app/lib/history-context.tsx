"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type HistoryContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openHistory: () => void;
  closeHistory: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openHistory = () => setIsOpen(true);
  const closeHistory = () => setIsOpen(false);

  return (
    <HistoryContext.Provider value={{ isOpen, setIsOpen, openHistory, closeHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within HistoryProvider");
  }
  return context;
}
