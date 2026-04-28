import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSubtitle as setSubtitleAction } from '../store/slices/headerSlice';

interface HeaderContextValue {
  subtitle: string;
  setSubtitle: (text: string) => void;
}

/**
 * Noop wrapper. Se mantiene para no cambiar App.tsx; el estado del header ahora
 * vive en Redux y se accede vía `useHeader`.
 */
export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useHeader = (): HeaderContextValue => {
  const dispatch = useAppDispatch();
  const subtitle = useAppSelector((s) => s.header.subtitle);

  const setSubtitle = useCallback(
    (text: string) => dispatch(setSubtitleAction(text)),
    [dispatch]
  );

  return { subtitle, setSubtitle };
};
