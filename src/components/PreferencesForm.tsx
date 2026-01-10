import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { UserSettings } from "@/types";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface PreferencesFormProps {
  settings: UserSettings;
  onSave: (
    settings: Partial<UserSettings>
  ) => Promise<{ success: boolean; error?: string }>;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

export function PreferencesForm({ settings, onSave }: PreferencesFormProps) {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await onSave(formData);

    if (result.success) {
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } else {
      toast.error(result.error || "Failed to save settings");
    }

    setSaving(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Manage your notification and display settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label
                htmlFor="emailNotifications"
                className="text-sm font-medium"
              >
                Email Notifications
              </label>
              <p className="text-xs text-muted-foreground">
                Receive email alerts for important events
              </p>
            </div>
            <Checkbox
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) =>
                handleChange("emailNotifications", checked === true)
              }
            />
          </div>

          <Separator />

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="darkMode" className="text-sm font-medium">
                Dark Mode
              </label>
              <p className="text-xs text-muted-foreground">
                Use dark theme across the application
              </p>
            </div>
            <Checkbox
              id="darkMode"
              checked={formData.darkMode}
              onCheckedChange={(checked) =>
                handleChange("darkMode", checked === true)
              }
            />
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-2">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <p className="text-xs text-muted-foreground">
              Used for displaying dates and times
            </p>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleChange("timezone", value)}
            >
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {hasChanges && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
