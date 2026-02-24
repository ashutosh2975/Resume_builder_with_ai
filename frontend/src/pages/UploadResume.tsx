import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, ArrowRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useResume } from '@/context/ResumeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

type ParsedSection = { label: string; content: string };

// Simple text extractor from uploaded plain text resume
function parseResumeText(text: string): Partial<{
    fullName: string; title: string; email: string; phone: string; location: string; summary: string; skills: string[];
}> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const result: Record<string, string> = {};

    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) result.email = emailMatch[0];

    const phoneMatch = text.match(/(\+?[\d\s\-().]{7,15})/);
    if (phoneMatch) result.phone = phoneMatch[0].trim();

    // First non-empty line is likely the name
    if (lines[0] && lines[0].length < 60) result.fullName = lines[0];
    // Second line might be title
    if (lines[1] && lines[1].length < 80 && !lines[1].includes('@')) result.title = lines[1];

    return result;
}

export default function UploadResume() {
    const { setResumeData } = useResume();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
    const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFile = async (f: File) => {
        if (!f) return;
        const allowedTypes = ['text/plain', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(f.type) && !f.name.endsWith('.txt')) {
            setErrorMsg('Please upload a .txt, .pdf, or .doc/.docx file.');
            setStatus('error');
            return;
        }
        setFile(f);
        setStatus('parsing');
        setErrorMsg('');

        // Simulate parse delay
        await new Promise((r) => setTimeout(r, 1200));

        try {
            let text = '';
            if (f.type === 'text/plain' || f.name.endsWith('.txt')) {
                text = await f.text();
            } else {
                // For PDF/DOCX we can't truly parse in the browser without a library
                // So we just pre-fill with some extracted info from filename and show a notice
                text = f.name.replace(/\.[^.]+$/, '').replace(/[_\-]/g, ' ');
            }

            const parsed = parseResumeText(text);

            const sections: ParsedSection[] = [];
            if (parsed.fullName) sections.push({ label: 'Name detected', content: parsed.fullName });
            if (parsed.title) sections.push({ label: 'Title detected', content: parsed.title });
            if (parsed.email) sections.push({ label: 'Email detected', content: parsed.email });
            if (parsed.phone) sections.push({ label: 'Phone detected', content: parsed.phone });
            setParsedSections(sections);

            // Pre-fill resume context
            setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    fullName: parsed.fullName ?? prev.personalInfo.fullName,
                    title: parsed.title ?? prev.personalInfo.title,
                    email: parsed.email ?? prev.personalInfo.email,
                    phone: parsed.phone?.replace(/\D/g, '').length > 6 ? parsed.phone : prev.personalInfo.phone,
                },
            }));

            setStatus('done');
        } catch {
            setStatus('error');
            setErrorMsg('Could not parse the file. Please try a .txt file or fill in the details manually.');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleContinue = () => navigate('/select-template');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex items-center h-14 px-4 gap-3">
                    <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Link>
                    <div className="flex-1 text-center">
                        <span className="font-bold text-sm gradient-text">ResumeForge</span>
                        <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">Upload Existing Resume</span>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="h-0.5 bg-border">
                    <div className="h-full bg-gradient-to-r from-accent to-primary w-1/4 transition-all" />
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg space-y-6"
                >
                    <div>
                        <h1 className="text-2xl font-extrabold mb-1">Upload Your Resume</h1>
                        <p className="text-muted-foreground text-sm">We'll extract your information and let you edit and improve it with AI.</p>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer p-12 text-center ${dragOver
                                ? 'border-primary bg-primary/5 scale-[1.02]'
                                : status === 'done'
                                    ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                                    : status === 'error'
                                        ? 'border-destructive bg-destructive/5'
                                        : 'border-border bg-card hover:border-primary/50 hover:bg-primary/3'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                        />

                        <AnimatePresence mode="wait">
                            {status === 'idle' && (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Drop your resume here</p>
                                        <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                                    </div>
                                    <div className="flex justify-center gap-2 mt-2">
                                        {['.TXT', '.PDF', '.DOC', '.DOCX'].map((ext) => (
                                            <span key={ext} className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{ext}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {status === 'parsing' && (
                                <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto animate-pulse">
                                        <FileText className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Parsing your resume…</p>
                                        <p className="text-sm text-muted-foreground">{file?.name}</p>
                                    </div>
                                    <div className="flex justify-center gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-primary"
                                                animate={{ y: [0, -6, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {status === 'done' && (
                                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-700 dark:text-green-400">Resume parsed successfully!</p>
                                        <p className="text-sm text-muted-foreground">{file?.name}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); setParsedSections([]); }}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
                                    >
                                        <X className="h-3 w-3" /> Remove file
                                    </button>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                                        <AlertCircle className="h-8 w-8 text-destructive" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-destructive">Upload failed</p>
                                        <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}>Try Again</Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Detected fields */}
                    <AnimatePresence>
                        {parsedSections.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-4 space-y-2"
                            >
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Detected from your resume</p>
                                {parsedSections.map((s) => (
                                    <div key={s.label} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        <span className="text-muted-foreground text-xs">{s.label}:</span>
                                        <span className="font-medium text-xs">{s.content}</span>
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground pt-1">You can review and edit all fields in the next step.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Manual option */}
                    <div className="text-center text-sm text-muted-foreground">
                        Don't want to upload?{' '}
                        <button onClick={handleContinue} className="text-primary hover:underline font-medium">
                            Continue without uploading →
                        </button>
                    </div>

                    {/* Continue button */}
                    <Button
                        onClick={handleContinue}
                        disabled={status === 'parsing'}
                        className="w-full gradient-bg border-0 gap-2 h-11"
                    >
                        {status === 'done' ? 'Continue — Choose Template' : 'Skip & Choose Template'}
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Your file is processed locally. Nothing is uploaded to any server.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
