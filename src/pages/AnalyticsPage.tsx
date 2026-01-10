import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/StatsCard";
import { TopErrorsList } from "@/components/TopErrorsList";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  BarChart3,
  FileText,
  AlertCircle,
  AlertTriangle,
  Info,
  Layers,
  TrendingUp,
  Clock,
  Lock,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export function AnalyticsPage() {
  const {
    stats,
    statsLoading,
    statsError,
    fetchStats,
    topErrors,
    topErrorsLoading,
    topErrorsError,
    fetchTopErrors,
    uploadFrequency,
    frequencyLoading,
    frequencyError,
    errorTrend,
    trendLoading,
    trendError,
    recentUploads,
    recentLoading,
    recentError,
    hasAdvancedAnalytics,
    refetchAll,
  } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and trends from your log data
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Uploads"
          value={stats?.totalUploads ?? 0}
          icon={FileText}
          loading={statsLoading}
        />
        <StatsCard
          title="Total Lines"
          value={stats?.totalLines ?? 0}
          icon={Layers}
          loading={statsLoading}
        />
        <StatsCard
          title="Errors"
          value={stats?.totalErrors ?? 0}
          icon={AlertCircle}
          loading={statsLoading}
          className="border-red-500/20"
        />
        <StatsCard
          title="Patterns Found"
          value={stats?.totalPatterns ?? 0}
          icon={BarChart3}
          loading={statsLoading}
        />
      </div>

      {/* Level breakdown */}
      {stats && !statsLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Errors:</span>
                <span className="font-medium">
                  {stats.totalErrors.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Warnings:</span>
                <span className="font-medium">
                  {stats.totalWarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Info:</span>
                <span className="font-medium">
                  {stats.totalInfo.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-muted-foreground">Debug:</span>
                <span className="font-medium">
                  {stats.totalDebug.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {statsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{statsError}</span>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Errors */}
        <TopErrorsList
          errors={topErrors}
          loading={topErrorsLoading}
          error={topErrorsError}
          onRetry={fetchTopErrors}
        />

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Uploads
            </CardTitle>
            <CardDescription>Latest uploaded log files</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{recentError}</AlertDescription>
              </Alert>
            ) : recentUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No uploads yet.
                  <Link
                    to="/upload"
                    className="text-primary hover:underline ml-1"
                  >
                    Upload a log file
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUploads.slice(0, 5).map((upload) => (
                  <Link
                    key={upload.id}
                    to={`/uploads/${upload.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {upload.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {upload.totalLines.toLocaleString()} lines •{" "}
                          {formatDate(upload.createdAt)}
                        </p>
                      </div>
                    </div>
                    {upload.levelCounts.ERROR > 0 && (
                      <Badge variant="destructive" className="shrink-0">
                        {upload.levelCounts.ERROR} errors
                      </Badge>
                    )}
                  </Link>
                ))}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/uploads">
                    View all uploads
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Advanced Analytics Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Advanced Analytics</h2>
          {!hasAdvancedAnalytics && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>

        {!hasAdvancedAnalytics ? (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Upgrade to Pro</AlertTitle>
            <AlertDescription className="mt-1">
              Get access to advanced analytics including upload trends, error
              patterns over time, and more.
              <Link
                to="/pricing"
                className="ml-2 font-medium text-primary hover:underline"
              >
                Upgrade now
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upload Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Upload Frequency
                </CardTitle>
                <CardDescription>
                  Upload activity over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {frequencyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : frequencyError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{frequencyError}</AlertDescription>
                  </Alert>
                ) : uploadFrequency.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {uploadFrequency.slice(0, 7).map((item) => (
                      <div
                        key={item.date}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-4">
                          <span>{item.uploads} uploads</span>
                          <span className="text-muted-foreground">
                            {item.lines.toLocaleString()} lines
                          </span>
                          {item.errors > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {item.errors} errors
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Error Trend
                </CardTitle>
                <CardDescription>
                  Errors and warnings over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : trendError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{trendError}</AlertDescription>
                  </Alert>
                ) : errorTrend.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {errorTrend.slice(0, 8).map((item) => (
                      <div
                        key={item.hour}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(item.hour).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            {item.errors}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            {item.warnings}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
