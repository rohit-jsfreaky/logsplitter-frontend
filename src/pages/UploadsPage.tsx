import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUploads } from "@/hooks/useUploads";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";

export function UploadsPage() {
  const {
    uploads,
    pagination,
    loading,
    error,
    fetchUploads,
    loadMore,
    deleteUpload,
    deleting,
  } = useUploads();

  const [uploadToDelete, setUploadToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uploadToDelete) return;

    const result = await deleteUpload(uploadToDelete);
    if (result.success) {
      toast.success("Upload deleted");
    } else {
      toast.error(result.error || "Failed to delete upload");
    }
    setUploadToDelete(null);
  };

  // Loading state
  if (loading && uploads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
            <p className="text-muted-foreground">
              View and manage your uploaded log files
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
            <p className="text-muted-foreground">
              View and manage your uploaded log files
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUploads()}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button asChild className="cursor-pointer">
              <Link to="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Link>
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUploads()}
                className="cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!error && uploads.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No uploads yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first log file to get started
              </p>
              <Button asChild className="cursor-pointer">
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Log File
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Uploads list */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <Card
                key={upload.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/uploads/${upload.id}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {upload.filename || upload.originalFilename}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{upload.totalLines.toLocaleString()} lines</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {upload.patternsFound} patterns
                        </span>
                        <span>•</span>
                        <span>{formatDate(upload.createdAt)}</span>
                      </div>
                    </div>

                    {/* Level badges */}
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {upload.levelCounts.ERROR > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {upload.levelCounts.ERROR} errors
                        </Badge>
                      )}
                      {upload.levelCounts.WARN > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-amber-500/10 text-amber-500"
                        >
                          {upload.levelCounts.WARN} warnings
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => setUploadToDelete(upload.id)}
                        disabled={deleting === upload.id}
                      >
                        {deleting === upload.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="cursor-pointer"
                      >
                        <Link to={`/uploads/${upload.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load more */}
            {pagination && pagination.hasMore && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load more uploads</>
                  )}
                </Button>
              </div>
            )}

            {/* Total count */}
            {pagination && (
              <p className="text-xs text-muted-foreground text-center">
                Showing {uploads.length} of {pagination.total} uploads
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={!!uploadToDelete}
        onOpenChange={() => setUploadToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Upload?</DialogTitle>
            <DialogDescription>
              This will permanently delete this log file and all its analysis
              data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadToDelete(null)}
              className="cursor-pointer"
              disabled={deleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer"
              disabled={deleting !== null}
            >
              {deleting !== null ? (
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
