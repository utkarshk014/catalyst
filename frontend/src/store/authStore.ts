// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  apiKey: string | null;
  isSignedIn: boolean;
  organizationName: string | null;
  organizationEmail: string | null;
  organizationSlug: string | null;

  // Actions
  setAuth: (
    apiKey: string,
    orgName: string,
    orgEmail: string,
    orgSlug: string
  ) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      apiKey: null,
      isSignedIn: false,
      organizationName: null,
      organizationEmail: null,
      organizationSlug: null,

      setAuth: (
        apiKey: string,
        orgName: string,
        orgEmail: string,
        orgSlug: string
      ) => {
        set({
          apiKey,
          isSignedIn: true,
          organizationName: orgName,
          organizationEmail: orgEmail,
          organizationSlug: orgSlug,
        });
      },

      clearAuth: () => {
        set({
          apiKey: null,
          isSignedIn: false,
          organizationName: null,
          organizationEmail: null,
          organizationSlug: null,
        });
      },

      logout: () => {
        set({
          apiKey: null,
          isSignedIn: false,
          organizationName: null,
          organizationEmail: null,
          organizationSlug: null,
        });
      },
    }),
    {
      name: "auth-storage", // name of the item in localStorage
      partialize: (state) => ({
        apiKey: state.apiKey,
        isSignedIn: state.isSignedIn,
        organizationName: state.organizationName,
        organizationEmail: state.organizationEmail,
        organizationSlug: state.organizationSlug,
      }),
    }
  )
);
