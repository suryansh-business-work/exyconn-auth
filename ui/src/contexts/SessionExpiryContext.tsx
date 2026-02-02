import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { sessionExpiryEmitter } from "../lib/session-expiry-emitter";

export interface SessionExpiryContextType {
  isSessionExpired: boolean;
  showSessionExpiredModal: () => void;
  resetSessionExpiry: () => void;
  isApiBlocked: boolean;
}

const SessionExpiryContext = createContext<
  SessionExpiryContextType | undefined
>(undefined);

interface SessionExpiryProviderProps {
  children: React.ReactNode;
}

export const SessionExpiryProvider: React.FC<SessionExpiryProviderProps> = ({
  children,
}) => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const hasShownModal = useRef(false);

  const showSessionExpiredModal = useCallback(() => {
    // Ensure modal is shown only once even if multiple API calls fail
    if (!hasShownModal.current) {
      hasShownModal.current = true;
      setIsSessionExpired(true);
    }
  }, []);

  const resetSessionExpiry = useCallback(() => {
    hasShownModal.current = false;
    setIsSessionExpired(false);
    sessionExpiryEmitter.reset();
  }, []);

  // Subscribe to session expiry events from the API interceptor
  useEffect(() => {
    const unsubscribe = sessionExpiryEmitter.subscribe(() => {
      showSessionExpiredModal();
    });

    return () => {
      unsubscribe();
    };
  }, [showSessionExpiredModal]);

  // Block API calls when session is expired
  const isApiBlocked = isSessionExpired;

  const value = React.useMemo(
    () => ({
      isSessionExpired,
      showSessionExpiredModal,
      resetSessionExpiry,
      isApiBlocked,
    }),
    [
      isSessionExpired,
      showSessionExpiredModal,
      resetSessionExpiry,
      isApiBlocked,
    ],
  );

  return (
    <SessionExpiryContext.Provider value={value}>
      {children}
    </SessionExpiryContext.Provider>
  );
};

export const useSessionExpiry = (): SessionExpiryContextType => {
  const context = useContext(SessionExpiryContext);
  if (context === undefined) {
    throw new Error(
      "useSessionExpiry must be used within a SessionExpiryProvider",
    );
  }
  return context;
};
