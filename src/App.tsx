import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, useAppAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { PricingPage } from "@/pages/PricingPage";
import { UploadPage } from "@/pages/UploadPage";
import { UploadsPage } from "@/pages/UploadsPage";
import { UploadDetailPage } from "@/pages/UploadDetailPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SearchPage } from "@/pages/SearchPage";
import { WebhooksPage } from "@/pages/WebhooksPage";
import { WebhookDetailPage } from "@/pages/WebhookDetailPage";
import { LoadingState } from "@/components/LoadingState";
import { Toaster } from "@/components/ui/sonner";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

function AppRoutes() {
  const { isLoaded, isSignedIn } = useAppAuth();

  if (!isLoaded) return <LoadingState />;

  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="/sign-in" element={<AuthPage />} />
        <Route path="/sign-up" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/uploads" element={<UploadsPage />} />
        <Route path="/uploads/:id" element={<UploadDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/webhooks" element={<WebhooksPage />} />
        <Route path="/webhooks/:id" element={<WebhookDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function ClerkProviderWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </ClerkProviderWithRouter>
    </BrowserRouter>
  );
}

export default App;
