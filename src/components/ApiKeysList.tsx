import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateApiKeyDialog } from "@/components/CreateApiKeyDialog";
import { useApiKeys } from "@/hooks/useApiKeys";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import {
  Key,
  Lock,
  Trash2,
  RefreshCw,
  AlertCircle,
  Clock,
  Shield,
} from "lucide-react";

export function ApiKeysList() {
  const {
    keys,
    loading,
    error,
    fetchKeys,
    createKey,
    creating,
    revokeKey,
    revoking,
    hasApiAccess,
  } = useApiKeys();

  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!keyToRevoke) return;

    const result = await revokeKey(keyToRevoke);
    if (result.success) {
      toast.success("API key revoked");
    } else {
      toast.error(result.error || "Failed to revoke key");
    }
    setKeyToRevoke(null);
  };

  // Feature not available
  if (!hasApiAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage your API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription className="mt-1">
              API access is available on Pro and Enterprise plans.
              <Link
                to="/pricing"
                className="ml-1 font-medium text-primary hover:underline"
              >
                Upgrade now
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchKeys}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <CreateApiKeyDialog onCreateKey={createKey} creating={creating} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {keys.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No API keys yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first API key to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{apiKey.name}</p>
                      {apiKey.isRevoked && (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        {apiKey.prefix}...
                      </code>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDate(apiKey.createdAt)}
                      </span>
                      {apiKey.lastUsedAt && (
                        <span>Last used {formatDate(apiKey.lastUsedAt)}</span>
                      )}
                    </div>
                  </div>

                  {!apiKey.isRevoked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setKeyToRevoke(apiKey.id)}
                      disabled={revoking === apiKey.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • API keys provide programmatic access to your LogSplitter data
            </p>
            <p>• Keep your keys secure and never share them publicly</p>
            <p>• Revoke keys immediately if they are compromised</p>
          </div>
        </CardContent>
      </Card>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any applications using this key will
              lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRevoke(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
