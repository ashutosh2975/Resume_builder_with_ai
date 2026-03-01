import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Search, Check, ChevronLeft, FileText, Upload,
  AlertCircle, Sparkles, Zap, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from '@/data/templates';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { useResume, defaultResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

type Step = 'upload' | 'template';

interface ExtractedData {
  personalInfo: { fullName: string; email: string; phone: string; location: string; title: string; website: string; linkedin: string; photo: string };
  summary: string;
  experience: { id: string; company: string; position: string; startDate: string; endDate: string; description: string; link?: string }[];
  education: { id: string; school: string; degree: string; field: string; startDate: string; endDate: string; link?: string }[];
  projects: { id: string; name: string; role: string; url: string; link?: string; startDate: string; endDate: string; description: string }[];
  extracurricular?: { id: string; title: string; organization: string; role: string; startDate: string; endDate: string; description: string; link?: string }[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

export default function UploadResume() {
  const { setResumeData, setSelectedTemplate } = useResume();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'manual' | null>(null);
  const [error, setError] = useState('');

  const [scale, setScale] = useState(0.75);
  const [selectedTemplate, setSelectedTemplateLocal] = useState('modern-01');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  // preview scaling
  const previewTemplate = hovered ?? selectedTemplate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateScale() {
      const container = containerRef.current;
      const inner = previewInnerRef.current;
      if (!container || !inner) return;

      const paneW = container.offsetWidth;
      const usableW = Math.min(paneW - 48, 620);
      const s = usableW / 794;
      setScale(s);

      const wrapper = inner.parentElement;
      if (wrapper) {
        wrapper.style.height = `${inner.scrollHeight * s}px`;
        wrapper.style.width = `${794 * s}px`;
      }
    }

    updateScale();

    const ro = new ResizeObserver(updateScale);
    ro.observe(container);
    if (previewInnerRef.current) ro.observe(previewInnerRef.current);

    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [previewTemplate]);

  const filtered = TEMPLATES.filter((t) => {
    const cat = activeCategory === 'all' || t.category === activeCategory;
    const q = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return cat && q;
  });

  const handleFileSelect = async (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF, DOCX, or TXT.');
      toast.error('Invalid file type');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB.');
      toast.error('File too large');
      return;
    }

    await extractResume(selectedFile);
  };

  const extractResume = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading resume...');
      const res = await fetch(`${API_BASE}/ai/parse-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to extract resume');
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error('Extraction failed');
      }

      setExtractedData(data.result);
      setExtractionMethod(data.method);
      
      toast.success(
        data.method === 'ai'
          ? 'Resume extracted with AI! 🤖'
          : 'Resume extracted manually ⚡'
      );

      setStep('template');
    } catch (err: any) {
      const message = err.message || 'Failed to extract resume. Please try again.';
      setError(message);
      toast.error(message);
      console.error('❌ Error:', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = () => {
    if (!extractedData) {
      toast.error('No resume data found');
      return;
    }

    const fullData = {
      personalInfo: { ...defaultResume.personalInfo, ...extractedData.personalInfo },
      summary: extractedData.summary || '',
      experience: extractedData.experience || [],
      education: extractedData.education || [],
      projects: (extractedData.projects || []).map(p => ({
        id: p.id || '',
        name: p.name || '',
        role: p.role || '',
        url: p.url || '',
        link: p.link || '',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        description: p.description || '',
      })),
      extracurricular: (extractedData.extracurricular || []).map(ec => ({
        id: ec.id || '',
        title: ec.title || '',
        organization: ec.organization || '',
        role: ec.role || '',
        startDate: ec.startDate || '',
        endDate: ec.endDate || '',
        description: ec.description || '',
        link: ec.link || '',
      })),
      skills: extractedData.skills || [],
      languages: extractedData.languages || [],
      certifications: extractedData.certifications || [],
    };

    setResumeData(fullData);
    setSelectedTemplate(selectedTemplate);
    toast.success('Resume loaded! Starting editor...');
    navigate('/builder');
  };

  // ─── UPLOAD STEP ──────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center h-14 px-4 gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1 text-center">
              <span className="font-bold text-sm gradient-text">ResumeForge</span>
              <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">Step 1 of 2 — Upload Resume</span>
            </div>
            <ThemeToggle />
          </div>
          <div className="h-0.5 bg-border">
            <div className="h-full bg-gradient-to-r from-primary to-accent w-1/2 transition-all" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto w-full px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Upload Your Resume</h1>
              <p className="text-muted-foreground">PDF, DOCX, or TXT (Max 5MB)</p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                hidden
              />

              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <p className="font-semibold">Extracting resume data...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold mb-1">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground">or click to browse (PDF, DOCX, TXT • Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p>✨ We'll extract your resume data using AI, then you can choose a template and edit before exporting.</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ─── TEMPLATE SELECTION STEP (same UI as SelectTemplate.tsx) ──────────
  if (step === 'template' && extractedData) {
    const methodBadge = extractionMethod === 'ai' ? (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        AI Extracted
      </div>
    ) : (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-lg text-xs font-semibold">
        <Zap className="w-3.5 h-3.5" />
        Manual Extracted
      </div>
    );

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center h-14 px-4 gap-3">
            <button
              onClick={() => {
                setStep('upload');
                setExtractedData(null);
                setExtractionMethod(null);
                setError('');
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1 text-center">
              <span className="font-bold text-sm gradient-text">ResumeForge</span>
              <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">Step 2 of 2 — Choose Template</span>
            </div>
            <div className="flex items-center gap-2">
              {methodBadge}
              <ThemeToggle />
            </div>
          </div>
          <div className="h-0.5 bg-border">
            <div className="h-full bg-gradient-to-r from-primary to-accent w-full transition-all" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Template Grid ── */}
          <div className="w-full lg:w-[52%] flex flex-col overflow-hidden border-r border-border">
            {/* Search + filters */}
            <div className="p-4 border-b border-border space-y-3 bg-card/50">
              <div>
                <h1 className="text-xl font-bold">Choose Your Template</h1>
                <p className="text-sm text-muted-foreground">Hover over a template to preview it with your data</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search templates…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key as TemplateCategory | 'all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === cat.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {cat.label}
                    <span className="ml-1.5 text-[10px] opacity-60">
                      ({cat.key === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat.key).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Use This Template — TOP CTA ── */}
            <div className="px-4 pt-2 pb-1">
              <Button onClick={handleContinue} size="sm" className="w-full gradient-bg border-0 gap-2 text-xs">
                Use <span className="font-bold">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span> Template
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory + search}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {filtered.map((tpl, i) => {
                    const isSelected = tpl.id === selectedTemplate;
                    return (
                      <motion.div
                        key={tpl.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.015 }}
                        className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${isSelected
                          ? 'border-primary shadow-md ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/40'
                        }`}
                        onClick={() => setSelectedTemplateLocal(tpl.id)}
                        onMouseEnter={() => setHovered(tpl.id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {/* Template thumbnail */}
                        <div
                          className="h-[90px] overflow-hidden relative"
                          style={{ backgroundColor: '#f8fafc' }}
                        >
                          <MiniTemplateThumbnail
                            accentColor={tpl.accentColor}
                            layout={tpl.layout}
                            darkSidebar={tpl.darkSidebar}
                            sectionStyle={tpl.sectionStyle}
                            headerStyle={tpl.headerStyle}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="px-2.5 py-2 bg-card border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate">{tpl.name}</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize"
                              style={{ backgroundColor: `${tpl.accentColor}20`, color: tpl.accentColor }}
                            >
                              {tpl.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="col-span-3 py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
                      <FileText className="h-8 w-8 opacity-30" />
                      No templates found for "{search}"
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Continue button BOTTOM */}
            <div className="px-4 pb-4 border-t border-border bg-card pt-3">
              <Button onClick={handleContinue} className="w-full gradient-bg border-0 gap-2">
                Use This Template — {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Right: Full Live Preview ── */}
          <div className="hidden lg:flex flex-col flex-1 bg-muted/30 overflow-hidden relative">
            {/* Sticky header bar */}
            <div className="shrink-0 bg-card/90 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
              <span className="text-xs font-medium text-muted-foreground">
                Preview —{' '}
                <span className="text-foreground font-semibold">{TEMPLATES.find(t => t.id === previewTemplate)?.name}</span>
                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Your Data</span>
              </span>
              <button
                onClick={handleContinue}
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
              >
                Use This Template <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Scrollable preview area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex justify-center py-10 px-6 min-h-full" ref={containerRef}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewTemplate}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="relative"
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        ref={previewInnerRef}
                        style={{
                          width: 794,
                          transformOrigin: 'top left',
                          transform: `scale(${scale})`,
                          borderRadius: 4,
                          boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <ResumePreview
                          data={extractedData as never}
                          templateId={previewTemplate}
                          sectionOrder={['summary', 'experience', 'projects', 'education', 'skills']}
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── MINI TEMPLATE THUMBNAIL ───
function MiniTemplateThumbnail({
  accentColor, layout, darkSidebar, sectionStyle, headerStyle,
}: {
  accentColor: string;
  layout: string;
  darkSidebar: boolean;
  sectionStyle: string;
  headerStyle: string;
}) {
  const isLeft = layout === 'sidebar-left';
  const isRight = layout === 'sidebar-right';
  const isSidebar = isLeft || isRight;
  const isTwoCol = layout === 'two-column';
  const sidebarBg = darkSidebar ? accentColor : `${accentColor}18`;
  const sidebarText = darkSidebar ? 'rgba(255,255,255,0.9)' : accentColor;
  const sidebarMuted = darkSidebar ? 'rgba(255,255,255,0.55)' : '#94a3b8';
  const isBanner = headerStyle === 'banner';
  const isCentered = headerStyle === 'centered';

  const T = (text: string, style: React.CSSProperties) => (
    <div style={{ lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', ...style }}>{text}</div>
  );

  const Line = ({ w = '100%', muted = false }: { w?: string; muted?: boolean }) => (
    <div style={{ height: 1.5, borderRadius: 1, backgroundColor: muted ? '#d1d5db' : '#e5e7eb', width: w, marginBottom: 1.5 }} />
  );

  const Heading = ({ label }: { label: string }) => {
    if (sectionStyle === 'filled') return (
      <div style={{ backgroundColor: `${accentColor}22`, margin: '3px -4px 2px', padding: '1.5px 4px' }}>
        {T(label, { fontSize: 3.5, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 })}
      </div>
    );
    if (sectionStyle === 'tag') return (
      <div style={{ display: 'inline-block', backgroundColor: accentColor, borderRadius: 20, padding: '1px 4px', marginBottom: 2 }}>
        {T(label, { fontSize: 3.5, fontWeight: 800, color: '#fff' })}
      </div>
    );
    return (
      <div style={{ borderBottom: `1px solid ${accentColor}`, paddingBottom: 1, marginBottom: 2 }}>
        {T(label, { fontSize: 3.5, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 })}
      </div>
    );
  };

  const Header = ({ inside = false }: { inside?: boolean }) => {
    const nameColor = inside ? sidebarText : (isBanner ? '#fff' : '#111827');
    const titleColor = inside ? sidebarMuted : accentColor;
    const bg = (isBanner && !inside) ? accentColor : 'transparent';
    const pad = (isBanner && !inside) ? '5px 5px 4px' : '0 0 3px';
    const align = (!inside && isCentered) ? 'center' as const : 'left' as const;
    return (
      <div style={{ backgroundColor: bg, padding: pad, textAlign: align, borderBottom: (!isBanner && !inside) ? `1.5px solid ${accentColor}` : undefined, marginBottom: 3 }}>
        {T('ALEX JOHNSON', { fontSize: 6, fontWeight: 900, color: nameColor, letterSpacing: 0.3 })}
        {T('Senior Software Engineer', { fontSize: 3.5, color: titleColor, fontWeight: 600, marginTop: 0.5 })}
        {!inside && (
          <div style={{ display: 'flex', gap: 5, marginTop: 1.5, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
            {T('✉ alex@example.com', { fontSize: 2.8, color: isBanner ? 'rgba(255,255,255,0.75)' : '#9ca3af' })}
            {T('📍 San Francisco, CA', { fontSize: 2.8, color: isBanner ? 'rgba(255,255,255,0.75)' : '#9ca3af' })}
          </div>
        )}
      </div>
    );
  };

  const Sidebar = () => (
    <div style={{ padding: '5px 4px', height: '100%', backgroundColor: sidebarBg, overflow: 'hidden' }}>
      <Header inside />
      {T('CONTACT', { fontSize: 3, fontWeight: 800, color: sidebarMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 })}
      {['✉ alex@ex.com', '📞 555-0123', '📍 SF, CA'].map(c => (
        <div key={c} style={{ marginBottom: 1.2 }}>{T(c, { fontSize: 2.8, color: sidebarMuted })}</div>
      ))}
      <div style={{ height: 3 }} />
      {T('SKILLS', { fontSize: 3, fontWeight: 800, color: sidebarMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 })}
      {['React', 'TypeScript', 'Node.js', 'AWS', 'Python'].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1.2 }}>
          <span style={{ fontSize: 3, color: sidebarText }}>▸</span>
          {T(s, { fontSize: 2.8, color: sidebarText })}
        </div>
      ))}
      <div style={{ height: 3 }} />
      {T('EDUCATION', { fontSize: 3, fontWeight: 800, color: sidebarMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 })}
      {T('B.S. Computer Science', { fontSize: 2.8, color: sidebarText, fontWeight: 700 })}
      {T('MIT · 2016 – 2020', { fontSize: 2.8, color: sidebarMuted })}
    </div>
  );

  const MainBody = ({ compact = false }: { compact?: boolean }) => (
    <div style={{ overflow: 'hidden' }}>
      {!compact && <Header />}
      <div style={{ marginBottom: 4 }}>
        <Heading label="Summary" />
        <Line w="100%" /><Line w="90%" /><Line w="75%" />
      </div>
      <div style={{ marginBottom: 4 }}>
        <Heading label="Work Experience" />
        <div style={{ marginBottom: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0.5 }}>
            {T('Senior Engineer', { fontSize: 3.5, fontWeight: 800, color: '#1f2937' })}
            {T('2022 – Present', { fontSize: 2.6, color: '#9ca3af' })}
          </div>
          {T('TechCorp Inc.', { fontSize: 3, color: accentColor, fontWeight: 700, marginBottom: 1 })}
          {['Architected microservices for 2M+ users', 'Reduced API latency by 40%'].map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 2, marginBottom: 1 }}>
              <span style={{ fontSize: 3, color: accentColor, flexShrink: 0 }}>▸</span>
              {T(b, { fontSize: 2.7, color: '#6b7280' })}
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0.5 }}>
            {T('Software Engineer', { fontSize: 3.5, fontWeight: 800, color: '#1f2937' })}
            {T('2020 – 2021', { fontSize: 2.6, color: '#9ca3af' })}
          </div>
          {T('StartupXYZ', { fontSize: 3, color: accentColor, fontWeight: 700, marginBottom: 1 })}
          <div style={{ display: 'flex', gap: 2 }}>
            <span style={{ fontSize: 3, color: accentColor }}>▸</span>
            {T('Built React + Node.js full-stack applications', { fontSize: 2.7, color: '#6b7280' })}
          </div>
        </div>
      </div>
      {!compact && (
        <div style={{ marginBottom: 4 }}>
          <Heading label="Education" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {T('B.S. in Computer Science', { fontSize: 3.2, fontWeight: 700, color: '#1f2937' })}
            {T('2016–2020', { fontSize: 2.6, color: '#9ca3af' })}
          </div>
          {T('Massachusetts Institute of Technology', { fontSize: 2.8, color: accentColor })}
        </div>
      )}
      <div>
        <Heading label="Skills" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {['React', 'TypeScript', 'Node.js', 'AWS', 'Python', 'PostgreSQL'].map(s => (
            <span key={s} style={{
              fontSize: 2.7, padding: '0.8px 3px', borderRadius: 2,
              backgroundColor: `${accentColor}20`, color: accentColor, fontWeight: 700
            }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLeft) return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '37%', flexShrink: 0 }}><Sidebar /></div>
      <div style={{ flex: 1, padding: '5px 4px', overflow: 'hidden' }}><MainBody compact /></div>
    </div>
  );

  if (isRight) return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ flex: 1, padding: '5px 4px', overflow: 'hidden' }}>
        <Header />
        <MainBody compact />
      </div>
      <div style={{ width: '33%', flexShrink: 0 }}><Sidebar /></div>
    </div>
  );

  if (isTwoCol) return (
    <div style={{ padding: '5px', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        <div>
          <Heading label="Experience" />
          {T('Senior Engineer', { fontSize: 3.2, fontWeight: 800, color: '#1f2937' })}
          {T('TechCorp Inc.', { fontSize: 2.8, color: accentColor, fontWeight: 700, marginBottom: 1 })}
          <Line /><Line w="85%" />
        </div>
        <div>
          <Heading label="Education" />
          {T('B.S. Computer Science', { fontSize: 3, fontWeight: 700, color: '#1f2937' })}
          {T('MIT · 2016–2020', { fontSize: 2.8, color: accentColor, marginBottom: 3 })}
          <Heading label="Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {['React', 'TypeScript', 'AWS'].map(s => (
              <span key={s} style={{ fontSize: 2.5, padding: '0.5px 2.5px', backgroundColor: `${accentColor}20`, color: accentColor, borderRadius: 2, fontWeight: 700 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '5px', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <MainBody />
    </div>
  );
}
