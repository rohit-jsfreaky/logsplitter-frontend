import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import type { TopError } from "@/hooks/useAnalytics";
import { AlertCircle, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TopErrorsListProps {
  errors: TopError[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TopErrorsList({
  errors,
  loading,
  error,
  onRetry,
}: TopErrorsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Top Errors
          </CardTitle>
          <CardDescription>Most frequent error patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded" />
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Top Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Top Errors
          </CardTitle>
          <CardDescription>Most frequent error patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-500/10 p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="font-medium">No errors found!</p>
            <p className="text-sm text-muted-foreground">
              Your logs are looking clean
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Top Errors
        </CardTitle>
        <CardDescription>
          Most frequent error patterns across all uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.map((err, index) => (
          <div
            key={err.id}
            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/10 text-sm font-bold text-red-500">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p
                className="text-sm font-medium truncate"
                title={err.messageSample}
              >
                {err.messageSample}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="destructive" className="text-xs">
                  {err.count} occurrences
                </Badge>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {err.filename}
                </span>
                <span>Last seen: {formatDate(err.lastSeenAt)}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to="/search?level=ERROR">View all errors</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
