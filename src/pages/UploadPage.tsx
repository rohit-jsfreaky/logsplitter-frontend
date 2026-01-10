import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadForm } from "@/components/UploadForm";
import { UploadResult } from "@/components/UploadResult";
import { useUpload } from "@/hooks/useUpload";
import { useAppAuth } from "@/contexts/AuthContext";
import { FileText, TrendingUp, Zap } from "lucide-react";

export function UploadPage() {
  const { upload, reset, loading, progress, error, result, uploadLimit } =
    useUpload();
  const { permissions } = useAppAuth();

  const plan = permissions?.plan || "free-plan";

  const handleUpload = async (file: File) => {
    await upload(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload</h1>
          <p className="text-muted-foreground">
            Upload and analyze your log files
          </p>
        </div>

        {/* Usage indicator */}
        {uploadLimit.max !== -1 && (
          <Badge variant="secondary" className="gap-1 self-start">
            <TrendingUp className="h-3 w-3" />
            {uploadLimit.used} / {uploadLimit.max} uploads used
          </Badge>
        )}
        {uploadLimit.max === -1 && (
          <Badge variant="secondary" className="gap-1 self-start">
            <Zap className="h-3 w-3" />
            Unlimited uploads
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main upload area */}
        <div className="lg:col-span-2">
          {result ? (
            <UploadResult result={result} onReset={reset} />
          ) : (
            <UploadForm
              onUpload={handleUpload}
              loading={loading}
              progress={progress}
              error={error}
            />
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* What happens */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </div>
                <p>Your log file is securely uploaded and parsed</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  2
                </div>
                <p>Similar log entries are grouped together</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  3
                </div>
                <p>Errors and patterns are identified</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  4
                </div>
                <p>View insights and drill into specific issues</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tips</CardTitle>
              <CardDescription className="text-xs">
                Get the most out of LogSplitter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use standard log formats (timestamp, level, message)</p>
              <p>• Larger files may take longer to process</p>
              <p>• Check the Analytics page for trends</p>
              <p>• Use Search to find specific patterns</p>
            </CardContent>
          </Card>

          {/* Plan info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your plan</span>
                <Badge variant="outline">
                  {plan.replace("-plan", "").replace(/-/g, " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
