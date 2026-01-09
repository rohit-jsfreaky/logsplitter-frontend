import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { apiCall } from "@/lib/api";
import type { UserPermissions } from "@/types";

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  email: string | undefined;
  permissions: UserPermissions | null;
  permissionsLoading: boolean;
  refreshPermissions: () => Promise<void>;
  getToken: () => Promise<string | null>;
  hasFeature: (feature: string) => boolean;
  checkLimit: (limit: string) => {
    allowed: boolean;
    remaining: number;
    max: number;
    used: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!isSignedIn) {
      setPermissions(null);
      return;
    }

    try {
      setPermissionsLoading(true);
      const template = import.meta.env.VITE_CLERK_JWT_TEMPLATE as
        | string
        | undefined;
      const token = await getToken(template ? { template } : undefined);

      const response = await apiCall<UserPermissions>(
        "/api/users/permissions",
        { token }
      );

      if (response.success && response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setPermissionsLoading(false);
    }
  }, [isSignedIn, getToken]);

  // Fetch permissions when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchPermissions();
    }
  }, [isLoaded, isSignedIn, fetchPermissions]);

  const getTokenWrapper = useCallback(async () => {
    try {
      const template = import.meta.env.VITE_CLERK_JWT_TEMPLATE as
        | string
        | undefined;
      return await getToken(template ? { template } : undefined);
    } catch {
      return null;
    }
  }, [getToken]);

  const hasFeature = useCallback(
    (feature: string) => {
      return permissions?.features?.[feature] ?? false;
    },
    [permissions]
  );

  const checkLimit = useCallback(
    (limit: string) => {
      const limitData = permissions?.limits?.[limit];
      if (!limitData) {
        return { allowed: true, remaining: Infinity, max: -1, used: 0 };
      }
      return {
        allowed: limitData.remaining > 0 || limitData.max === -1,
        remaining: limitData.remaining,
        max: limitData.max,
        used: limitData.used,
      };
    },
    [permissions]
  );

  const value = useMemo<AuthContextType>(() => {
    return {
      isLoaded,
      isSignedIn,
      userId,
      email: user?.primaryEmailAddress?.emailAddress,
      permissions,
      permissionsLoading,
      refreshPermissions: fetchPermissions,
      getToken: getTokenWrapper,
      hasFeature,
      checkLimit,
    };
  }, [
    isLoaded,
    isSignedIn,
    userId,
    user,
    permissions,
    permissionsLoading,
    fetchPermissions,
    getTokenWrapper,
    hasFeature,
    checkLimit,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAppAuth must be used within AuthProvider");
  return context;
}
