import React, { createContext, useContext, useState, useCallback } from "react";
import { localStorageUtils, STORAGE_KEYS } from "../hooks/useLocalStorage";

export interface OrgOptions {
  mfaEnabled?: boolean;
  mfaRequired?: boolean;
  lastLoginDetails?: boolean;
  showRoleInProfile?: boolean;
}

export interface RolePermission {
  resource: string;
  action: string;
  allowed: boolean;
}

export interface RoleDetails {
  name: string;
  slug: string;
  description?: string;
  permissions: RolePermission[];
  isDefault?: boolean;
  isSystem?: boolean;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  role: string;
  isVerified: boolean;
  profilePicture?: string;
  provider?: string;
  mfaEnabled?: boolean;
  hasPassword?: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  orgOptions?: OrgOptions;
  roleDetails?: RoleDetails;
}

export interface AuthContextType {
  // God authentication (only user data - token is in HTTP-only cookie)
  godUser: UserData | null;
  setGodUser: (
    user: UserData | null | ((prev: UserData | null) => UserData | null),
  ) => void;
  isGodAuthenticated: boolean;
  godLogout: () => void;

  // User authentication (only user data - token is in HTTP-only cookie)
  user: UserData | null;
  setUser: (
    user: UserData | null | ((prev: UserData | null) => UserData | null),
  ) => void;
  isUserAuthenticated: boolean;
  userLogout: () => void;

  // Legacy
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 *
 * TOKENS: Stored ONLY in HTTP-only cookies (set by server)
 * USER DATA: Stored in localStorage for UI state
 *
 * The cookie is the auth mechanism for API calls.
 * localStorage is used for UI state (displaying user info).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // God user data only (token is in HTTP-only cookie)
  const [godUser, setGodUserState] = useState<UserData | null>(() => {
    return localStorageUtils.get<UserData>(STORAGE_KEYS.GOD_USER_DATA);
  });

  // User data only (token is in HTTP-only cookie)
  const [user, setUserState] = useState<UserData | null>(() => {
    return localStorageUtils.get<UserData>(STORAGE_KEYS.USER_DATA);
  });

  const setGodUser = useCallback(
    (
      newUser: UserData | null | ((prev: UserData | null) => UserData | null),
    ) => {
      if (typeof newUser === "function") {
        setGodUserState((prev) => {
          const result = newUser(prev);
          if (result) {
            localStorageUtils.set(STORAGE_KEYS.GOD_USER_DATA, result);
          } else {
            localStorageUtils.remove(STORAGE_KEYS.GOD_USER_DATA);
          }
          return result;
        });
      } else {
        if (newUser) {
          localStorageUtils.set(STORAGE_KEYS.GOD_USER_DATA, newUser);
        } else {
          localStorageUtils.remove(STORAGE_KEYS.GOD_USER_DATA);
        }
        setGodUserState(newUser);
      }
    },
    [],
  );

  const setUser = useCallback(
    (
      newUser: UserData | null | ((prev: UserData | null) => UserData | null),
    ) => {
      if (typeof newUser === "function") {
        setUserState((prev) => {
          const result = newUser(prev);
          if (result) {
            localStorageUtils.set(STORAGE_KEYS.USER_DATA, result);
          } else {
            localStorageUtils.remove(STORAGE_KEYS.USER_DATA);
          }
          return result;
        });
      } else {
        if (newUser) {
          localStorageUtils.set(STORAGE_KEYS.USER_DATA, newUser);
        } else {
          localStorageUtils.remove(STORAGE_KEYS.USER_DATA);
        }
        setUserState(newUser);
      }
    },
    [],
  );

  const godLogout = useCallback(() => {
    // Clear user data from localStorage (cookie is cleared by server)
    localStorageUtils.remove(STORAGE_KEYS.GOD_USER_DATA);
    setGodUserState(null);
  }, []);

  const userLogout = useCallback(() => {
    // Clear user data from localStorage (cookie is cleared by server)
    localStorageUtils.remove(STORAGE_KEYS.USER_DATA);
    setUserState(null);
  }, []);

  const logout = useCallback(() => {
    godLogout();
    userLogout();
  }, [godLogout, userLogout]);

  // Authentication determined by presence of user data
  // (tokens are in HTTP-only cookies, not accessible from JS)
  const isGodAuthenticated = !!godUser;
  const isUserAuthenticated = !!user;
  const isAuthenticated = isGodAuthenticated || isUserAuthenticated;

  const value = React.useMemo(
    () => ({
      godUser,
      setGodUser,
      isGodAuthenticated,
      godLogout,
      user,
      setUser,
      isUserAuthenticated,
      userLogout,
      logout,
      isAuthenticated,
    }),
    [
      godUser,
      setGodUser,
      isGodAuthenticated,
      godLogout,
      user,
      setUser,
      isUserAuthenticated,
      userLogout,
      logout,
      isAuthenticated,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
