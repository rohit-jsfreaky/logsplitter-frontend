import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useAppAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LIMITS } from "@/types";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  BarChart3,
  Search,
  Webhook,
  User,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/upload", label: "Upload", icon: Upload },
  { path: "/uploads", label: "Uploads", icon: FolderOpen },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/search", label: "Search", icon: Search },
  { path: "/webhooks", label: "Webhooks", icon: Webhook },
];

const bottomNavItems = [
  { path: "/profile", label: "Profile", icon: User },
  { path: "/pricing", label: "Pricing", icon: CreditCard },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { signOut } = useClerk();
  const { email, permissions, checkLimit } = useAppAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const uploadLimit = checkLimit(LIMITS.MONTHLY_UPLOADS);
  const usagePercent =
    uploadLimit.max > 0 ? (uploadLimit.used / uploadLimit.max) * 100 : 0;

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b">
          <Link to="/" className="flex items-center">
            {/* Light mode logo */}
            <img
              src="/logsplitter__logo_dark.png"
              alt="LogSplitter"
              className="h-32 w-auto dark:hidden"
            />
            {/* Dark mode logo */}
            <img
              src="/logsplitter__logo_light.png"
              alt="LogSplitter"
              className="hidden h-32 w-auto dark:block"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Usage Stats */}
        {permissions && uploadLimit.max > 0 && (
          <div className="border-t p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly Uploads</span>
              <span>
                {uploadLimit.used} / {uploadLimit.max}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Bottom Navigation */}
        <nav className="space-y-1 p-4">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="cursor-pointer"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block max-w-[150px] truncate">
                    {email || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pricing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
