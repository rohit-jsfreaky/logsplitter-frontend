import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAppAuth } from "@/contexts/AuthContext";
import { PreferencesForm } from "@/components/PreferencesForm";
import { UsageDisplay } from "@/components/UsageDisplay";
import { ApiKeysList } from "@/components/ApiKeysList";
import { formatDate } from "@/lib/utils";
import { FEATURES } from "@/types";
import {
  User,
  Mail,
  Calendar,
  Shield,
  RefreshCw,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

export function ProfilePage() {
  const { profile, loading, error, refetch, updateSettings } = useProfile();
  const { refreshPermissions } = useAppAuth();

  // Sync dark mode preference when profile loads
  useEffect(() => {
    if (profile?.settings.darkMode !== undefined) {
      if (profile.settings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [profile?.settings.darkMode]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
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

  if (!profile) {
    return null;
  }

  const handleSettingsSave = async (
    settings: Parameters<typeof updateSettings>[0]
  ) => {
    const result = await updateSettings(settings);
    if (result.success) {
      // Refresh permissions after settings update
      await refreshPermissions();
    }
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {profile.email || "Not set"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {profile.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Display */}
        <UsageDisplay />
      </div>

      {/* Features Card */}
      {profile.permissions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Available Features
            </CardTitle>
            <CardDescription>Features available on your plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(FEATURES).map(([key, slug]) => {
                const enabled = profile.permissions?.features?.[slug] ?? false;
                const label = key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={slug}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    {enabled ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        enabled ? "text-sm" : "text-sm text-muted-foreground"
                      }
                    >
                      {label}
                    </span>
                    {!enabled && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Upgrade
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Form */}
      <PreferencesForm
        settings={profile.settings}
        onSave={handleSettingsSave}
      />

      {/* API Keys */}
      <ApiKeysList />
    </div>
  );
}
