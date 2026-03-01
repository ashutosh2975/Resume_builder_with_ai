import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Login: React.FC = () => {
    const { login, backendOnline } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            toast.success("Welcome back! 👋", { description: "You've signed in successfully." });
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* ── Left: Decorative Panel ───────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 gradient-bg p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

                {/* Logo */}
                <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">ResumeForge</span>
                </div>

                {/* Testimonial / headline */}
                <div className="z-10">
                    <blockquote className="text-white/90 text-2xl font-semibold leading-snug mb-6">
                        "Land your dream job with a resume that stands out — crafted by you, polished by AI."
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">Alex Johnson</p>
                            <p className="text-white/60 text-xs">Senior Engineer · Got hired at Google</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { label: "Resumes Created", value: "50K+" },
                            { label: "Hire Rate", value: "87%" },
                            { label: "Templates", value: "20+" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                                <p className="text-white text-xl font-bold">{s.value}</p>
                                <p className="text-white/60 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: Form Panel ────────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="gradient-bg rounded-lg p-1.5">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <span className="gradient-text font-bold text-lg">ResumeForge</span>
                    </Link>

                    <h1 className="text-3xl font-extrabold mb-1">Welcome back</h1>
                    <p className="text-muted-foreground mb-8">Sign in to continue building your career.</p>

                    {/* Backend offline warning */}
                    <AnimatePresence>
                        {!backendOnline && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded-xl px-4 py-3 mb-6"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                Backend server is unreachable. Please start the API on <code>localhost:5000</code> before logging in.
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Error banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 mb-6"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline focus:outline-none"
                                    tabIndex={-1}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPass ? "Hide password" : "Show password"}
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 gradient-bg text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign in
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">Don't have an account?</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <Link
                        to="/register"
                        className="block w-full h-12 border-2 border-primary/30 hover:border-primary/60 text-primary font-semibold rounded-xl text-sm hover:bg-primary/5 transition-all flex items-center justify-center"
                    >
                        Create a free account
                    </Link>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        By signing in, you agree to our{" "}
                        <button className="underline hover:text-foreground transition-colors">Terms of Service</button>
                        {" "}and{" "}
                        <button className="underline hover:text-foreground transition-colors">Privacy Policy</button>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
