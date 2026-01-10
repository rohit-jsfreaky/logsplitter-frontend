import { useState, useCallback, useRef, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useAppAuth } from "@/contexts/AuthContext";
import { FEATURES } from "@/types";

// ============================================
// Types
// ============================================

export interface AnalyticsStats {
  totalUploads: number;
  totalLines: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  totalDebug: number;
  totalPatterns: number;
}

export interface TopError {
  id: string;
  fingerprint: string;
  level: string;
  messageSample: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  filename: string;
}

export interface UploadFrequencyItem {
  date: string;
  uploads: number;
  lines: number;
  errors: number;
}

export interface ErrorTrendItem {
  hour: string;
  errors: number;
  warnings: number;
}

export interface RecentUpload {
  id: string;
  filename: string;
  totalLines: number;
  levelCounts: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
    UNKNOWN: number;
  };
  createdAt: string;
}

// ============================================
// Hook
// ============================================

export function useAnalytics() {
  const { call } = useApi();
  const { hasFeature } = useAppAuth();

  const hasFetchedRef = useRef(false);
  const hasAdvancedAnalytics = hasFeature(FEATURES.ADVANCED_ANALYTICS);

  // State
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [topErrors, setTopErrors] = useState<TopError[]>([]);
  const [topErrorsLoading, setTopErrorsLoading] = useState(false);
  const [topErrorsError, setTopErrorsError] = useState<string | null>(null);

  const [uploadFrequency, setUploadFrequency] = useState<UploadFrequencyItem[]>(
    []
  );
  const [frequencyLoading, setFrequencyLoading] = useState(false);
  const [frequencyError, setFrequencyError] = useState<string | null>(null);

  const [errorTrend, setErrorTrend] = useState<ErrorTrendItem[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await call<AnalyticsStats>("/api/analytics/stats");
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStatsError(response.error || "Failed to fetch stats");
      }
    } catch {
      setStatsError("Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  }, [call]);

  const fetchTopErrors = useCallback(
    async (limit = 10) => {
      try {
        setTopErrorsLoading(true);
        setTopErrorsError(null);
        const response = await call<{ errors: TopError[] }>(
          `/api/analytics/top-errors?limit=${limit}`
        );
        if (response.success && response.data?.errors) {
          setTopErrors(response.data.errors);
        } else {
          setTopErrorsError(response.error || "Failed to fetch top errors");
        }
      } catch {
        setTopErrorsError("Failed to fetch top errors");
      } finally {
        setTopErrorsLoading(false);
      }
    },
    [call]
  );

  const fetchUploadFrequency = useCallback(
    async (days = 30) => {
      if (!hasAdvancedAnalytics) {
        setFrequencyError("Upgrade to access advanced analytics");
        return;
      }
      try {
        setFrequencyLoading(true);
        setFrequencyError(null);
        const response = await call<{ frequency: UploadFrequencyItem[] }>(
          `/api/analytics/upload-frequency?days=${days}`
        );
        if (response.success && response.data?.frequency) {
          setUploadFrequency(response.data.frequency);
        } else {
          setFrequencyError(
            response.error || "Failed to fetch upload frequency"
          );
        }
      } catch {
        setFrequencyError("Failed to fetch upload frequency");
      } finally {
        setFrequencyLoading(false);
      }
    },
    [call, hasAdvancedAnalytics]
  );

  const fetchErrorTrend = useCallback(
    async (hours = 24) => {
      if (!hasAdvancedAnalytics) {
        setTrendError("Upgrade to access advanced analytics");
        return;
      }
      try {
        setTrendLoading(true);
        setTrendError(null);
        const response = await call<{ trend: ErrorTrendItem[] }>(
          `/api/analytics/error-trend?hours=${hours}`
        );
        if (response.success && response.data?.trend) {
          setErrorTrend(response.data.trend);
        } else {
          setTrendError(response.error || "Failed to fetch error trend");
        }
      } catch {
        setTrendError("Failed to fetch error trend");
      } finally {
        setTrendLoading(false);
      }
    },
    [call, hasAdvancedAnalytics]
  );

  const fetchRecent = useCallback(
    async (limit = 10) => {
      try {
        setRecentLoading(true);
        setRecentError(null);
        const response = await call<{ activity: RecentUpload[] }>(
          `/api/analytics/recent?limit=${limit}`
        );
        if (response.success && response.data?.activity) {
          setRecentUploads(response.data.activity);
        } else {
          setRecentError(response.error || "Failed to fetch recent uploads");
        }
      } catch {
        setRecentError("Failed to fetch recent uploads");
      } finally {
        setRecentLoading(false);
      }
    },
    [call]
  );

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchTopErrors(),
      fetchRecent(),
      ...(hasAdvancedAnalytics
        ? [fetchUploadFrequency(), fetchErrorTrend()]
        : []),
    ]);
  }, [
    fetchStats,
    fetchTopErrors,
    fetchRecent,
    fetchUploadFrequency,
    fetchErrorTrend,
    hasAdvancedAnalytics,
  ]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  return {
    // Stats
    stats,
    statsLoading,
    statsError,
    fetchStats,
    // Top Errors
    topErrors,
    topErrorsLoading,
    topErrorsError,
    fetchTopErrors,
    // Upload Frequency (Advanced)
    uploadFrequency,
    frequencyLoading,
    frequencyError,
    fetchUploadFrequency,
    // Error Trend (Advanced)
    errorTrend,
    trendLoading,
    trendError,
    fetchErrorTrend,
    // Recent
    recentUploads,
    recentLoading,
    recentError,
    fetchRecent,
    // Meta
    hasAdvancedAnalytics,
    refetchAll: fetchAll,
  };
}
