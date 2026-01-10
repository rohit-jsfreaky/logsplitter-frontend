import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import type { SearchResult, SearchPagination } from "@/hooks/useSearch";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  FileText,
  Search as SearchIcon,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SearchResultsProps {
  results: SearchResult[];
  pagination: SearchPagination | null;
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  query?: string;
}

const levelIcons = {
  ERROR: AlertCircle,
  WARN: AlertTriangle,
  INFO: Info,
  DEBUG: FileText,
  UNKNOWN: FileText,
};

const levelColors = {
  ERROR: "text-red-500",
  WARN: "text-amber-500",
  INFO: "text-blue-500",
  DEBUG: "text-gray-500",
  UNKNOWN: "text-slate-400",
};

export function SearchResults({
  results,
  pagination,
  loading,
  error,
  onLoadMore,
  query,
}: SearchResultsProps) {
  // Empty state - no search yet
  if (!loading && !error && results.length === 0 && !query) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Search your logs</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Enter a search query above to find log patterns across all your
            uploads. You can filter by log level and date range.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading && results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Searching...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No results
  if (results.length === 0 && query) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground">
            No log patterns match "{query}". Try a different search term or
            filter.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Results</span>
          {pagination && (
            <Badge variant="secondary">
              {pagination.total} {pagination.total === 1 ? "result" : "results"}
            </Badge>
          )}
        </CardTitle>
        {query && (
          <CardDescription>Showing results for "{query}"</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result) => {
          const Icon = levelIcons[result.level] || FileText;
          const colorClass =
            levelColors[result.level] || "text-muted-foreground";

          return (
            <Link
              key={result.id}
              to={`/uploads/${result.uploadId}`}
              className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors block"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded ${
                  result.level === "ERROR"
                    ? "bg-red-500/10"
                    : result.level === "WARN"
                    ? "bg-amber-500/10"
                    : "bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p
                  className="text-sm font-medium leading-snug"
                  title={result.messageSample}
                >
                  {result.messageSample}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant={
                      result.level === "ERROR" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {result.level}
                  </Badge>
                  <span className="font-medium">
                    {result.count} occurrences
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {result.filename}
                  </span>
                  <span>•</span>
                  <span>Last seen: {formatDate(result.lastSeenAt)}</span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
            </Link>
          );
        })}

        {/* Load more button */}
        {pagination && pagination.hasMore && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load more results</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
