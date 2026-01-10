import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { Plan } from "@/types";

interface PlanCardProps {
  plan: Plan;
  currentPlan?: string;
  onSelect: (planSlug: string) => void;
  loading?: boolean;
  featured?: boolean;
}

export function PlanCard({
  plan,
  currentPlan,
  onSelect,
  loading,
  featured,
}: PlanCardProps) {
  const isCurrent = currentPlan === plan.slug;
  const isFree = plan.price === 0;
  const isDowngrade = currentPlan && !isCurrent && isFree;
  const isUpgrade =
    currentPlan && !isCurrent && !isFree && currentPlan === "free-plan";

  return (
    <Card
      className={`relative flex flex-col ${
        featured ? "border-primary shadow-lg ring-1 ring-primary/20" : ""
      } ${isCurrent ? "border-primary/50 bg-primary/5" : ""}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 px-3">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        <CardDescription className="pt-2">
          {isFree ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">
                ${(plan.price / 100).toFixed(0)}
              </span>
              <span className="text-muted-foreground">/{plan.interval}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              {plan.limits.monthlyUploads === -1
                ? "Unlimited uploads"
                : `${plan.limits.monthlyUploads} uploads/month`}
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{plan.limits.maxFileSizeMb}MB max file size</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "outline" : featured ? "default" : "secondary"}
          disabled={isCurrent || loading}
          onClick={() => onSelect(plan.slug)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrent ? (
            "Current Plan"
          ) : isDowngrade ? (
            "Downgrade"
          ) : isUpgrade ? (
            "Upgrade Now"
          ) : isFree ? (
            "Get Started"
          ) : (
            "Subscribe"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
