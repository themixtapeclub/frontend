'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface MainMenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MainMenuContext = createContext<MainMenuContextType | undefined>(undefined);

export const useMainMenu = () => {
  const context = useContext(MainMenuContext);
  if (!context) {
    throw new Error('useMainMenu must be used within a MainMenuProvider');
  }
  return context;
};

interface MainMenuProviderProps {
  children: ReactNode;
}

export default function MainMenuProvider({ children }: MainMenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => {
    console.log('Provider: Opening menu');
    setIsOpen(true);
  };

  const closeMenu = () => {
    console.log('Provider: Closing menu');
    setIsOpen(false);
  };

  const value = {
    isOpen,
    openMenu,
    closeMenu
  };

  return <MainMenuContext.Provider value={value}>{children}</MainMenuContext.Provider>;
}
