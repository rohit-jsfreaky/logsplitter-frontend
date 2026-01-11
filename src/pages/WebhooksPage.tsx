import { WebhooksList } from "@/components/WebhooksList";
import { useWebhooks } from "@/hooks/useWebhooks";

export function WebhooksPage() {
  const {
    webhooks,
    availableEvents,
    loading,
    error,
    fetchWebhooks,
    createWebhook,
    creating,
    deleteWebhook,
    deleting,
    testWebhook,
    testing,
    toggleActive,
    updating,
    hasWebhookAccess,
  } = useWebhooks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Receive real-time notifications when events occur
        </p>
      </div>

      {/* Webhooks List */}
      <WebhooksList
        webhooks={webhooks}
        availableEvents={availableEvents}
        loading={loading}
        error={error}
        hasAccess={hasWebhookAccess}
        onRefresh={fetchWebhooks}
        onCreateWebhook={createWebhook}
        creating={creating}
        onDeleteWebhook={deleteWebhook}
        deleting={deleting}
        onTestWebhook={testWebhook}
        testing={testing}
        onToggleActive={toggleActive}
        updating={updating}
      />
    </div>
  );
}
