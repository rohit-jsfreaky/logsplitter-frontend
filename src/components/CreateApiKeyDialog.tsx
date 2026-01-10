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
import { Plus, Key, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CreateApiKeyDialogProps {
  onCreateKey: (name: string) => Promise<{
    success: boolean;
    data?: { secret: string };
    error?: string;
  }>;
  creating?: boolean;
}

export function CreateApiKeyDialog({
  onCreateKey,
  creating,
}: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    const result = await onCreateKey(name.trim());

    if (result.success && result.data?.secret) {
      setSecret(result.data.secret);
      toast.success("API key created successfully");
    } else {
      toast.error(result.error || "Failed to create API key");
    }
  };

  const handleCopy = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after closing
    setTimeout(() => {
      setName("");
      setSecret(null);
      setCopied(false);
    }, 200);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {secret ? "API Key Created" : "Create API Key"}
          </DialogTitle>
          <DialogDescription>
            {secret
              ? "Save this key now. You won't be able to see it again!"
              : "Create a new API key for programmatic access to LogSplitter."}
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
                This is the only time you'll see this key. Copy and store it
                securely.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input value={secret} readOnly className="font-mono text-xs" />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="keyName" className="text-sm font-medium">
                Key Name
              </label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name to help you identify this key.
              </p>
            </div>

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
                disabled={creating || !name.trim()}
              >
                {creating ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
