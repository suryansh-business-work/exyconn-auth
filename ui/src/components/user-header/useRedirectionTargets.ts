import { useMemo } from "react";
import { RedirectionSetting } from "../../types/organization";
import {
  getAvailableRedirectionTargets,
  appendTokenToUrl,
} from "../../utils/redirection";

export interface RedirectionTarget {
  url: string;
  env: string;
  isDefault: boolean;
  tokenAppendedUrl: string;
}

export const useRedirectionTargets = (
  settings: RedirectionSetting[] | undefined,
  userRole: string,
): RedirectionTarget[] => {
  return useMemo(() => {
    const currentOrigin = window.location.origin;
    const targets = getAvailableRedirectionTargets(
      settings,
      userRole,
      currentOrigin,
    );
    const token = localStorage.getItem("authToken") || "";

    // Add token-appended URLs
    return targets.map((target) => ({
      ...target,
      tokenAppendedUrl: appendTokenToUrl(target.url, token),
    }));
  }, [settings, userRole]);
};

export const getEnvLabel = (env: string): string => {
  switch (env) {
    case "development":
      return "Development";
    case "staging":
      return "Staging";
    case "production":
      return "Production";
    default:
      return env;
  }
};

export const getEnvColor = (
  env: string,
): "info" | "warning" | "success" | "default" => {
  switch (env) {
    case "development":
      return "info";
    case "staging":
      return "warning";
    case "production":
      return "success";
    default:
      return "default";
  }
};
