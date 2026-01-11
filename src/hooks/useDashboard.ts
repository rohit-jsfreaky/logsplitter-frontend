import { useState, useCallback, useRef, useEffect } from "react";
import { useApi } from "@/lib/api";

// ============================================
// Types
// ============================================

export interface DashboardStats {
  totalUploads: number;
  totalLines: number;
  totalPatterns: number;
  errorRate: number;
  avgLinesPerUpload: number;
  levelCounts: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
    UNKNOWN: number;
  };
}

export interface RecentUpload {
  id: string;
  filename: string;
  totalLines: number;
  patternsFound: number;
  levelCounts: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
    UNKNOWN: number;
  };
  createdAt: string;
}

export interface TopError {
  id: string;
  messageSample: string;
  count: number;
  filename: string;
  lastSeenAt: string;
}

export interface UploadActivity {
  date: string;
  uploads: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentUploads: RecentUpload[];
  topErrors: TopError[];
  uploadActivity: UploadActivity[];
}

// ============================================
// Hook
// ============================================

export function useDashboard() {
  const { call } = useApi();
  const hasFetchedRef = useRef(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await call<DashboardData>("/api/dashboard");

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch dashboard data");
      }
    } catch {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [call]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboard();
    }
  }, [fetchDashboard]);

  return {
    data,
    stats: data?.stats ?? null,
    recentUploads: data?.recentUploads ?? [],
    topErrors: data?.topErrors ?? [],
    uploadActivity: data?.uploadActivity ?? [],
    loading,
    error,
    refetch: fetchDashboard,
  };
}
