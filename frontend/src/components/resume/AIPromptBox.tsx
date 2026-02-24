import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enhanceText, parsePrompt, type AIMode } from '@/lib/aiEnhance';

const QUICK_PROMPTS = [
    { label: 'Fix Grammar', prompt: 'Improve grammar and fix spelling errors' },
    { label: 'ATS-Friendly', prompt: 'Make my resume ATS-friendly with keywords' },
    { label: 'Shorten Summary', prompt: 'Shorten my summary to be more concise' },
    { label: 'Expand Experience', prompt: 'Expand my work experience with more detail' },
    { label: 'Strong Verbs', prompt: 'Rewrite with powerful action verbs' },
    { label: 'Regenerate', prompt: 'Regenerate and rewrite in a fresh style' },
];

interface AIPromptBoxProps {
    currentText: string;
    sectionLabel?: string;
    onApply: (newText: string) => void;
}

export function AIPromptBox({ currentText, sectionLabel, onApply }: AIPromptBoxProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [mode, setMode] = useState<AIMode>('improve');

    const runEnhance = async (customPrompt?: string) => {
        const p = customPrompt ?? prompt;
        if (!p.trim() || !currentText) return;
        const { mode: detectedMode } = parsePrompt(p);
        setMode(detectedMode);
        setLoading(true);
        setResult(null);
        try {
            const enhanced = await enhanceText(currentText, detectedMode);
            setResult(enhanced);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result);
            setResult(null);
            setPrompt('');
        }
    };

    const handleDiscard = () => {
        setResult(null);
        setPrompt('');
    };

    const MODE_LABELS: Record<AIMode, string> = {
        improve: 'Improved',
        shorten: 'Shortened',
        expand: 'Expanded',
        ats: 'ATS-Optimized',
        regenerate: 'Regenerated',
    };

    return (
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="gradient-bg rounded-lg p-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold">AI Assistant</span>
                {sectionLabel && <span className="text-xs text-muted-foreground">— {sectionLabel}</span>}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={`e.g. "Improve my ${sectionLabel?.toLowerCase() ?? 'text'} section with action verbs"`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runEnhance()}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    disabled={loading}
                />
                <Button
                    size="sm"
                    onClick={() => runEnhance()}
                    disabled={loading || !prompt.trim()}
                    className="gradient-bg border-0 shrink-0"
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
            </div>

            {/* Quick prompts */}
            {!result && !loading && (
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((qp) => (
                        <button
                            key={qp.label}
                            onClick={() => { setPrompt(qp.prompt); runEnhance(qp.prompt); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            <Zap className="h-2.5 w-2.5" /> {qp.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading animation */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-primary"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                        AI is generating…
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result preview */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-green-600">{MODE_LABELS[mode]} ✓</span>
                            <button onClick={handleDiscard} className="text-xs text-muted-foreground hover:text-foreground">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900 whitespace-pre-line dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                            {result}
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleApply} className="gradient-bg border-0 text-xs h-7">
                                ✓ Apply Changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDiscard} className="text-xs h-7">
                                Discard
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
