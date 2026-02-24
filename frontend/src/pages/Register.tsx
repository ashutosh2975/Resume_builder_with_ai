import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Eye, EyeOff, Mail, Lock, User,
    AlertCircle, CheckCircle2, UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: "", color: "bg-border" },
        { label: "Weak", color: "bg-red-500" },
        { label: "Fair", color: "bg-amber-500" },
        { label: "Good", color: "bg-yellow-400" },
        { label: "Strong", color: "bg-emerald-500" },
    ];
    return { score, ...map[score] };
};

// ─── Component ────────────────────────────────────────────────────────────────
const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Global error string + per-field errors
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const strength = getStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError(null);
        setFieldErrors({});
        setLoading(true);
        try {
            await register(fullName.trim(), email.trim(), password);
            toast.success("Account created! 🎉", { description: "Welcome to ResumeForge. Let's build your resume!" });
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            if (err.fields) {
                setFieldErrors(err.fields);
            } else {
                setGlobalError(err.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (field: string) =>
        `w-full py-3 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60 ${fieldErrors[field]
            ? "border-destructive/60 focus:ring-destructive/30 pr-4 pl-10"
            : "border-input focus:border-primary pl-10 pr-4"
        }`;

    return (
        <div className="min-h-screen bg-background flex">
            {/* ── Left decorative panel ─────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 gradient-bg p-12 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0    w-80 h-80 rounded-full bg-white/5  blur-3xl" />

                {/* Logo */}
                <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">ResumeForge</span>
                </div>

                {/* Feature list */}
                <div className="z-10">
                    <h2 className="text-white text-2xl font-semibold mb-2">
                        Everything you need to get hired
                    </h2>
                    <p className="text-white/70 mb-8 text-sm leading-relaxed">
                        Create, manage, and polish multiple professional resumes — all in one place.
                    </p>
                    <ul className="space-y-4">
                        {[
                            "20+ ATS-optimised templates that recruiters love",
                            "AI-powered writing assistant & grammar polisher",
                            "One-click export — PDF ready in seconds",
                            "Auto-saves every change across all your devices",
                        ].map((feat) => (
                            <li key={feat} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/80 text-sm">{feat}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Social proof */}
                    <div className="mt-10 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {["J", "M", "S", "R"].map((l, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold"
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/70 text-xs">
                            Join <strong className="text-white">50,000+</strong> professionals already using ResumeForge
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: form panel ─────────────────────────────────────────────── */}
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

                    <h1 className="text-3xl font-extrabold mb-1">Create your account</h1>
                    <p className="text-muted-foreground mb-8">
                        Free forever · No credit card required
                    </p>

                    {/* Global error banner */}
                    <AnimatePresence>
                        {globalError && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 mb-6"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {globalError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fullName}
                                    onChange={(e) => { setFullName(e.target.value); setFieldErrors(f => ({ ...f, full_name: "" })); }}
                                    placeholder="Jane Smith"
                                    className={fieldClass("full_name")}
                                />
                            </div>
                            {fieldErrors.full_name && (
                                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.full_name}
                                </p>
                            )}
                        </div>

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
                                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: "" })); }}
                                    placeholder="you@example.com"
                                    className={fieldClass("email")}
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: "" })); }}
                                    placeholder="Min. 8 characters"
                                    className={`${fieldClass("password")} pr-10`}
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

                            {/* Password strength bar */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((n) => (
                                            <div
                                                key={n}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : "bg-border"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {strength.label && (
                                        <p className="text-xs text-muted-foreground">
                                            Strength: <span className="font-medium">{strength.label}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {fieldErrors.password && (
                                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                                </p>
                            )}
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
                                    Creating account…
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Create account
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">Already have an account?</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <Link
                        to="/login"
                        className="block w-full h-12 border-2 border-primary/30 hover:border-primary/60 text-primary font-semibold rounded-xl text-sm hover:bg-primary/5 transition-all flex items-center justify-center"
                    >
                        Sign in instead
                    </Link>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        By creating an account, you agree to our{" "}
                        <button className="underline hover:text-foreground transition-colors">Terms of Service</button>
                        {" "}and{" "}
                        <button className="underline hover:text-foreground transition-colors">Privacy Policy</button>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
