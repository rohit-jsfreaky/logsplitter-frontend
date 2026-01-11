import { useState, useCallback, useRef, useEffect } from "react";
import { useApi } from "@/lib/api";
import type { LogLevel } from "@/types";

// ============================================
// Types
// ============================================

export interface LevelCounts {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
  UNKNOWN: number;
}

export interface Upload {
  id: string;
  filename: string;
  originalFilename?: string;
  totalLines: number;
  patternsFound: number;
  levelCounts: LevelCounts;
  createdAt: string;
}

export interface LogGroup {
  id: string;
  fingerprint: string;
  level: LogLevel;
  messageSample: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// Hook
// ============================================

export function useUploads() {
  const { call } = useApi();
  const hasFetchedRef = useRef(false);

  // List state
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail state
  const [currentUpload, setCurrentUpload] = useState<Upload | null>(null);
  const [groups, setGroups] = useState<LogGroup[]>([]);
  const [groupsPagination, setGroupsPagination] = useState<Pagination | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Deleting state
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch uploads list
  const fetchUploads = useCallback(
    async (limit = 20, offset = 0) => {
      try {
        setLoading(true);
        setError(null);

        const response = await call<{
          uploads: Upload[];
          pagination: Pagination;
        }>(`/api/uploads?limit=${limit}&offset=${offset}`);

        if (response.success && response.data) {
          if (offset === 0) {
            setUploads(response.data.uploads);
          } else {
            setUploads((prev) => [...prev, ...response.data!.uploads]);
          }
          setPagination(response.data.pagination);
        } else {
          setError(response.error || "Failed to fetch uploads");
        }
      } catch {
        setError("Failed to fetch uploads");
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  // Fetch upload detail
  const fetchUploadDetail = useCallback(
    async (id: string, level?: LogLevel, limit = 50, offset = 0) => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        let url = `/api/uploads/${id}?limit=${limit}&offset=${offset}`;
        if (level) {
          url += `&level=${level}`;
        }

        const response = await call<{
          upload: Upload;
          groups: LogGroup[];
          pagination: Pagination;
        }>(url);

        if (response.success && response.data) {
          setCurrentUpload(response.data.upload);
          if (offset === 0) {
            setGroups(response.data.groups);
          } else {
            setGroups((prev) => [...prev, ...response.data!.groups]);
          }
          setGroupsPagination(response.data.pagination);
          return { success: true };
        } else {
          setDetailError(response.error || "Failed to fetch upload details");
          return { success: false, error: response.error };
        }
      } catch {
        setDetailError("Failed to fetch upload details");
        return { success: false, error: "Failed to fetch upload details" };
      } finally {
        setDetailLoading(false);
      }
    },
    [call]
  );

  // Delete upload
  const deleteUpload = useCallback(
    async (id: string) => {
      try {
        setDeleting(id);

        const response = await call<{ deleted: boolean }>(
          `/api/uploads/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.success) {
          setUploads((prev) => prev.filter((u) => u.id !== id));
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      } catch {
        return { success: false, error: "Failed to delete upload" };
      } finally {
        setDeleting(null);
      }
    },
    [call]
  );

  // Search within upload
  const searchUpload = useCallback(
    async (
      uploadId: string,
      query?: string,
      level?: LogLevel,
      limit = 50,
      offset = 0
    ) => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const body: Record<string, unknown> = { limit, offset };
        if (query) body.query = query;
        if (level) body.level = level;

        const response = await call<{
          uploadId: string;
          results: LogGroup[];
          pagination: Pagination;
        }>(`/api/uploads/${uploadId}/search`, {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (response.success && response.data) {
          if (offset === 0) {
            setGroups(response.data.results);
          } else {
            setGroups((prev) => [...prev, ...response.data!.results]);
          }
          setGroupsPagination(response.data.pagination);
          return { success: true };
        } else {
          setDetailError(response.error || "Search failed");
          return { success: false, error: response.error };
        }
      } catch {
        setDetailError("Search failed");
        return { success: false, error: "Search failed" };
      } finally {
        setDetailLoading(false);
      }
    },
    [call]
  );

  // Load more uploads
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasMore && !loading) {
      fetchUploads(pagination.limit, pagination.offset + pagination.limit);
    }
  }, [pagination, loading, fetchUploads]);

  // Load more groups
  const loadMoreGroups = useCallback(
    (id: string, level?: LogLevel) => {
      if (groupsPagination && groupsPagination.hasMore && !detailLoading) {
        fetchUploadDetail(
          id,
          level,
          groupsPagination.limit,
          groupsPagination.offset + groupsPagination.limit
        );
      }
    },
    [groupsPagination, detailLoading, fetchUploadDetail]
  );

  // Clear detail state
  const clearDetail = useCallback(() => {
    setCurrentUpload(null);
    setGroups([]);
    setGroupsPagination(null);
    setDetailError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUploads();
    }
  }, [fetchUploads]);

  return {
    // List
    uploads,
    pagination,
    loading,
    error,
    fetchUploads,
    loadMore,
    // Detail
    currentUpload,
    groups,
    groupsPagination,
    detailLoading,
    detailError,
    fetchUploadDetail,
    loadMoreGroups,
    clearDetail,
    // Search
    searchUpload,
    // Delete
    deleteUpload,
    deleting,
  };
}
