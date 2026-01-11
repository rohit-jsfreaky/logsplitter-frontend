import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { WEBHOOK_EVENTS } from "@/types";
import type { WebhookEvent } from "@/types";
import {
  Upload,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  FileDown,
  Ban,
} from "lucide-react";

interface WebhookEventSelectorProps {
  selectedEvents: WebhookEvent[];
  onChange: (events: WebhookEvent[]) => void;
  availableEvents?: WebhookEvent[];
  disabled?: boolean;
}

const eventIcons: Record<WebhookEvent, React.ElementType> = {
  "upload.completed": Upload,
  "error.new": AlertCircle,
  "error.repeated": AlertTriangle,
  "error.spike": TrendingUp,
  "export.ready": FileDown,
  "plan.limit_reached": Ban,
};

const eventColors: Record<WebhookEvent, string> = {
  "upload.completed": "bg-blue-500/10 text-blue-500",
  "error.new": "bg-red-500/10 text-red-500",
  "error.repeated": "bg-amber-500/10 text-amber-500",
  "error.spike": "bg-red-500/10 text-red-500",
  "export.ready": "bg-green-500/10 text-green-500",
  "plan.limit_reached": "bg-gray-500/10 text-gray-500",
};

export function WebhookEventSelector({
  selectedEvents,
  onChange,
  availableEvents,
  disabled,
}: WebhookEventSelectorProps) {
  const events = availableEvents
    ? WEBHOOK_EVENTS.filter((e) => availableEvents.includes(e.value))
    : WEBHOOK_EVENTS;

  const handleToggle = (eventValue: WebhookEvent, checked: boolean) => {
    if (checked) {
      onChange([...selectedEvents, eventValue]);
    } else {
      onChange(selectedEvents.filter((e) => e !== eventValue));
    }
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      onChange([]);
    } else {
      onChange(events.map((e) => e.value));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Events to Subscribe</label>
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          {selectedEvents.length === events.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="grid gap-2">
        {events.map((event) => {
          const Icon = eventIcons[event.value];
          const isSelected = selectedEvents.includes(event.value);

          return (
            <label
              key={event.value}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleToggle(event.value, checked === true)
                }
                disabled={disabled}
              />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded ${eventColors[event.value]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {event.description}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {event.value}
              </Badge>
            </label>
          );
        })}
      </div>

      {selectedEvents.length === 0 && (
        <p className="text-xs text-destructive">
          Select at least one event to subscribe to
        </p>
      )}
    </div>
  );
}
