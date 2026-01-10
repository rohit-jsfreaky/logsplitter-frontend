import { useState, useCallback } from "react";
import { useApi } from "@/lib/api";
import type { Plan } from "@/types";

interface CheckoutResponse {
  url?: string;
  sessionId?: string;
  message?: string;
  redirect?: string;
}

interface PortalResponse {
  url: string;
}

export function useStripe() {
  const { call } = useApi();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      // Plans endpoint doesn't require auth
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/stripe/plans`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setPlans(data.data);
      } else {
        setPlansError(data.error || "Failed to fetch plans");
      }
    } catch (err) {
      setPlansError("Failed to fetch plans");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const createCheckoutSession = useCallback(
    async (planSlug: string) => {
      try {
        setLoading(true);
        const response = await call<CheckoutResponse>(
          "/api/stripe/create-checkout-session",
          {
            method: "POST",
            body: JSON.stringify({ planSlug }),
          }
        );

        if (response.success && response.data) {
          // If it's a free plan, redirect directly
          if (response.data.redirect) {
            window.location.href = response.data.redirect;
            return { success: true };
          }
          // If it's a paid plan, redirect to Stripe checkout
          if (response.data.url) {
            window.location.href = response.data.url;
            return { success: true };
          }
        }
        return {
          success: false,
          error: response.error || "Failed to create checkout",
        };
      } catch (err) {
        return { success: false, error: "Failed to create checkout" };
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  const openCustomerPortal = useCallback(async () => {
    try {
      setLoading(true);
      const response = await call<PortalResponse>(
        "/api/stripe/create-portal-session",
        {
          method: "POST",
        }
      );

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
        return { success: true };
      }
      return {
        success: false,
        error: response.error || "Failed to open portal",
      };
    } catch (err) {
      return { success: false, error: "Failed to open portal" };
    } finally {
      setLoading(false);
    }
  }, [call]);

  return {
    plans,
    plansLoading,
    plansError,
    fetchPlans,
    loading,
    createCheckoutSession,
    openCustomerPortal,
  };
}
