import { useState, useCallback, useEffect, useRef } from "react";
import { useApi } from "@/lib/api";
import type { LogLevel } from "@/types";

// ============================================
// Types
// ============================================

export interface SearchResult {
  id: string;
  fingerprint: string;
  level: LogLevel;
  messageSample: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  uploadId: string;
  filename: string;
  rank?: number;
}

export interface SearchPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  message: string;
  level: LogLevel;
  count: number;
}

export interface SearchFilters {
  query: string;
  level?: LogLevel | "";
  startDate?: string;
  endDate?: string;
}

// ============================================
// Hook
// ============================================

export function useSearch() {
  const { call } = useApi();

  // State
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<SearchPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({ query: "" });
  const hasFetchedSuggestions = useRef(false);

  // Search function
  const search = useCallback(
    async (searchFilters: SearchFilters, offset = 0, limit = 20) => {
      // Allow search if any filter is set: query, level, or date
      if (
        !searchFilters.query?.trim() &&
        !searchFilters.startDate &&
        !searchFilters.level
      ) {
        setResults([]);
        setPagination(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use date search if dates are provided
        const endpoint = searchFilters.startDate
          ? "/api/search/by-date"
          : "/api/search";

        const body: Record<string, unknown> = {
          limit,
          offset,
        };

        if (searchFilters.query) {
          body.query = searchFilters.query;
        }
        if (searchFilters.level) {
          body.level = searchFilters.level;
        }
        if (searchFilters.startDate) {
          body.startDate = searchFilters.startDate;
        }
        if (searchFilters.endDate) {
          body.endDate = searchFilters.endDate;
        }

        const response = await call<{
          results: SearchResult[];
          pagination: SearchPagination;
        }>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (response.success && response.data) {
          if (offset === 0) {
            setResults(response.data.results);
          } else {
            setResults((prev) => [...prev, ...response.data!.results]);
          }
          setPagination(response.data.pagination);
        } else {
          setError(response.error || "Search failed");
        }
      } catch {
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  // Fetch suggestions
  const fetchSuggestions = useCallback(
    async (limit = 10) => {
      try {
        setSuggestionsLoading(true);
        const response = await call<{ suggestions: SearchSuggestion[] }>(
          `/api/search/suggestions?limit=${limit}`
        );

        if (response.success && response.data?.suggestions) {
          setSuggestions(response.data.suggestions);
        }
      } catch {
        // Silently fail for suggestions
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [call]
  );

  // Load more results
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasMore && !loading) {
      search(filters, pagination.offset + pagination.limit);
    }
  }, [pagination, loading, search, filters]);

  // Clear search
  const clearSearch = useCallback(() => {
    setResults([]);
    setPagination(null);
    setError(null);
    setFilters({ query: "" });
  }, []);

  // Update filters and search
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Initial suggestions fetch
  useEffect(() => {
    if (!hasFetchedSuggestions.current) {
      hasFetchedSuggestions.current = true;
      fetchSuggestions();
    }
  }, [fetchSuggestions]);

  return {
    // Results
    results,
    pagination,
    loading,
    error,
    // Search
    search,
    loadMore,
    clearSearch,
    // Filters
    filters,
    updateFilters,
    // Suggestions
    suggestions,
    suggestionsLoading,
    fetchSuggestions,
  };
}
