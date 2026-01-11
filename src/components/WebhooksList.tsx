import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateWebhookDialog } from "@/components/CreateWebhookDialog";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type {
  WebhookWithStats,
  WebhookEvent,
  CreateWebhookRequest,
  CreateWebhookResponse,
} from "@/types";
import {
  Webhook,
  Lock,
  RefreshCw,
  AlertCircle,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface WebhooksListProps {
  webhooks: WebhookWithStats[];
  availableEvents: WebhookEvent[];
  loading: boolean;
  error: string | null;
  hasAccess: boolean;
  onRefresh: () => void;
  onCreateWebhook: (
    data: CreateWebhookRequest
  ) => Promise<{
    success: boolean;
    data?: CreateWebhookResponse;
    error?: string;
  }>;
  creating: boolean;
  onDeleteWebhook: (
    webhookId: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleting: string | null;
  onTestWebhook: (
    webhookId: string
  ) => Promise<{ success: boolean; error?: string }>;
  testing: string | null;
  onToggleActive: (
    webhookId: string,
    isActive: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  updating: string | null;
}

export function WebhooksList({
  webhooks,
  availableEvents,
  loading,
  error,
  hasAccess,
  onRefresh,
  onCreateWebhook,
  creating,
  onDeleteWebhook,
  deleting,
  onTestWebhook,
  testing,
  onToggleActive,
  updating,
}: WebhooksListProps) {
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!webhookToDelete) return;

    const result = await onDeleteWebhook(webhookToDelete);
    if (result.success) {
      toast.success("Webhook deleted");
    } else {
      toast.error(result.error || "Failed to delete webhook");
    }
    setWebhookToDelete(null);
  };

  const handleTest = async (webhookId: string) => {
    const result = await onTestWebhook(webhookId);
    if (result.success) {
      toast.success("Test webhook sent successfully");
    } else {
      toast.error(result.error || "Failed to send test webhook");
    }
  };

  const handleToggle = async (webhookId: string, currentActive: boolean) => {
    const result = await onToggleActive(webhookId, !currentActive);
    if (result.success) {
      toast.success(
        currentActive ? "Webhook paused" : "Webhook activated"
      );
    } else {
      toast.error(result.error || "Failed to update webhook");
    }
  };

  // Feature not available
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Receive real-time notifications for events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription className="mt-1">
              Webhooks are available on Pro and Enterprise plans.
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
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getSuccessRate = (stats: WebhookWithStats["deliveryStats"]) => {
    if (stats.total === 0) return null;
    return Math.round((stats.successful / stats.total) * 100);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Receive real-time notifications for events
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <CreateWebhookDialog
                onCreateWebhook={onCreateWebhook}
                creating={creating}
                availableEvents={availableEvents}
              />
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

          {webhooks.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Webhook className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No webhooks yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first webhook to start receiving notifications
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => {
                const successRate = getSuccessRate(webhook.deliveryStats);

                return (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/webhooks/${webhook.id}`}
                          className="font-medium hover:underline truncate max-w-[300px]"
                        >
                          {webhook.url}
                        </Link>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {webhook.description && (
                          <>
                            <span className="truncate max-w-[150px]">
                              {webhook.description}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{webhook.events.length} events</span>
                        <span>•</span>
                        <span>Created {formatDate(webhook.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {webhook.events.slice(0, 3).map((event) => (
                          <Badge
                            key={event}
                            variant="secondary"
                            className="text-xs"
                          >
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 shrink-0">
                      {successRate !== null && (
                        <div className="flex items-center gap-1 text-sm">
                          {successRate >= 90 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : successRate >= 50 ? (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              successRate >= 90
                                ? "text-green-500"
                                : successRate >= 50
                                ? "text-amber-500"
                                : "text-red-500"
                            }
                          >
                            {successRate}%
                          </span>
                        </div>
                      )}

                      {/* Active toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={() =>
                            handleToggle(webhook.id, webhook.isActive)
                          }
                          disabled={updating === webhook.id}
                        />
                        <span className="text-xs text-muted-foreground w-12">
                          {webhook.isActive ? "Active" : "Paused"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTest(webhook.id)}
                          disabled={testing === webhook.id || !webhook.isActive}
                          title="Send test webhook"
                        >
                          {testing === webhook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setWebhookToDelete(webhook.id)}
                          disabled={deleting === webhook.id}
                        >
                          {deleting === webhook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/webhooks/${webhook.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>• Maximum 5 webhook endpoints per account</p>
            <p>• Webhooks timeout after 10 seconds</p>
            <p>• Failed webhooks are retried up to 3 times</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!webhookToDelete}
        onOpenChange={() => setWebhookToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook?</DialogTitle>
            <DialogDescription>
              This will permanently delete this webhook and all its delivery
              history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
