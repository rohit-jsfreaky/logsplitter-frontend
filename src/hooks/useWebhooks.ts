import { useState, useEffect, useRef, useCallback } from "react";
import { useApi } from "@/lib/api";
import { useAppAuth } from "@/contexts/AuthContext";
import { FEATURES } from "@/types";
import type {
  WebhookWithStats,
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  CreateWebhookResponse,
  TestWebhookResponse,
  WebhookDeliveryStats,
} from "@/types";

interface WebhooksListResponse {
  webhooks: WebhookWithStats[];
  availableEvents: WebhookEvent[];
}

interface WebhookDetailResponse {
  webhook: Webhook;
  deliveryStats: WebhookDeliveryStats;
  availableEvents: WebhookEvent[];
}

interface DeliveriesResponse {
  webhookId: string;
  deliveries: WebhookDelivery[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface RegenerateSecretResponse {
  webhookId: string;
  secret: string;
}

export function useWebhooks() {
  const { call } = useApi();
  const { hasFeature } = useAppAuth();
  const hasFetchedRef = useRef(false);

  // List state
  const [webhooks, setWebhooks] = useState<WebhookWithStats[]>([]);
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail state
  const [currentWebhook, setCurrentWebhook] = useState<Webhook | null>(null);
  const [currentStats, setCurrentStats] = useState<WebhookDeliveryStats | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Deliveries state
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveriesPagination, setDeliveriesPagination] = useState<{
    total: number;
    hasMore: boolean;
  } | null>(null);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);

  // Action states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  // Check feature access
  const hasWebhookAccess = hasFeature(FEATURES.API_ACCESS);

