/**
 * Shared Config - Local implementation replacing @exyconn/common/shared/config
 */

export const isProd = (): boolean => {
  if (typeof window !== "undefined") {
    return (
      window.location.hostname !== "localhost" &&
      !window.location.hostname.includes("127.0.0.1")
    );
  }
  return import.meta.env.PROD || false;
};

export const isDev = (): boolean => !isProd();
