import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { WebhookEventSelector } from "@/components/WebhookEventSelector";
import type {
  WebhookEvent,
  CreateWebhookRequest,
  CreateWebhookResponse,
} from "@/types";
import {
  Plus,
  Webhook,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CreateWebhookDialogProps {
  onCreateWebhook: (
    data: CreateWebhookRequest
  ) => Promise<{
    success: boolean;
    data?: CreateWebhookResponse;
    error?: string;
  }>;
  creating?: boolean;
  availableEvents?: WebhookEvent[];
}

export function CreateWebhookDialog({
  onCreateWebhook,
  creating,
  availableEvents,
}: CreateWebhookDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [errorSpikeThreshold, setErrorSpikeThreshold] = useState(10);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateUrl = (urlString: string): boolean => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleCreate = async () => {
    setValidationError(null);

    // Validate URL
    if (!url.trim()) {
      setValidationError("URL is required");
      return;
    }

    if (!validateUrl(url.trim())) {
      setValidationError("URL must be a valid HTTPS URL");
      return;
    }

    // Validate events
    if (selectedEvents.length === 0) {
      setValidationError("Select at least one event");
      return;
    }

    // Validate threshold if error.spike is selected
    if (selectedEvents.includes("error.spike")) {
      if (errorSpikeThreshold < 1 || errorSpikeThreshold > 10000) {
        setValidationError("Error spike threshold must be between 1 and 10000");
        return;
      }
    }

    const result = await onCreateWebhook({
      url: url.trim(),
      events: selectedEvents,
      description: description.trim() || undefined,
      isActive: true,
      errorSpikeThreshold: selectedEvents.includes("error.spike")
        ? errorSpikeThreshold
        : undefined,
    });

    if (result.success && result.data?.secret) {
      setSecret(result.data.secret);
      toast.success("Webhook created successfully");
    } else {
      setValidationError(result.error || "Failed to create webhook");
    }
  };

  const handleCopy = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after closing
    setTimeout(() => {
      setUrl("");
      setDescription("");
      setSelectedEvents([]);
      setErrorSpikeThreshold(10);
      setSecret(null);
      setCopied(false);
      setValidationError(null);
    }, 200);
  };

  const showThresholdInput = selectedEvents.includes("error.spike");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            {secret ? "Webhook Created" : "Create Webhook"}
          </DialogTitle>
          <DialogDescription>
            {secret
              ? "Save this secret now. You won't be able to see it again!"
              : "Create a new webhook to receive real-time notifications."}
          </DialogDescription>
        </DialogHeader>

        {secret ? (
          <div className="space-y-4">
            <Alert
              variant="default"
              className="border-amber-500/50 bg-amber-500/10"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500">Important</AlertTitle>
              <AlertDescription>
                This is the only time you'll see this secret. Copy and store it
                securely. You'll need it to verify webhook signatures.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook Secret</label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* URL Input */}
            <div className="space-y-2">
              <label htmlFor="webhookUrl" className="text-sm font-medium">
                Webhook URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://example.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={creating}
              />
              <p className="text-xs text-muted-foreground">
                Must be a valid HTTPS URL that can receive POST requests.
              </p>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label htmlFor="webhookDesc" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="webhookDesc"
                placeholder="e.g., Production alerts"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
              />
            </div>

            <Separator />

            {/* Event Selector */}
            <WebhookEventSelector
              selectedEvents={selectedEvents}
              onChange={setSelectedEvents}
              availableEvents={availableEvents}
              disabled={creating}
            />

            {/* Error Spike Threshold */}
            {showThresholdInput && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label
                    htmlFor="errorThreshold"
                    className="text-sm font-medium"
                  >
                    Error Spike Threshold
                  </label>
                  <Input
                    id="errorThreshold"
                    type="number"
                    min={1}
                    max={10000}
                    value={errorSpikeThreshold}
                    onChange={(e) =>
                      setErrorSpikeThreshold(parseInt(e.target.value) || 10)
                    }
                    disabled={creating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger "error.spike" event when errors exceed this count in
                    a single upload.
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !url.trim() || selectedEvents.length === 0}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Webhook"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
