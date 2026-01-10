import { useState, useCallback } from "react";
import { useApi } from "@/lib/api";
import { useAppAuth } from "@/contexts/AuthContext";
import { FEATURES, LIMITS } from "@/types";

export interface UploadData {
  id: string;
  originalFilename: string;
  totalLines: number;
  levelCounts: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
    UNKNOWN: number;
  };
  createdAt: string;
}

export interface UploadSummary {
  totalLines: number;
  processedLines: number;
  uniquePatterns: number;
  byLevel: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
    UNKNOWN: number;
  };
}

export interface UploadResponse {
  upload: UploadData;
  summary: UploadSummary;
  groupsCount: number;
}

export function useUpload() {
  const { call } = useApi();
  const { hasFeature, checkLimit, refreshPermissions } = useAppAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const canUpload = hasFeature(FEATURES.UPLOAD_LOGS);
  const uploadLimit = checkLimit(LIMITS.MONTHLY_UPLOADS);

  const upload = useCallback(
    async (file: File) => {
      // Check permissions first
      if (!canUpload) {
        setError("Your plan does not include log uploads. Please upgrade.");
        return { success: false, error: "Feature not available" };
      }

      if (!uploadLimit.allowed) {
        setError(
          `You've reached your monthly upload limit (${uploadLimit.max}). Please upgrade for more uploads.`
        );
        return { success: false, error: "Limit reached" };
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress (real progress would need XHR or fetch with ReadableStream)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await call<UploadResponse>("/api/uploads", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.success && response.data) {
          setProgress(100);
          setResult(response.data);
          // Refresh permissions to update usage counts
          await refreshPermissions();
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Upload failed");
          setProgress(0);
          return { success: false, error: response.error };
        }
      } catch (err) {
        setError("Upload failed");
        setProgress(0);
        return { success: false, error: "Upload failed" };
      } finally {
        setLoading(false);
      }
    },
    [call, canUpload, uploadLimit, refreshPermissions]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    reset,
    loading,
    progress,
    error,
    result,
    canUpload,
    uploadLimit,
  };
}
