import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

// ── Typing animation words ──────────────────────────────────────────────────
const TYPING_WORDS = [
  "Software Engineer Resume",
  "Product Manager Resume",
  "UX Designer Resume",
  "Data Scientist Resume",
  "Marketing Manager Resume",
  "Full Stack Developer Resume",
];

function TypingText() {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const word = TYPING_WORDS[wordIdx];
    const timeout = deleting
      ? charIdx === 0
        ? setTimeout(() => { setDeleting(false); setWordIdx((i) => (i + 1) % TYPING_WORDS.length); }, 400)
        : setTimeout(() => { setText(word.slice(0, charIdx - 1)); setCharIdx((c) => c - 1); }, 40)
      : charIdx === word.length
        ? setTimeout(() => setDeleting(true), 1800)
        : setTimeout(() => { setText(word.slice(0, charIdx + 1)); setCharIdx((c) => c + 1); }, 70);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx]);

  return (
    <span className="gradient-text">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ── Mini animated resume card ──────────────────────────────────────────────────
const resumeLines = [
  { w: "55%", h: 10, accent: true, mb: 2 },
  { w: "38%", h: 6, accent: false, mb: 10 },
  { w: "30%", h: 5, accent: true, mb: 4, heading: true },
  { w: "100%", h: 4, accent: false, mb: 2 },
  { w: "90%", h: 4, accent: false, mb: 2 },
  { w: "75%", h: 4, accent: false, mb: 8 },
  { w: "30%", h: 5, accent: true, mb: 4, heading: true },
  { w: "100%", h: 4, accent: false, mb: 2 },
  { w: "80%", h: 4, accent: false, mb: 2 },
  { w: "60%", h: 4, accent: false, mb: 8 },
  { w: "30%", h: 5, accent: true, mb: 3, heading: true },
];

function AnimatedResumeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-14 max-w-3xl mx-auto"
    >
      <div className="glass-card rounded-2xl p-4 md:p-6 shadow-2xl">
        {/* Browser chrome dots */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-3 h-3 rounded-full bg-rose-400/70" />
          <div className="w-3 h-3 rounded-full bg-amber-400/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
          <div className="ml-3 flex-1 h-5 rounded bg-muted/50 max-w-[200px]" />
        </div>

        {/* Resume mockup — two column layout */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-[30%] bg-primary/8 p-4 space-y-2 border-r border-border">
              {/* Avatar circle */}
              <div className="w-14 h-14 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/30" />
              </div>
              {[70, 55, 80, 45].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  style={{ transformOrigin: "left", width: `${w}%` }}
                  className="h-2 rounded-full bg-primary/25"
                />
              ))}
              <div className="pt-3" />
              {[60, 80, 50, 70, 40].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2 + i * 0.08, duration: 0.35 }}
                  style={{ transformOrigin: "left", width: `${w}%` }}
                  className="h-2 rounded-full bg-muted"
                />
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 space-y-1">
              {resumeLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.07, duration: 0.4 }}
                  style={{
                    width: line.w,
                    height: line.h,
                    marginBottom: line.mb,
                    transformOrigin: "left",
                  }}
                  className={`rounded-full ${line.accent
                      ? line.heading
                        ? "bg-primary/60"
                        : "bg-primary/80"
                      : "bg-muted"
                    }`}
                />
              ))}
              {/* Skill chips */}
              <div className="flex gap-2 pt-2 flex-wrap">
                {["React", "TypeScript", "Node.js", "AWS"].map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.8 + i * 0.1 }}
                    className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary font-medium"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-3 flex gap-4 px-1">
          {[
            { label: "ATS Score", value: "94%" },
            { label: "Keywords", value: "28" },
            { label: "Sections", value: "6" },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 text-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
                className="text-sm font-bold gradient-text"
              >
                {value}
              </motion.div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────────

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const ctaTo = isAuthenticated ? "/dashboard" : "/register";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Gradient orbs background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      {/* Floating shapes */}
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[12%] w-14 h-14 rounded-2xl gradient-bg opacity-20 blur-sm" />
      <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-44 right-[16%] w-10 h-10 rounded-full bg-accent opacity-20 blur-sm" />
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-[22%] w-16 h-16 rounded-full bg-primary opacity-10 blur-md" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Resume Builder
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
            Build Your
            <br />
            <TypingText />
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Professional templates · Real-time preview · AI writing assistant · ATS optimization
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gradient-bg border-0 text-lg px-8 py-6 hover:opacity-90 transition-opacity shadow-lg">
              <Link to={ctaTo}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-border hover:border-primary/40">
              <Link to="/select-template">Browse Templates</Link>
            </Button>
          </div>
        </motion.div>

        {/* Animated resume mockup */}
        <AnimatedResumeCard />

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {[
            { stat: "50,000+", label: "Resumes Created" },
            { stat: "95%", label: "ATS Pass Rate" },
            { stat: "12+", label: "Pro Templates" },
          ].map(({ stat, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-bold text-foreground text-base">{stat}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
