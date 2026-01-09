import { useAppAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LIMITS } from "@/types";
import {
  Upload,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  Zap,
} from "lucide-react";

export function DashboardPage() {
  const { email, permissions, permissionsLoading, checkLimit } = useAppAuth();
  const uploadLimit = checkLimit(LIMITS.MONTHLY_UPLOADS);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{email ? `, ${email.split("@")[0]}` : ""}! Here's an
          overview of your log analysis.
        </p>
      </div>

      {/* Plan Badge */}
      {permissionsLoading ? (
        <Skeleton className="h-6 w-24" />
      ) : permissions?.plan ? (
        <Badge variant="secondary" className="capitalize">
          <Zap className="mr-1 h-3 w-3" />
          {permissions.plan} Plan
        </Badge>
      ) : null}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Upload logs to get started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Log Groups</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Groups across all uploads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
            <p className="text-xs text-muted-foreground">
              Percentage of error logs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Lines/Upload
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Average log file size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Card */}
      {uploadLimit.max > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              Your current upload usage for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Uploads</span>
              <span className="font-medium">
                {uploadLimit.used} / {uploadLimit.max}
              </span>
            </div>
            <Progress
              value={(uploadLimit.used / uploadLimit.max) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {uploadLimit.remaining} uploads remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick tips to make the most of LogSplitter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              Upload your first log file to see it organized by error patterns
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              Use the search feature to find specific error messages
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              Check analytics to understand error trends over time
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
