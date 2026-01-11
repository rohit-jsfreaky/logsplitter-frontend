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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import type { WebhookDelivery, WebhookDeliveryStatus } from "@/types";
import {
  History,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  ChevronDown,
  Eye,
} from "lucide-react";

interface WebhookDeliveryLogsProps {
  webhookId: string;
  deliveries: WebhookDelivery[];
  pagination: { total: number; hasMore: boolean } | null;
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
}

const statusConfig: Record<
  WebhookDeliveryStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-green-500 bg-green-500/10",
    label: "Delivered",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500 bg-red-500/10",
    label: "Failed",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10",
    label: "Pending",
  },
  retrying: {
    icon: RefreshCw,
    color: "text-blue-500 bg-blue-500/10",
    label: "Retrying",
  },
};

export function WebhookDeliveryLogs({
  deliveries,
  pagination,
  loading,
  error,
  onLoadMore,
}: WebhookDeliveryLogsProps) {
  const [selectedDelivery, setSelectedDelivery] =
    useState<WebhookDelivery | null>(null);

  // Loading state
  if (loading && deliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Delivery Logs
          </CardTitle>
          <CardDescription>Recent webhook deliveries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
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
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Delivery Logs
          </CardTitle>
          <CardDescription>
            Recent webhook deliveries and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {deliveries.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No deliveries yet</p>
              <p className="text-sm text-muted-foreground">
                Deliveries will appear here once events are triggered
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deliveries.map((delivery) => {
                const config = statusConfig[delivery.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={delivery.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded ${config.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {delivery.eventType}
                        </Badge>
                        {delivery.responseStatus && (
                          <span
                            className={`text-xs font-mono ${
                              delivery.responseStatus >= 200 &&
                              delivery.responseStatus < 300
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            HTTP {delivery.responseStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {delivery.deliveredAt
                            ? formatDate(delivery.deliveredAt)
                            : formatDate(delivery.createdAt)}
                        </span>
                        {delivery.attemptCount > 1 && (
                          <>
                            <span>•</span>
                            <span>{delivery.attemptCount} attempts</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={
                        delivery.status === "success"
                          ? "default"
                          : delivery.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="shrink-0"
                    >
                      {config.label}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {/* Load more */}
              {pagination?.hasMore && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Load more
                      </>
                    )}
                  </Button>
                </div>
              )}

              {pagination && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing {deliveries.length} of {pagination.total} deliveries
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery detail modal */}
      <Dialog
        open={!!selectedDelivery}
        onOpenChange={() => setSelectedDelivery(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Delivery Details
              {selectedDelivery && (
                <Badge
                  variant={
                    selectedDelivery.status === "success"
                      ? "default"
                      : selectedDelivery.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {statusConfig[selectedDelivery.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Event: {selectedDelivery?.eventType} •{" "}
              {selectedDelivery?.createdAt &&
                formatDate(selectedDelivery.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              {/* Status info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Response Status</p>
                  <p className="font-medium">
                    {selectedDelivery.responseStatus
                      ? `HTTP ${selectedDelivery.responseStatus}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attempts</p>
                  <p className="font-medium">{selectedDelivery.attemptCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDate(selectedDelivery.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {selectedDelivery.deliveredAt ? "Delivered" : "Failed"}
                  </p>
                  <p className="font-medium">
                    {selectedDelivery.deliveredAt
                      ? formatDate(selectedDelivery.deliveredAt)
                      : selectedDelivery.failedAt
                      ? formatDate(selectedDelivery.failedAt)
                      : "Pending"}
                  </p>
                </div>
              </div>

              {/* Payload */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Request Payload</p>
                <ScrollArea className="h-[200px] rounded-md border bg-muted/30 p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(selectedDelivery.payload, null, 2)}
                  </pre>
                </ScrollArea>
              </div>

              {/* Response body */}
              {selectedDelivery.responseBody && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Response Body</p>
                  <ScrollArea className="h-[100px] rounded-md border bg-muted/30 p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {selectedDelivery.responseBody}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
