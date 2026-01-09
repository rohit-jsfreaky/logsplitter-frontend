import { useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";

export function AuthPage() {
  const location = useLocation();
  const isSignUp = location.pathname === "/sign-up";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Logo - switches between light and dark versions */}
      <div className="relative z-10 mb-8">
        {/* Light mode logo */}
        <img
          src="/logsplitter__logo_dark.png"
          alt="LogSplitter"
          className="h-12 w-auto dark:hidden"
        />
        {/* Dark mode logo */}
        <img
          src="/logsplitter__logo_light.png"
          alt="LogSplitter"
          className="hidden h-12 w-auto dark:block"
        />
      </div>

      {/* Tagline */}
      <p className="relative z-10 mb-8 text-center text-muted-foreground">
        {isSignUp
          ? "Create your account to get started"
          : "Sign in to analyze your logs"}
      </p>

      {/* Auth Component */}
      <div className="relative z-10 w-full max-w-md">
        {isSignUp ? (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border border-border/50 bg-card/80 backdrop-blur-sm",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        ) : (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border border-border/50 bg-card/80 backdrop-blur-sm",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Organize, analyze, and understand your logs with ease
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span>Fast log parsing</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span>Smart grouping</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span>Error insights</span>
        </div>
      </div>
    </div>
  );
}
