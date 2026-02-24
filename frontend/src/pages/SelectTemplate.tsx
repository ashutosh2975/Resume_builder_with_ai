import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Check, ChevronLeft, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from '@/data/templates';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

// Sample data shown inside template previews — rich and fully realistic
const SAMPLE_DATA = {
    personalInfo: {
        fullName: 'Alex Johnson',
        title: 'Senior Software Engineer',
        email: 'alex.johnson@email.com',
        phone: '+1 (415) 555-0123',
        location: 'San Francisco, CA',
        website: 'alexjohnson.dev',
        linkedin: 'linkedin.com/in/alexjohnson',
        photo: '',
    },
    summary: 'Results-driven software engineer with 6+ years of experience building scalable web applications and leading cross-functional teams. Proven track record of delivering high-impact products serving millions of users. Passionate about clean architecture, developer tooling, and mentoring junior engineers.',
    education: [
        {
            id: '1',
            school: 'Massachusetts Institute of Technology',
            degree: 'B.S.',
            field: 'Computer Science',
            startDate: 'Sep 2016',
            endDate: 'May 2020',
        },
        {
            id: '2',
            school: 'Stanford University',
            degree: 'M.S.',
            field: 'Artificial Intelligence',
            startDate: 'Sep 2020',
            endDate: 'Jun 2022',
        },
    ],
    experience: [
        {
            id: '1',
            company: 'Google',
            position: 'Senior Software Engineer',
            startDate: 'Jan 2022',
            endDate: 'Present',
            description: 'Architected microservices platform serving 10M+ daily active users\nReduced API latency by 40% through Redis caching and query optimization\nMentored team of 6 junior engineers and conducted 100+ technical interviews\nDrove CI/CD best practices reducing deployment time by 60%',
        },
        {
            id: '2',
            company: 'Stripe',
            position: 'Software Engineer II',
            startDate: 'Jul 2020',
            endDate: 'Dec 2021',
            description: 'Built React + TypeScript payment dashboard processing $2B+ annually\nDelivered 15 features across 4 quarters with 99.9% uptime\nCollaborated with product and design to ship mobile-responsive UI\nReduced bundle size by 35% through code splitting and lazy loading',
        },
        {
            id: '3',
            company: 'Airbnb',
            position: 'Software Engineer',
            startDate: 'Jun 2019',
            endDate: 'Jun 2020',
            description: 'Developed internal data pipeline tools used by 200+ engineers\nImproved host dashboard performance by 50% via React Query migration\nContributed to open-source design system with 4K+ GitHub stars',
        },
    ],
    projects: [
        {
            id: '1',
            name: 'AI Resume Optimizer',
            role: 'Creator & Maintainer',
            url: 'github.com/alex/resume-ai',
            startDate: 'Mar 2023',
            endDate: 'Present',
            description: 'Open-source tool with 2,000+ GitHub stars using GPT-4 to optimize resumes for ATS\nBuilt with Next.js, Prisma, and PostgreSQL; 10K monthly active users',
        },
        {
            id: '2',
            name: 'CloudMetrics Dashboard',
            role: 'Lead Developer',
            url: 'cloudmetrics.io',
            startDate: 'Jan 2022',
            endDate: 'Aug 2022',
            description: 'Real-time AWS cost monitoring dashboard with alerting and forecasting\nProcesses 500M+ data points/day using Apache Kafka and ClickHouse',
        },
        {
            id: '3',
            name: 'DevFlow CLI',
            role: 'Author',
            url: 'npmjs.com/package/devflow',
            startDate: 'Oct 2021',
            endDate: 'Dec 2021',
            description: 'CLI tool to scaffold full-stack projects — downloaded 50K+ times on npm\nSupports React, Vue, Next.js, Express, and FastAPI templates',
        },
    ],
    skills: [
        'React', 'TypeScript', 'Node.js', 'Python', 'AWS',
        'PostgreSQL', 'Docker', 'Kubernetes', 'GraphQL', 'Redis',
        'Next.js', 'System Design',
    ],
    languages: ['English (Native)', 'Spanish (Professional)', 'French (Conversational)'],
    certifications: [
        'AWS Solutions Architect — Professional',
        'Google Cloud Professional Data Engineer',
        'Certified Kubernetes Administrator (CKA)',
    ],
};

export default function SelectTemplate() {
    const { selectedTemplate, setSelectedTemplate } = useResume();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
    const [search, setSearch] = useState('');
    const [hovered, setHovered] = useState<string | null>(null);

    // preview scaling helpers
    const containerRef = useRef<HTMLDivElement>(null);
    const previewInnerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.75);
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

            // Force the parent wrapper to the EXACT scaled height of the resume
            // to ensure the scroll container (overflow-y-auto) knows the truth.
            const wrapper = inner.parentElement;
            if (wrapper) {
                wrapper.style.height = `${inner.scrollHeight * s}px`;
                wrapper.style.width = `${794 * s}px`;
            }
        }

        updateScale();

        // Observe BOTH container (width changes) and inner content (height changes)
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

    const handleContinue = () => {
        navigate('/builder');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center h-14 px-4 gap-3">
                    <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Link>
                    <div className="flex-1 text-center">
                        <span className="font-bold text-sm gradient-text">ResumeForge</span>
                        <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">Step 1 of 4 — Choose Template</span>
                    </div>
                    <ThemeToggle />
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-border">
                    <div className="h-full bg-gradient-to-r from-primary to-accent w-1/4 transition-all" />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Left: Template Grid ── */}
                <div className="w-full lg:w-[52%] flex flex-col overflow-hidden border-r border-border">
                    {/* Search + filters */}
                    <div className="p-4 border-b border-border space-y-3 bg-card/50">
                        <div>
                            <h1 className="text-xl font-bold">Choose Your Template</h1>
                            <p className="text-sm text-muted-foreground">Hover over a template to preview it with sample data</p>
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
                                            onClick={() => setSelectedTemplate(tpl.id)}
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
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro Sample Data</span>
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
                                    {/* The magic wrapper that holds the scale and provides correct height to parent scroll */}
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
                                                data={SAMPLE_DATA as never}
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

// ─── Realistic mini resume thumbnail ───────────────────────────────────────
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

    // ── helpers ──────────────────────────────────────────────────────────────
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
            {/* Summary */}
            <div style={{ marginBottom: 4 }}>
                <Heading label="Summary" />
                <Line w="100%" /><Line w="90%" /><Line w="75%" />
            </div>
            {/* Experience */}
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
            {/* Education */}
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
            {/* Skills */}
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

    // ── Sidebar-left layout ───────────────────────────────────────────────────
    if (isLeft) return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ width: '37%', flexShrink: 0 }}><Sidebar /></div>
            <div style={{ flex: 1, padding: '5px 4px', overflow: 'hidden' }}><MainBody compact /></div>
        </div>
    );

    // ── Sidebar-right layout ──────────────────────────────────────────────────
    if (isRight) return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ flex: 1, padding: '5px 4px', overflow: 'hidden' }}>
                <Header />
                <MainBody compact />
            </div>
            <div style={{ width: '33%', flexShrink: 0 }}><Sidebar /></div>
        </div>
    );

    // ── Two-column layout ─────────────────────────────────────────────────────
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

    // ── Single-column layout ──────────────────────────────────────────────────
    return (
        <div style={{ padding: '5px', height: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            <MainBody />
        </div>
    );
}

