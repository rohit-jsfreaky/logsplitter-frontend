import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  FileText,
  BarChart3,
  Layers,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { UploadResponse } from "@/hooks/useUpload";
import { formatDate } from "@/lib/utils";

interface UploadResultProps {
  result: UploadResponse;
  onReset: () => void;
}

export function UploadResult({ result, onReset }: UploadResultProps) {
  const { upload, summary, groupsCount } = result;

  const levelData = [
    {
      level: "ERROR",
      count: summary.byLevel.ERROR,
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    {
      level: "WARN",
      count: summary.byLevel.WARN,
      color: "bg-amber-500",
      textColor: "text-amber-500",
    },
    {
      level: "INFO",
      count: summary.byLevel.INFO,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      level: "DEBUG",
      count: summary.byLevel.DEBUG,
      color: "bg-gray-500",
      textColor: "text-gray-500",
    },
    {
      level: "UNKNOWN",
      count: summary.byLevel.UNKNOWN,
      color: "bg-slate-400",
      textColor: "text-slate-400",
    },
  ];

  const totalLevelCount = Object.values(summary.byLevel).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Upload Successful!</CardTitle>
              <CardDescription>
                Your log file has been processed
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Upload Another
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Info */}
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{upload.originalFilename}</p>
            <p className="text-sm text-muted-foreground">
              Uploaded {formatDate(upload.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">
              {summary.totalLines.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Lines</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">
              {summary.processedLines.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Processed</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{groupsCount}</p>
            <p className="text-xs text-muted-foreground">Patterns Found</p>
          </div>
        </div>

        <Separator />

        {/* Level Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Log Level Distribution
          </h4>

          {/* Bar chart */}
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            {levelData.map((item) => {
              const percentage =
                totalLevelCount > 0 ? (item.count / totalLevelCount) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={item.level}
                  className={`${item.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${item.level}: ${item.count} (${percentage.toFixed(
                    1
                  )}%)`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {levelData.map((item) => (
              <div key={item.level} className="flex items-center gap-2">
                {item.level === "ERROR" && (
                  <AlertCircle className={`h-3 w-3 ${item.textColor}`} />
                )}
                {item.level === "WARN" && (
                  <AlertTriangle className={`h-3 w-3 ${item.textColor}`} />
                )}
                {item.level === "INFO" && (
                  <Info className={`h-3 w-3 ${item.textColor}`} />
                )}
                {item.level === "DEBUG" && (
                  <Layers className={`h-3 w-3 ${item.textColor}`} />
                )}
                {item.level === "UNKNOWN" && (
                  <FileText className={`h-3 w-3 ${item.textColor}`} />
                )}
                <span className="text-xs">
                  {item.level}: <strong>{item.count.toLocaleString()}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error highlight */}
        {summary.byLevel.ERROR > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm">
              Found{" "}
              <strong className="text-red-500">{summary.byLevel.ERROR}</strong>{" "}
              errors in this log file
            </p>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link to={`/uploads/${upload.id}`}>
              View Log Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/uploads">View All Uploads</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
