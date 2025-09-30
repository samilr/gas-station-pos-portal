import React, { createContext, useContext, useState } from 'react';

interface HeaderContextValue {
  subtitle: string;
  setSubtitle: (text: string) => void;
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subtitle, setSubtitle] = useState<string>('');
  return (
    <HeaderContext.Provider value={{ subtitle, setSubtitle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = (): HeaderContextValue => {
  const ctx = useContext(HeaderContext);
  if (!ctx) {
    throw new Error('useHeader debe usarse dentro de HeaderProvider');
  }
  return ctx;
};


