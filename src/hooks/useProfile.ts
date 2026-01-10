import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "@/lib/api";
import type { UserProfile, UserSettings } from "@/types";

export function useProfile() {
  const { call } = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already fetched to prevent infinite loops
  const hasFetchedRef = useRef(false);
  // Track retry count to limit retries on error
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  const fetchProfile = useCallback(
    async (isRetry = false) => {
      // If this is a retry, check if we've exceeded max retries
      if (isRetry) {
        retryCountRef.current += 1;
        if (retryCountRef.current > MAX_RETRIES) {
          console.warn("Max retries exceeded for profile fetch");
          return;
        }
      } else {
        // Reset retry count for manual refetch
        retryCountRef.current = 0;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await call<UserProfile>("/api/users/profile");

        if (response.success && response.data) {
          setProfile(response.data);
          retryCountRef.current = 0; // Reset on success
        } else {
          setError(response.error || "Failed to fetch profile");
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  const updateSettings = useCallback(
    async (settings: Partial<UserSettings>) => {
      try {
        const response = await call<UserSettings>("/api/users/settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        });

        if (response.success && response.data) {
          setProfile((prev) =>
            prev ? { ...prev, settings: response.data! } : null
          );
          return { success: true };
        }
        return { success: false, error: response.error };
      } catch (err) {
        return { success: false, error: "Failed to update settings" };
      }
    },
    [call]
  );

  // Only fetch once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: () => fetchProfile(false), // Manual refetch resets retry count
    updateSettings,
  };
}
