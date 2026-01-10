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
import { useAppAuth } from "@/contexts/AuthContext";
import { LIMITS } from "@/types";
import { Zap } from "lucide-react";

export function UsageDisplay() {
  const { permissions, permissionsLoading } = useAppAuth();

  if (permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const monthlyUploads = permissions?.limits?.[LIMITS.MONTHLY_UPLOADS];
  const plan = permissions?.plan || "free-plan";

  const usagePercent = monthlyUploads
    ? monthlyUploads.max === -1
      ? 0
      : Math.round((monthlyUploads.used / monthlyUploads.max) * 100)
    : 0;

  const formatPlanName = (slug: string) => {
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Usage</span>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {formatPlanName(plan)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Your current usage this billing period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {monthlyUploads && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Uploads</span>
              <span className="font-medium">
                {monthlyUploads.used} /{" "}
                {monthlyUploads.max === -1 ? "∞" : monthlyUploads.max}
              </span>
            </div>
            {monthlyUploads.max !== -1 && (
              <Progress value={usagePercent} className="h-2" />
            )}
            {monthlyUploads.max !== -1 && (
              <p className="text-xs text-muted-foreground">
                {monthlyUploads.remaining} uploads remaining this month
                {monthlyUploads.remaining <= 3 &&
                  monthlyUploads.remaining > 0 && (
                    <span className="text-amber-500 ml-1">— Running low!</span>
                  )}
                {monthlyUploads.remaining === 0 && (
                  <span className="text-destructive ml-1">— Limit reached</span>
                )}
              </p>
            )}
            {monthlyUploads.max === -1 && (
              <p className="text-xs text-muted-foreground">
                Unlimited uploads on your plan
              </p>
            )}
          </div>
        )}

        {!monthlyUploads && (
          <p className="text-sm text-muted-foreground">
            No usage data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
