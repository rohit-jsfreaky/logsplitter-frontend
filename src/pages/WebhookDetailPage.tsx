import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WebhookEventSelector } from "@/components/WebhookEventSelector";
import { WebhookDeliveryLogs } from "@/components/WebhookDeliveryLogs";
import { useWebhooks } from "@/hooks/useWebhooks";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { WebhookEvent, UpdateWebhookRequest } from "@/types";
import {
  Webhook,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Play,
  Key,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export function WebhookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentWebhook,
    currentStats,
    detailLoading,
    detailError,
    fetchWebhookDetail,
    clearDetail,
    availableEvents,
    deliveries,
    deliveriesPagination,
    deliveriesLoading,
    deliveriesError,
    fetchDeliveries,
    loadMoreDeliveries,
    updateWebhook,
    updating,
    deleteWebhook,
    deleting,
    testWebhook,
    testing,
    regenerateSecret,
    regenerating,
    toggleActive,
  } = useWebhooks();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEvents, setEditEvents] = useState<WebhookEvent[]>([]);
  const [editThreshold, setEditThreshold] = useState(10);

  // Fetch webhook and deliveries on mount
  useEffect(() => {
    if (id) {
      clearDetail();
      fetchWebhookDetail(id);
      fetchDeliveries(id);
    }
    return () => clearDetail();
  }, [id]);

  // Initialize edit form when webhook loads
  useEffect(() => {
    if (currentWebhook) {
      setEditUrl(currentWebhook.url);
      setEditDescription(currentWebhook.description || "");
      setEditEvents(currentWebhook.events);
      setEditThreshold(currentWebhook.errorSpikeThreshold);
    }
  }, [currentWebhook]);

  const handleDelete = async () => {
    if (!id) return;

    const result = await deleteWebhook(id);
    if (result.success) {
      toast.success("Webhook deleted");
      navigate("/webhooks");
    } else {
      toast.error(result.error || "Failed to delete webhook");
    }
    setShowDeleteDialog(false);
  };

  const handleTest = async () => {
    if (!id) return;

    const result = await testWebhook(id);
    if (result.success) {
      toast.success("Test webhook sent successfully");
      // Refresh deliveries
      fetchDeliveries(id);
    } else {
      toast.error(result.error || "Failed to send test webhook");
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;

    const result = await regenerateSecret(id);
    if (result.success && result.data?.secret) {
      setNewSecret(result.data.secret);
      toast.success("Secret regenerated");
    } else {
      toast.error(result.error || "Failed to regenerate secret");
      setShowRegenerateDialog(false);
    }
  };

  const handleCopySecret = async () => {
    if (newSecret) {
      await navigator.clipboard.writeText(newSecret);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseSecretDialog = () => {
    setShowRegenerateDialog(false);
    setNewSecret(null);
    setCopied(false);
  };

  const handleToggle = async () => {
    if (!id || !currentWebhook) return;

    const result = await toggleActive(id, !currentWebhook.isActive);
    if (result.success) {
      toast.success(
        currentWebhook.isActive ? "Webhook paused" : "Webhook activated"
      );
    } else {
      toast.error(result.error || "Failed to update webhook");
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;

    const updates: UpdateWebhookRequest = {};

    if (editUrl !== currentWebhook?.url) {
      updates.url = editUrl;
    }
    if (editDescription !== (currentWebhook?.description || "")) {
      updates.description = editDescription || undefined;
    }
    if (JSON.stringify(editEvents) !== JSON.stringify(currentWebhook?.events)) {
      updates.events = editEvents;
    }
    if (editThreshold !== currentWebhook?.errorSpikeThreshold) {
      updates.errorSpikeThreshold = editThreshold;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    const result = await updateWebhook(id, updates);
    if (result.success) {
      toast.success("Webhook updated");
      setIsEditing(false);
      fetchWebhookDetail(id);
    } else {
      toast.error(result.error || "Failed to update webhook");
    }
  };

  const handleCancelEdit = () => {
    if (currentWebhook) {
      setEditUrl(currentWebhook.url);
      setEditDescription(currentWebhook.description || "");
      setEditEvents(currentWebhook.events);
      setEditThreshold(currentWebhook.errorSpikeThreshold);
    }
    setIsEditing(false);
  };

  // Loading state
  if (detailLoading && !currentWebhook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/webhooks">
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
            <Link to="/webhooks">
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
              onClick={() => id && fetchWebhookDetail(id)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWebhook) {
    return null;
  }

  const successRate =
    currentStats && currentStats.total > 0
      ? Math.round((currentStats.successful / currentStats.total) * 100)
      : null;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link to="/webhooks">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Webhook className="h-6 w-6" />
              Webhook Details
            </h1>
            <p className="text-sm text-muted-foreground truncate max-w-[500px]">
              {currentWebhook.url}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => id && fetchWebhookDetail(id)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing === id || !currentWebhook.isActive}
            >
              {testing === id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Test
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
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={currentWebhook.isActive}
                  onCheckedChange={handleToggle}
                  disabled={updating === id}
                />
                <span className="font-medium">
                  {currentWebhook.isActive ? "Active" : "Paused"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Deliveries</p>
              <p className="text-2xl font-bold">
                {currentStats?.total.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card
            className={
              successRate !== null && successRate < 90
                ? "border-amber-500/30"
                : ""
            }
          >
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <div className="flex items-center gap-2">
                {successRate !== null ? (
                  <>
                    {successRate >= 90 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : successRate >= 50 ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span
                      className={`text-2xl font-bold ${
                        successRate >= 90
                          ? "text-green-500"
                          : successRate >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {successRate}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    N/A
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-500">
                {currentStats?.failed || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Webhook settings and events</CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updating === id}
                  >
                    {updating === id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {/* Edit URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://example.com/webhook"
                  />
                </div>

                {/* Edit Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                <Separator />

                {/* Edit Events */}
                <WebhookEventSelector
                  selectedEvents={editEvents}
                  onChange={setEditEvents}
                  availableEvents={availableEvents}
                />

                {/* Edit Threshold */}
                {editEvents.includes("error.spike") && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Error Spike Threshold
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        value={editThreshold}
                        onChange={(e) =>
                          setEditThreshold(parseInt(e.target.value) || 10)
                        }
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Display mode */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">URL</p>
                    <p className="font-mono text-sm break-all">
                      {currentWebhook.url}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">
                      {currentWebhook.description || "No description"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(currentWebhook.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Error Spike Threshold
                    </p>
                    <p className="text-sm">
                      {currentWebhook.errorSpikeThreshold} errors
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Subscribed Events</p>
                  <div className="flex flex-wrap gap-2">
                    {currentWebhook.events.map((event) => (
                      <Badge key={event} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Security */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Security</p>
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(true)}
                disabled={regenerating === id}
              >
                {regenerating === id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Regenerate Secret
              </Button>
              <p className="text-xs text-muted-foreground">
                If you suspect your webhook secret has been compromised,
                regenerate it immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Logs */}
        <WebhookDeliveryLogs
          webhookId={id!}
          deliveries={deliveries}
          pagination={deliveriesPagination}
          loading={deliveriesLoading}
          error={deliveriesError}
          onLoadMore={() => loadMoreDeliveries(id!)}
        />
      </div>

      {/* Delete confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook?</DialogTitle>
            <DialogDescription>
              This will permanently delete this webhook and all its delivery
              history. This action cannot be undone.
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
                "Delete Webhook"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate secret dialog */}
      <Dialog
        open={showRegenerateDialog}
        onOpenChange={(open) => !open && handleCloseSecretDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {newSecret ? "New Secret Generated" : "Regenerate Secret?"}
            </DialogTitle>
            <DialogDescription>
              {newSecret
                ? "Save this secret now. You won't be able to see it again!"
                : "This will invalidate the current secret. Any systems using the old secret will stop working."}
            </DialogDescription>
          </DialogHeader>

          {newSecret ? (
            <div className="space-y-4">
              <Alert
                variant="default"
                className="border-amber-500/50 bg-amber-500/10"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Important</AlertTitle>
                <AlertDescription>
                  Update your systems with this new secret immediately.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Input value={newSecret} readOnly className="font-mono text-xs" />
                <Button variant="outline" onClick={handleCopySecret}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseSecretDialog}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRegenerate}
                disabled={regenerating === id}
              >
                {regenerating === id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Regenerate Secret"
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
