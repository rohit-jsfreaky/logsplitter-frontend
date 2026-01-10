import { useState, useCallback, useRef, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useAppAuth } from "@/contexts/AuthContext";
import { FEATURES } from "@/types";

// ============================================
// Types
// ============================================

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  isRevoked: boolean;
}

export interface CreateApiKeyResponse {
  key: {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
  };
  secret: string;
}

// ============================================
// Hook
// ============================================

export function useApiKeys() {
  const { call } = useApi();
  const { hasFeature } = useAppAuth();

  const hasFetchedRef = useRef(false);
  const hasApiAccess = hasFeature(FEATURES.API_ACCESS);

  // State
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    if (!hasApiAccess) {
      setError("Upgrade to access API keys");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await call<{ keys: ApiKey[] }>("/api/users/api-keys");

      if (response.success && response.data?.keys) {
        setKeys(response.data.keys);
      } else {
        setError(response.error || "Failed to fetch API keys");
      }
    } catch {
      setError("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }, [call, hasApiAccess]);

  // Create key
  const createKey = useCallback(
    async (name: string) => {
      if (!hasApiAccess) {
        return { success: false, error: "Upgrade to access API keys" };
      }

      try {
        setCreating(true);
        setCreateError(null);

        const response = await call<CreateApiKeyResponse>(
          "/api/users/api-keys",
          {
            method: "POST",
            body: JSON.stringify({ name }),
          }
        );

        if (response.success && response.data) {
          // Add the new key to the list (without the secret)
          setKeys((prev) => [
            {
              id: response.data!.key.id,
              name: response.data!.key.name,
              prefix: response.data!.key.prefix,
              createdAt: response.data!.key.createdAt,
              isRevoked: false,
            },
            ...prev,
          ]);

          return {
            success: true,
            data: response.data,
          };
        } else {
          setCreateError(response.error || "Failed to create API key");
          return { success: false, error: response.error };
        }
      } catch {
        setCreateError("Failed to create API key");
        return { success: false, error: "Failed to create API key" };
      } finally {
        setCreating(false);
      }
    },
    [call, hasApiAccess]
  );

  // Revoke key
  const revokeKey = useCallback(
    async (keyId: string) => {
      try {
        setRevoking(keyId);

        const response = await call<{ revoked: boolean }>(
          `/api/users/api-keys/${keyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.success) {
          // Remove from list or mark as revoked
          setKeys((prev) => prev.filter((k) => k.id !== keyId));
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      } catch {
        return { success: false, error: "Failed to revoke API key" };
      } finally {
        setRevoking(null);
      }
    },
    [call]
  );

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current && hasApiAccess) {
      hasFetchedRef.current = true;
      fetchKeys();
    }
  }, [fetchKeys, hasApiAccess]);

  return {
    keys,
    loading,
    error,
    fetchKeys,
    createKey,
    creating,
    createError,
    revokeKey,
    revoking,
    hasApiAccess,
  };
}
