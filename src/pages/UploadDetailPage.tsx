import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useUploads } from "@/hooks/useUploads";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { LogLevel } from "@/types";
import {
  FileText,
  AlertCircle,
  AlertTriangle,
  Info,
  Layers,
  RefreshCw,
  ArrowLeft,
  Trash2,
  Loader2,
  Clock,
  BarChart3,
  Search,
  X,
} from "lucide-react";

const levelColors = {
  ERROR: "bg-red-500",
  WARN: "bg-amber-500",
  INFO: "bg-blue-500",
  DEBUG: "bg-gray-500",
  UNKNOWN: "bg-slate-400",
};

const levelIcons = {
  ERROR: AlertCircle,
  WARN: AlertTriangle,
  INFO: Info,
  DEBUG: Layers,
  UNKNOWN: FileText,
};

export function UploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentUpload,
    groups,
    groupsPagination,
    detailLoading,
    detailError,
    fetchUploadDetail,
    loadMoreGroups,
    clearDetail,
    deleteUpload,
    deleting,
    searchUpload,
  } = useUploads();

  const [levelFilter, setLevelFilter] = useState<LogLevel | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch on mount
  useEffect(() => {
    if (id) {
      clearDetail();
      fetchUploadDetail(id);
    }
    return () => clearDetail();
  }, [id]);

  // Search or filter
  const handleSearch = async () => {
    if (!id) return;
    setIsFiltering(true);

    if (searchQuery.trim() || levelFilter) {
      await searchUpload(
        id,
        searchQuery.trim() || undefined,
        levelFilter || undefined
      );
    } else {
      await fetchUploadDetail(id);
    }
    setIsFiltering(false);
  };

  // Refetch when filter changes
  const handleFilterChange = async (value: string) => {
    const newLevel = value === "all" ? "" : (value as LogLevel);
    setLevelFilter(newLevel);
    setIsFiltering(true);
    if (id) {
      if (searchQuery.trim() || newLevel) {
        await searchUpload(
          id,
          searchQuery.trim() || undefined,
          newLevel || undefined
        );
      } else {
        await fetchUploadDetail(id);
      }
    }
    setIsFiltering(false);
  };

  // Clear search
  const handleClearSearch = async () => {
    setSearchQuery("");
    setLevelFilter("");
    setIsFiltering(true);
    if (id) {
      await fetchUploadDetail(id);
    }
    setIsFiltering(false);
  };

  const handleDelete = async () => {
    if (!id) return;

    const result = await deleteUpload(id);
    if (result.success) {
      toast.success("Upload deleted");
      navigate("/uploads");
    } else {
      toast.error(result.error || "Failed to delete upload");
    }
    setShowDeleteDialog(false);
  };

  const handleLoadMore = () => {
    if (id) {
      loadMoreGroups(id, levelFilter || undefined);
    }
  };

  // Loading state
  if (detailLoading && !currentUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/uploads">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error state
  if (detailError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/uploads">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{detailError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => id && fetchUploadDetail(id)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentUpload) {
    return null;
  }

  const totalLogs = Object.values(currentUpload.levelCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link to="/uploads">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {currentUpload.originalFilename || currentUpload.filename}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Uploaded {formatDate(currentUpload.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                id && fetchUploadDetail(id, levelFilter || undefined)
              }
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting === id}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Lines</p>
              <p className="text-2xl font-bold">
                {currentUpload.totalLines.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Patterns Found</p>
              <p className="text-2xl font-bold">
                {currentUpload.patternsFound || groups.length}
              </p>
            </CardContent>
          </Card>
          <Card
            className={
              currentUpload.levelCounts.ERROR > 0 ? "border-red-500/30" : ""
            }
          >
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-red-500">
                {currentUpload.levelCounts.ERROR.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-amber-500">
                {currentUpload.levelCounts.WARN.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Log Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Bar */}
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
              {Object.entries(currentUpload.levelCounts).map(
                ([level, count]) => {
                  const percentage =
                    totalLogs > 0 ? (count / totalLogs) * 100 : 0;
                  if (percentage === 0) return null;
                  return (
                    <div
                      key={level}
                      className={`${
                        levelColors[level as keyof typeof levelColors]
                      } transition-all`}
                      style={{ width: `${percentage}%` }}
                      title={`${level}: ${count} (${percentage.toFixed(1)}%)`}
                    />
                  );
                }
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              {Object.entries(currentUpload.levelCounts).map(
                ([level, count]) => (
                  <div key={level} className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-3 w-3 rounded ${
                        levelColors[level as keyof typeof levelColors]
                      }`}
                    />
                    <span className="text-muted-foreground">{level}:</span>
                    <span className="font-medium">
                      {count.toLocaleString()}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Log Groups */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Log Patterns</h2>
              <p className="text-sm text-muted-foreground">
                Similar log entries grouped by pattern
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-[200px] pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSearch}
                disabled={detailLoading}
              >
                <Search className="h-4 w-4" />
              </Button>
              {(searchQuery || levelFilter) && (
                <Button variant="ghost" size="icon" onClick={handleClearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Select
                value={levelFilter || "all"}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="ERROR">Errors</SelectItem>
                  <SelectItem value="WARN">Warnings</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(detailLoading && groups.length === 0) || isFiltering ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Layers className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No patterns found
                  {levelFilter ? ` for ${levelFilter} level` : ""}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const Icon = levelIcons[group.level] || FileText;
                return (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                            group.level === "ERROR"
                              ? "bg-red-500/10"
                              : group.level === "WARN"
                              ? "bg-amber-500/10"
                              : group.level === "INFO"
                              ? "bg-blue-500/10"
                              : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              group.level === "ERROR"
                                ? "text-red-500"
                                : group.level === "WARN"
                                ? "text-amber-500"
                                : group.level === "INFO"
                                ? "text-blue-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p
                            className="text-sm font-medium leading-relaxed"
                            title={group.messageSample}
                          >
                            {group.messageSample}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant={
                                group.level === "ERROR"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {group.level}
                            </Badge>
                            <span className="font-medium">
                              {group.count} occurrences
                            </span>
                            <span>•</span>
                            <span>First: {formatDate(group.firstSeenAt)}</span>
                            <span>•</span>
                            <span>Last: {formatDate(group.lastSeenAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Load more */}
              {groupsPagination && groupsPagination.hasMore && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                  disabled={detailLoading}
                >
                  {detailLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load more patterns</>
                  )}
                </Button>
              )}

              {groupsPagination && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing {groups.length} of {groupsPagination.total} patterns
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Upload?</DialogTitle>
            <DialogDescription>
              This will permanently delete "
              {currentUpload.originalFilename || currentUpload.filename}" and
              all its analysis data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting === id}
            >
              {deleting === id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
