import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="gradient-bg rounded-lg p-1.5">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>ResumeForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            /* ── Logged-in state ── */
            <>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="max-w-[120px] truncate">{user?.full_name}</span>
              </div>
              <Button variant="ghost" asChild size="sm">
                <Link to="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign out
              </Button>
            </>
          ) : (
            /* ── Logged-out state ── */
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="gradient-bg border-0">
                <Link to="/register">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/50 bg-card p-4 space-y-3"
        >
          <a href="#features" className="block text-sm text-muted-foreground">Features</a>
          <a href="#how-it-works" className="block text-sm text-muted-foreground">How It Works</a>
          {isAuthenticated ? (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="gradient-bg border-0 w-full">
                <Link to="/register">Get Started Free</Link>
              </Button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
