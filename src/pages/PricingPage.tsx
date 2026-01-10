import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStripe } from "@/hooks/useStripe";
import { useAppAuth } from "@/contexts/AuthContext";
import { PlanCard } from "@/components/PlanCard";
import { toast } from "sonner";
import {
  AlertCircle,
  RefreshCw,
  CreditCard,
  Settings,
  Zap,
} from "lucide-react";

export function PricingPage() {
  const { permissions } = useAppAuth();
  const {
    plans,
    plansLoading,
    plansError,
    fetchPlans,
    loading: checkoutLoading,
    createCheckoutSession,
    openCustomerPortal,
  } = useStripe();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const currentPlan = permissions?.plan || "free-plan";
  const isPaidPlan = currentPlan !== "free-plan";

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanSelect = async (planSlug: string) => {
    setSelectedPlan(planSlug);
    const result = await createCheckoutSession(planSlug);

    if (!result.success) {
      toast.error(result.error || "Failed to process request");
      setSelectedPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    const result = await openCustomerPortal();

    if (!result.success) {
      toast.error(result.error || "Failed to open billing portal");
    }
  };

  if (plansLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{plansError}</span>
            <Button variant="outline" size="sm" onClick={fetchPlans}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that fits your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      {/* Current Plan Banner */}
      {isPaidPlan && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  You're on the{" "}
                  {currentPlan.replace("-plan", "").replace(/-/g, " ")} plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription and billing
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={checkoutLoading}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            currentPlan={currentPlan}
            onSelect={handlePlanSelect}
            loading={checkoutLoading && selectedPlan === plan.slug}
            featured={index === 1} // Middle plan is featured
          />
        ))}
      </div>

      {/* FAQ / Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-medium text-foreground">Secure Payments</p>
              <p>All payments are processed securely through Stripe.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Cancel Anytime</p>
              <p>
                No long-term contracts. Cancel your subscription at any time.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Instant Access</p>
              <p>Get immediate access to all features after subscribing.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Prorated Billing</p>
              <p>
                When upgrading, you only pay the difference for the remaining
                period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
