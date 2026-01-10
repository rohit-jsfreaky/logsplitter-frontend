import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Calendar } from "lucide-react";
import type { LogLevel } from "@/types";
import type { SearchFilters, SearchSuggestion } from "@/hooks/useSearch";

interface SearchFormProps {
  filters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
}

const LOG_LEVELS: { value: LogLevel | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "ERROR", label: "Error" },
  { value: "WARN", label: "Warning" },
  { value: "INFO", label: "Info" },
  { value: "DEBUG", label: "Debug" },
  { value: "UNKNOWN", label: "Unknown" },
];

export function SearchForm({
  filters,
  onSearch,
  onClear,
  suggestions,
  loading,
}: SearchFormProps) {
  const [localQuery, setLocalQuery] = useState(filters.query);
  const [level, setLevel] = useState<LogLevel | "">(filters.level || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query: localQuery,
      level: level || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setLocalQuery("");
    setLevel("");
    setStartDate("");
    setEndDate("");
    onClear();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.message);
    setLevel(suggestion.level);
    onSearch({
      query: suggestion.message,
      level: suggestion.level,
    });
  };

  const hasFilters = localQuery || level || startDate || endDate;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search logs..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={level}
              onValueChange={(val) => setLevel(val as LogLevel | "")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {LOG_LEVELS.map((l) => (
                  <SelectItem
                    key={l.value || "all"}
                    value={l.value || "all-levels"}
                  >
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Advanced filters toggle */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showAdvanced ? "Hide" : "Show"} Advanced Filters
            </Button>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && !localQuery && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm text-muted-foreground">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 5).map((s, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    <Badge
                      variant={
                        s.level === "ERROR" ? "destructive" : "secondary"
                      }
                      className="mr-1 text-[10px] px-1"
                    >
                      {s.level}
                    </Badge>
                    <span className="truncate max-w-[200px]">{s.message}</span>
                    <span className="ml-1 text-muted-foreground">
                      ({s.count})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
