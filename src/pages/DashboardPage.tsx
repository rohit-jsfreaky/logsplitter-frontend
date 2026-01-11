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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/hooks/useDashboard";
import { useAppAuth } from "@/contexts/AuthContext";
import { useUser } from "@clerk/clerk-react";
import { LIMITS } from "@/types";
import { Link } from "react-router-dom";
import {
  Upload,
  Layers,
  AlertCircle,
  TrendingUp,
  FileText,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useUser();
  const { permissions } = useAppAuth();
  const {
    stats,
    recentUploads,
    topErrors,
    uploadActivity,
    loading,
    error,
    refetch,
  } = useDashboard();

  const plan = permissions?.plan || "free-plan";
  const uploadLimit = permissions?.limits?.[LIMITS.MONTHLY_UPLOADS];
  const usagePercent = uploadLimit
    ? uploadLimit.max === -1
      ? 0
      : Math.round((uploadLimit.used / uploadLimit.max) * 100)
    : 0;

  const firstName =
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "there";

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasData = stats && stats.totalUploads > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {firstName}! Here's an overview of your log analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {plan
              .replace("-plan", "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
            Plan
          </Badge>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold">{stats?.totalUploads ?? 0}</p>
                {!hasData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload logs to get started
                  </p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Log Patterns</p>
                <p className="text-2xl font-bold">
                  {stats?.totalPatterns?.toLocaleString() ?? 0}
                </p>
                {!hasData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Groups across all uploads
                  </p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            stats?.errorRate && stats.errorRate > 10 ? "border-red-500/30" : ""
          }
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.errorRate?.toFixed(1) ?? 0}%
                </p>
                {!hasData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage of error logs
                  </p>
                )}
              </div>
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  stats?.errorRate && stats.errorRate > 10
                    ? "bg-red-500/10"
                    : "bg-amber-500/10"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    stats?.errorRate && stats.errorRate > 10
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Lines/Upload
                </p>
                <p className="text-2xl font-bold">
                  {stats?.avgLinesPerUpload?.toLocaleString() ?? 0}
                </p>
                {!hasData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Average log file size
                  </p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Card */}
      {uploadLimit && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Usage This Month</CardTitle>
            <CardDescription>
              Your current upload usage for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Uploads</span>
              <span className="font-medium">
                {uploadLimit.used} /{" "}
                {uploadLimit.max === -1 ? "∞" : uploadLimit.max}
              </span>
            </div>
            {uploadLimit.max !== -1 && (
              <>
                <Progress value={usagePercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {uploadLimit.remaining} uploads remaining
                  {uploadLimit.remaining <= 5 && uploadLimit.remaining > 0 && (
                    <span className="text-amber-500 ml-1">— Running low!</span>
                  )}
                  {uploadLimit.remaining === 0 && (
                    <span className="text-destructive ml-1">
                      — Limit reached
                    </span>
                  )}
                </p>
              </>
            )}
            {uploadLimit.max === -1 && (
              <p className="text-xs text-muted-foreground">
                Unlimited uploads on your plan
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Uploads
                </CardTitle>
                <CardDescription>Your latest log files</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/uploads">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No uploads yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first log file to get started
                </p>
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Log File
                  </Link>
                </Button>
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
                          {upload.patternsFound} patterns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {upload.levelCounts.ERROR > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {upload.levelCounts.ERROR}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Errors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Top Errors
                </CardTitle>
                <CardDescription>Most frequent error patterns</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/search?level=ERROR">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-green-500/10 p-3 mb-3">
                  <AlertCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="font-medium">No errors found!</p>
                <p className="text-sm text-muted-foreground">
                  {hasData
                    ? "Your logs are looking clean"
                    : "Upload logs to see error analysis"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topErrors.slice(0, 5).map((err, index) => (
                  <div
                    key={err.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-xs font-bold text-red-500 shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium truncate"
                        title={err.messageSample}
                      >
                        {err.messageSample}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="destructive" className="text-xs">
                          {err.count}×
                        </Badge>
                        <span>{err.filename}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Activity */}
      {uploadActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Upload Activity
            </CardTitle>
            <CardDescription>
              Your upload activity over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-24">
              {uploadActivity
                .slice(0, 7)
                .reverse()
                .map((day) => {
                  const maxUploads = Math.max(
                    ...uploadActivity.map((d) => d.uploads),
                    1
                  );
                  const height = (day.uploads / maxUploads) * 100;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full bg-muted rounded-t relative"
                        style={{ height: "80px" }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
                          style={{
                            height: `${Math.max(
                              height,
                              day.uploads > 0 ? 10 : 0
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Show only for new users */}
      {!hasData && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Quick tips to make the most of LogSplitter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  1
                </div>
                <p className="text-sm text-muted-foreground">
                  <Link
                    to="/upload"
                    className="font-medium text-foreground hover:underline"
                  >
                    Upload your first log file
                  </Link>{" "}
                  to see it organized by error patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  2
                </div>
                <p className="text-sm text-muted-foreground">
                  Use the{" "}
                  <Link
                    to="/search"
                    className="font-medium text-foreground hover:underline"
                  >
                    search feature
                  </Link>{" "}
                  to find specific error messages
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  3
                </div>
                <p className="text-sm text-muted-foreground">
                  Check{" "}
                  <Link
                    to="/analytics"
                    className="font-medium text-foreground hover:underline"
                  >
                    analytics
                  </Link>{" "}
                  to understand error trends over time
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
