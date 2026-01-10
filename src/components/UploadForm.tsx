import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  AlertCircle,
  AlertTriangle,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppAuth } from "@/contexts/AuthContext";
import { FEATURES, LIMITS } from "@/types";
import { Link } from "react-router-dom";

interface UploadFormProps {
  onUpload: (file: File) => void;
  loading?: boolean;
  progress?: number;
  error?: string | null;
}

export function UploadForm({
  onUpload,
  loading,
  progress,
  error,
}: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { hasFeature, checkLimit, permissions } = useAppAuth();
  const canUpload = hasFeature(FEATURES.UPLOAD_LOGS);
  const uploadLimit = checkLimit(LIMITS.MONTHLY_UPLOADS);

  // Get max file size from permissions or default to 50MB
  const maxFileSizeMb = permissions?.features?.["max-file-size-mb"] ? 50 : 5;

  const validateFile = (file: File): boolean => {
    const validExtensions = [".log", ".txt"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setValidationError("Only .log and .txt files are allowed");
      return false;
    }
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      setValidationError(`File size must be less than ${maxFileSizeMb} MB`);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (loading || !uploadLimit.allowed) return;

    const files = e.dataTransfer.files;
    if (files && files[0] && validateFile(files[0])) {
      setSelectedFile(files[0]);
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show upgrade message if feature not available
  if (!canUpload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Log File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription className="mt-2">
              Your current plan does not include log uploads.
              <Link
                to="/pricing"
                className="ml-1 font-medium text-primary hover:underline"
              >
                Upgrade your plan
              </Link>{" "}
              to start analyzing logs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Log File
        </CardTitle>
        <CardDescription>
          Upload a .log or .txt file to analyze • Max {maxFileSizeMb}MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage warning */}
        {uploadLimit.max !== -1 &&
          uploadLimit.remaining <= 3 &&
          uploadLimit.remaining > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have <strong>{uploadLimit.remaining}</strong> upload
                {uploadLimit.remaining !== 1 ? "s" : ""} remaining this month.
              </AlertDescription>
            </Alert>
          )}

        {/* Limit reached */}
        {!uploadLimit.allowed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Limit Reached</AlertTitle>
            <AlertDescription className="mt-1">
              You've used all {uploadLimit.max} uploads this month.
              <Link to="/pricing" className="ml-1 font-medium hover:underline">
                Upgrade your plan
              </Link>{" "}
              for more.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation/API error */}
        {(validationError || error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError || error}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        <div
          className={cn(
            "relative cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-all",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-muted-foreground/50",
            (!uploadLimit.allowed || loading) &&
              "opacity-50 pointer-events-none cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !loading && uploadLimit.allowed && fileInputRef.current?.click()
          }
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept=".log,.txt"
            onChange={handleFileSelect}
            disabled={loading || !uploadLimit.allowed}
            className="hidden"
          />

          <div className="space-y-3">
            {loading ? (
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
            ) : (
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
            )}

            <div>
              {loading && selectedFile ? (
                <p className="text-sm font-medium">
                  Uploading {selectedFile.name}...
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drag and drop your log file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </>
              )}
            </div>

            {!loading && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading || !uploadLimit.allowed}
              >
                Select File
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-2">
            <Progress value={progress ?? 0} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress === 100
                ? "Processing..."
                : `Uploading… ${progress ?? 0}%`}
            </p>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Supported formats: .log, .txt • Maximum file size: {maxFileSizeMb} MB
        </p>
      </CardContent>
    </Card>
  );
}