  // Fetch all webhooks
  const fetchWebhooks = useCallback(async () => {
    if (!hasWebhookAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await call<WebhooksListResponse>("/api/users/webhooks");

    if (response.success && response.data) {
      setWebhooks(response.data.webhooks);
      setAvailableEvents(response.data.availableEvents);
    } else {
      setError(response.error || "Failed to fetch webhooks");
    }

    setLoading(false);
  }, [call, hasWebhookAccess]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetchedRef.current && hasWebhookAccess) {
      hasFetchedRef.current = true;
      fetchWebhooks();
    }
  }, [fetchWebhooks, hasWebhookAccess]);

  // Fetch single webhook detail
  const fetchWebhookDetail = useCallback(
    async (webhookId: string) => {
      setDetailLoading(true);
      setDetailError(null);

      const response = await call<WebhookDetailResponse>(
        `/api/users/webhooks/${webhookId}`
      );

      if (response.success && response.data) {
        setCurrentWebhook(response.data.webhook);
        setCurrentStats(response.data.deliveryStats);
        if (response.data.availableEvents) {
          setAvailableEvents(response.data.availableEvents);
        }
      } else {
        setDetailError(response.error || "Failed to fetch webhook details");
      }

      setDetailLoading(false);
    },
    [call]
  );

  // Fetch deliveries
  const fetchDeliveries = useCallback(
    async (webhookId: string, offset = 0, limit = 20, append = false) => {
      setDeliveriesLoading(true);
      setDeliveriesError(null);

      const response = await call<DeliveriesResponse>(
        `/api/users/webhooks/${webhookId}/deliveries?limit=${limit}&offset=${offset}`
      );

      if (response.success && response.data) {
        if (append) {
          setDeliveries((prev) => [...prev, ...response.data!.deliveries]);
        } else {
          setDeliveries(response.data.deliveries);
        }
        setDeliveriesPagination({
          total: response.data.pagination.total,
          hasMore: response.data.pagination.hasMore,
        });
      } else {
        setDeliveriesError(response.error || "Failed to fetch deliveries");
      }

      setDeliveriesLoading(false);
    },
    [call]
  );

  // Load more deliveries
  const loadMoreDeliveries = useCallback(
    async (webhookId: string) => {
      if (!deliveriesPagination?.hasMore) return;
      await fetchDeliveries(webhookId, deliveries.length, 20, true);
    },
    [deliveries.length, deliveriesPagination, fetchDeliveries]
  );

  // Create webhook
  const createWebhook = useCallback(
    async (
      data: CreateWebhookRequest
    ): Promise<{
      success: boolean;
      data?: CreateWebhookResponse;
      error?: string;
    }> => {
      setCreating(true);

      const response = await call<CreateWebhookResponse>(
        "/api/users/webhooks",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      setCreating(false);

      if (response.success && response.data) {
        // Add to list with empty stats
        const newWebhook: WebhookWithStats = {
          ...response.data.webhook,
          deliveryStats: { total: 0, successful: 0, failed: 0, pending: 0 },
        };
        setWebhooks((prev) => [newWebhook, ...prev]);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.error || "Failed to create webhook" };
    },
    [call]
  );

  // Update webhook
  const updateWebhook = useCallback(
    async (
      webhookId: string,
      data: UpdateWebhookRequest
    ): Promise<{ success: boolean; error?: string }> => {
      setUpdating(webhookId);

      const response = await call<{ webhook: Webhook }>(
        `/api/users/webhooks/${webhookId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      setUpdating(null);

      if (response.success && response.data) {
        // Update in list
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === webhookId
              ? { ...w, ...response.data!.webhook }
              : w
          )
        );
        // Update current if viewing
        if (currentWebhook?.id === webhookId) {
          setCurrentWebhook(response.data.webhook);
        }
        return { success: true };
      }

      return { success: false, error: response.error || "Failed to update webhook" };
    },
    [call, currentWebhook?.id]
  );

  // Delete webhook
  const deleteWebhook = useCallback(
    async (webhookId: string): Promise<{ success: boolean; error?: string }> => {
      setDeleting(webhookId);

      const response = await call<{ deleted: boolean }>(
        `/api/users/webhooks/${webhookId}`,
        { method: "DELETE" }
      );

      setDeleting(null);

      if (response.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
        return { success: true };
      }

      return { success: false, error: response.error || "Failed to delete webhook" };
    },
    [call]
  );

  // Test webhook
  const testWebhook = useCallback(
    async (
      webhookId: string
    ): Promise<{ success: boolean; data?: TestWebhookResponse; error?: string }> => {
      setTesting(webhookId);

      const response = await call<TestWebhookResponse>(
        `/api/users/webhooks/${webhookId}/test`,
        { method: "POST" }
      );

      setTesting(null);

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return { success: false, error: response.error || "Failed to test webhook" };
    },
    [call]
  );

  // Regenerate secret
  const regenerateSecret = useCallback(
    async (
      webhookId: string
    ): Promise<{ success: boolean; data?: { secret: string }; error?: string }> => {
      setRegenerating(webhookId);

      const response = await call<RegenerateSecretResponse>(
        `/api/users/webhooks/${webhookId}/regenerate-secret`,
        { method: "POST" }
      );

      setRegenerating(null);

      if (response.success && response.data) {
        return { success: true, data: { secret: response.data.secret } };
      }

      return { success: false, error: response.error || "Failed to regenerate secret" };
    },
    [call]
  );

  // Toggle webhook active status
  const toggleActive = useCallback(
    async (webhookId: string, isActive: boolean) => {
      return updateWebhook(webhookId, { isActive });
    },
    [updateWebhook]
  );

  // Clear detail state
  const clearDetail = useCallback(() => {
    setCurrentWebhook(null);
    setCurrentStats(null);
    setDeliveries([]);
    setDeliveriesPagination(null);
    setDetailError(null);
    setDeliveriesError(null);
  }, []);

  return {
    // List
    webhooks,
    availableEvents,
    loading,
    error,
    fetchWebhooks,

    // Detail
    currentWebhook,
    currentStats,
    detailLoading,
    detailError,
    fetchWebhookDetail,
    clearDetail,

    // Deliveries
    deliveries,
    deliveriesPagination,
    deliveriesLoading,
    deliveriesError,
    fetchDeliveries,
    loadMoreDeliveries,

    // Actions
    createWebhook,
    creating,
    updateWebhook,
    updating,
    deleteWebhook,
    deleting,
    testWebhook,
    testing,
    regenerateSecret,
    regenerating,
    toggleActive,

    // Access check
    hasWebhookAccess,
  };
}
