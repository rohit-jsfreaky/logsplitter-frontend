// Shared types across app

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// ============================================
// SaaS Guard Permissions (from backend)
// ============================================

export interface UsageLimit {
  max: number;
  used: number;
  remaining: number;
}

export interface UserPermissions {
  features: Record<string, boolean>;
  limits: Record<string, UsageLimit>;
  plan?: string;
}

// Feature slugs (match backend SaaS Guard config)
export const FEATURES = {
  UPLOAD_LOGS: "upload-logs",
  EXPORT_LOGS: "export-logs",
  API_ACCESS: "api-access",
  ADVANCED_ANALYTICS: "advanced-analytics",
  MAX_FILE_SIZE_MB: "max-file-size-mb",
} as const;

export const LIMITS = {
  MONTHLY_UPLOADS: "monthly-uploads",
} as const;

// ============================================
// User & Profile
// ============================================

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  permissions?: UserPermissions;
}

export interface UserSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  timezone: string;
}

// ============================================
// Plans (for Stripe checkout)
// ============================================

export interface Plan {
  slug: string;
  name: string;
  priceId: string | null;
  price: number; // cents, 0 for free
  interval: "month" | "year";
  features: string[];
  limits: {
    monthlyUploads: number; // -1 = unlimited
    maxFileSizeMb: number;
  };
}

// ============================================
// Log Types
// ============================================

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "UNKNOWN";

export interface LogEntry {
  lineNumber: number;
  level: LogLevel;
  message: string;
  timestamp?: string;
  fingerprint: string;
}

export interface GroupedLog {
  id: string;
  fingerprint: string;
  message: string;
  level: LogLevel;
  count: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  occurrencesSample?: Array<{
    lineNumber: number;
    timestamp?: string;
  }>;
}

export interface LevelCounts {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
  UNKNOWN: number;
}

// ============================================
// Upload Types
// ============================================

export interface UploadResponse {
  id: string;
  originalFilename: string;
  totalLines: number;
  levelCounts: LevelCounts;
  createdAt: string;
}

export interface Upload {
  id: string;
  originalFilename: string;
  source: string;
  totalLines: number;
  levelCounts: LevelCounts;
  createdAt: string;
  groupCount?: number;
}

export interface UploadDetail extends Upload {
  groups: GroupedLog[];
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsStats {
  totalUploads: number;
  totalLogs: number;
  errorCount: number;
  errorPercentage: number;
  averageLinesPerUpload: number;
}

export interface TopError {
  fingerprint: string;
  message: string;
  count: number;
  uploadCount: number;
}

export interface UploadFrequency {
  date: string;
  uploads: number;
}

export interface ErrorTrend {
  hour: string;
  errors: number;
}

// ============================================
// Search Types
// ============================================

export interface SearchResult {
  id: string;
  uploadId: string;
  fingerprint: string;
  message: string;
  level: LogLevel;
  count: number;
  uploadFilename: string;
  uploadDate: string;
}

export interface SearchFilters {
  query: string;
  level?: LogLevel;
  uploadId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// API Keys
// ============================================

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  key: string; // Full key, shown only once
}
