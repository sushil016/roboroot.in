import apiClient from "@/lib/api-client";
import { createLegalAcceptance } from "@/features/legal/constants";

export type CookiePreferences = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentSource = "COOKIE_BANNER" | "COOKIE_SETTINGS";

export const legalApi = {
  recordCookiePreferences: async (
    preferences: CookiePreferences,
    source: CookieConsentSource,
  ): Promise<void> => {
    await apiClient.post("/api/legal/consents/cookies", { preferences, source });
  },

  recordOAuthAcceptance: async (): Promise<void> => {
    await apiClient.post("/api/legal/consents/oauth", createLegalAcceptance());
  },

  claimAnonymousConsents: async (): Promise<void> => {
    await apiClient.post("/api/legal/consents/claim");
  },
};
