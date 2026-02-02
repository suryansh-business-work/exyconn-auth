import { localStorageUtils, STORAGE_KEYS } from "../hooks/useLocalStorage";

export function getGodAuthToken(): string | null {
  try {
    return localStorageUtils.getString(STORAGE_KEYS.GOD_TOKEN);
  } catch {
    return null;
  }
}
