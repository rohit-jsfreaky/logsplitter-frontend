import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { useSearch } from "@/hooks/useSearch";
import type { LogLevel } from "@/types";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    results,
    pagination,
    loading,
    error,
    search,
    loadMore,
    clearSearch,
    filters,
    updateFilters,
    suggestions,
  } = useSearch();

  // Get initial query from URL params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const level = searchParams.get("level") as LogLevel | null;

    if (query || level) {
      const initialFilters = {
        query,
        level: level || undefined,
      };
      updateFilters(initialFilters);
      search(initialFilters);
    }
  }, []); // Only run on mount

  const handleSearch = (newFilters: typeof filters) => {
    updateFilters(newFilters);
    search(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.query) params.set("q", newFilters.query);
    if (newFilters.level) params.set("level", newFilters.level);
    setSearchParams(params);
  };

  const handleClear = () => {
    clearSearch();
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search and filter logs across all your uploads
        </p>
      </div>

      {/* Search Form */}
      <SearchForm
        filters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
        suggestions={suggestions}
        loading={loading}
      />

      {/* Results */}
      <SearchResults
        results={results}
        pagination={pagination}
        loading={loading}
        error={error}
        onLoadMore={loadMore}
        query={filters.query}
      />
    </div>
  );
}
