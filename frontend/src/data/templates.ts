export type TemplateCategory = 'modern' | 'minimal' | 'creative' | 'corporate' | 'ats';
export type TemplateLayout = 'single' | 'sidebar-left' | 'sidebar-right' | 'two-column';

export interface ResumeTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    layout: TemplateLayout;
    accentColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerStyle: 'centered' | 'left' | 'banner' | 'compact' | 'bold';
    sectionStyle: 'underline' | 'filled' | 'dots' | 'line' | 'tag' | 'none';
    skillStyle: 'tags' | 'bars' | 'dots' | 'list' | 'circles';
    darkSidebar: boolean;
}

export const TEMPLATES: ResumeTemplate[] = [
    // ─── MODERN (18) ──────────────────────────────────────────────────────
    { id: 'modern-01', name: 'Nova', category: 'modern', layout: 'single', accentColor: '#6366f1', secondaryColor: '#818cf8', fontFamily: 'Plus Jakarta Sans', headerStyle: 'centered', sectionStyle: 'underline', skillStyle: 'tags', darkSidebar: false },
    { id: 'modern-02', name: 'Apex', category: 'modern', layout: 'sidebar-right', accentColor: '#0ea5e9', secondaryColor: '#38bdf8', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'filled', skillStyle: 'bars', darkSidebar: true },
    { id: 'modern-03', name: 'Prism', category: 'modern', layout: 'sidebar-left', accentColor: '#8b5cf6', secondaryColor: '#a78bfa', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'dots', darkSidebar: true },
    { id: 'modern-04', name: 'Nexus', category: 'modern', layout: 'single', accentColor: '#10b981', secondaryColor: '#34d399', fontFamily: 'Poppins', headerStyle: 'bold', sectionStyle: 'dots', skillStyle: 'tags', darkSidebar: false },
    { id: 'modern-05', name: 'Orbit', category: 'modern', layout: 'two-column', accentColor: '#f59e0b', secondaryColor: '#fbbf24', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'tag', skillStyle: 'circles', darkSidebar: false },
    { id: 'modern-06', name: 'Pulse', category: 'modern', layout: 'sidebar-left', accentColor: '#ec4899', secondaryColor: '#f472b6', fontFamily: 'Plus Jakarta Sans', headerStyle: 'banner', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: true },
    { id: 'modern-07', name: 'Vertex', category: 'modern', layout: 'single', accentColor: '#14b8a6', secondaryColor: '#2dd4bf', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'bars', darkSidebar: false },
    { id: 'modern-08', name: 'Carbon', category: 'modern', layout: 'sidebar-right', accentColor: '#334155', secondaryColor: '#64748b', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'line', skillStyle: 'list', darkSidebar: true },
    { id: 'modern-09', name: 'Spectra', category: 'modern', layout: 'two-column', accentColor: '#7c3aed', secondaryColor: '#9061f9', fontFamily: 'Poppins', headerStyle: 'centered', sectionStyle: 'dots', skillStyle: 'tags', darkSidebar: false },
    { id: 'modern-10', name: 'Flux', category: 'modern', layout: 'single', accentColor: '#db2777', secondaryColor: '#f472b6', fontFamily: 'Plus Jakarta Sans', headerStyle: 'compact', sectionStyle: 'tag', skillStyle: 'circles', darkSidebar: false },
    { id: 'modern-11', name: 'Zenith', category: 'modern', layout: 'sidebar-left', accentColor: '#0284c7', secondaryColor: '#38bdf8', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'dots', darkSidebar: true },
    { id: 'modern-12', name: 'Stride', category: 'modern', layout: 'single', accentColor: '#16a34a', secondaryColor: '#4ade80', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: false },
    { id: 'modern-13', name: 'Signal', category: 'modern', layout: 'single', accentColor: '#f97316', secondaryColor: '#fb923c', fontFamily: 'Poppins', headerStyle: 'centered', sectionStyle: 'underline', skillStyle: 'bars', darkSidebar: false },
    { id: 'modern-14', name: 'Cipher', category: 'modern', layout: 'sidebar-right', accentColor: '#4f46e5', secondaryColor: '#818cf8', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'dots', skillStyle: 'tags', darkSidebar: true },
    { id: 'modern-15', name: 'Quasar', category: 'modern', layout: 'two-column', accentColor: '#0891b2', secondaryColor: '#22d3ee', fontFamily: 'Plus Jakarta Sans', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'circles', darkSidebar: false },
    { id: 'modern-16', name: 'Helios', category: 'modern', layout: 'single', accentColor: '#d97706', secondaryColor: '#fbbf24', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'bars', darkSidebar: false },
    { id: 'modern-17', name: 'Matrix', category: 'modern', layout: 'sidebar-left', accentColor: '#065f46', secondaryColor: '#059669', fontFamily: 'Inter', headerStyle: 'banner', sectionStyle: 'tag', skillStyle: 'dots', darkSidebar: true },
    { id: 'modern-18', name: 'Vector', category: 'modern', layout: 'single', accentColor: '#6d28d9', secondaryColor: '#8b5cf6', fontFamily: 'Plus Jakarta Sans', headerStyle: 'bold', sectionStyle: 'underline', skillStyle: 'tags', darkSidebar: false },

    // ─── MINIMAL (14) ─────────────────────────────────────────────────────
    { id: 'minimal-01', name: 'Clean', category: 'minimal', layout: 'single', accentColor: '#1e293b', secondaryColor: '#475569', fontFamily: 'Inter', headerStyle: 'centered', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-02', name: 'Pure', category: 'minimal', layout: 'single', accentColor: '#374151', secondaryColor: '#6b7280', fontFamily: 'Plus Jakarta Sans', headerStyle: 'left', sectionStyle: 'none', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-03', name: 'Slate', category: 'minimal', layout: 'single', accentColor: '#334155', secondaryColor: '#64748b', fontFamily: 'Outfit', headerStyle: 'compact', sectionStyle: 'line', skillStyle: 'tags', darkSidebar: false },
    { id: 'minimal-04', name: 'Bare', category: 'minimal', layout: 'single', accentColor: '#1f2937', secondaryColor: '#9ca3af', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-05', name: 'Mono', category: 'minimal', layout: 'sidebar-right', accentColor: '#27272a', secondaryColor: '#71717a', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'none', skillStyle: 'dots', darkSidebar: false },
    { id: 'minimal-06', name: 'Linen', category: 'minimal', layout: 'single', accentColor: '#78716c', secondaryColor: '#a8a29e', fontFamily: 'Plus Jakarta Sans', headerStyle: 'centered', sectionStyle: 'dots', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-07', name: 'Ivory', category: 'minimal', layout: 'single', accentColor: '#44403c', secondaryColor: '#78716c', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'tags', darkSidebar: false },
    { id: 'minimal-08', name: 'Chalk', category: 'minimal', layout: 'two-column', accentColor: '#1e293b', secondaryColor: '#94a3b8', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-09', name: 'Mist', category: 'minimal', layout: 'sidebar-left', accentColor: '#475569', secondaryColor: '#94a3b8', fontFamily: 'Plus Jakarta Sans', headerStyle: 'left', sectionStyle: 'none', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-10', name: 'Frost', category: 'minimal', layout: 'single', accentColor: '#0f172a', secondaryColor: '#94a3b8', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'line', skillStyle: 'circles', darkSidebar: false },
    { id: 'minimal-11', name: 'Pebble', category: 'minimal', layout: 'single', accentColor: '#52525b', secondaryColor: '#a1a1aa', fontFamily: 'Outfit', headerStyle: 'centered', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-12', name: 'Ash', category: 'minimal', layout: 'sidebar-right', accentColor: '#374151', secondaryColor: '#9ca3af', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'dots', skillStyle: 'list', darkSidebar: false },
    { id: 'minimal-13', name: 'Stone', category: 'minimal', layout: 'single', accentColor: '#57534e', secondaryColor: '#a8a29e', fontFamily: 'Plus Jakarta Sans', headerStyle: 'bold', sectionStyle: 'none', skillStyle: 'tags', darkSidebar: false },
    { id: 'minimal-14', name: 'Dusk', category: 'minimal', layout: 'two-column', accentColor: '#1e293b', secondaryColor: '#64748b', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'dots', darkSidebar: false },

    // ─── CREATIVE (14) ────────────────────────────────────────────────────
    { id: 'creative-01', name: 'Canvas', category: 'creative', layout: 'sidebar-left', accentColor: '#7c3aed', secondaryColor: '#ddd6fe', fontFamily: 'Poppins', headerStyle: 'banner', sectionStyle: 'tag', skillStyle: 'circles', darkSidebar: true },
    { id: 'creative-02', name: 'Vivid', category: 'creative', layout: 'sidebar-right', accentColor: '#db2777', secondaryColor: '#fbcfe8', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: true },
    { id: 'creative-03', name: 'Splash', category: 'creative', layout: 'two-column', accentColor: '#ea580c', secondaryColor: '#fed7aa', fontFamily: 'Plus Jakarta Sans', headerStyle: 'banner', sectionStyle: 'tag', skillStyle: 'bars', darkSidebar: false },
    { id: 'creative-04', name: 'Fusion', category: 'creative', layout: 'sidebar-left', accentColor: '#0891b2', secondaryColor: '#cffafe', fontFamily: 'Poppins', headerStyle: 'banner', sectionStyle: 'dots', skillStyle: 'circles', darkSidebar: true },
    { id: 'creative-05', name: 'Mosaic', category: 'creative', layout: 'two-column', accentColor: '#65a30d', secondaryColor: '#d9f99d', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: false },
    { id: 'creative-06', name: 'Neon', category: 'creative', layout: 'single', accentColor: '#7c3aed', secondaryColor: '#c4b5fd', fontFamily: 'Plus Jakarta Sans', headerStyle: 'compact', sectionStyle: 'tag', skillStyle: 'bars', darkSidebar: false },
    { id: 'creative-07', name: 'Ember', category: 'creative', layout: 'sidebar-right', accentColor: '#dc2626', secondaryColor: '#fca5a5', fontFamily: 'Poppins', headerStyle: 'banner', sectionStyle: 'filled', skillStyle: 'circles', darkSidebar: true },
    { id: 'creative-08', name: 'Aurora', category: 'creative', layout: 'sidebar-left', accentColor: '#059669', secondaryColor: '#a7f3d0', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'tag', skillStyle: 'dots', darkSidebar: true },
    { id: 'creative-09', name: 'Bloom', category: 'creative', layout: 'single', accentColor: '#e11d48', secondaryColor: '#fda4af', fontFamily: 'Poppins', headerStyle: 'centered', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: false },
    { id: 'creative-10', name: 'Cobalt', category: 'creative', layout: 'sidebar-left', accentColor: '#1d4ed8', secondaryColor: '#93c5fd', fontFamily: 'Plus Jakarta Sans', headerStyle: 'banner', sectionStyle: 'dots', skillStyle: 'bars', darkSidebar: true },
    { id: 'creative-11', name: 'Solar', category: 'creative', layout: 'two-column', accentColor: '#b45309', secondaryColor: '#fde68a', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'tag', skillStyle: 'circles', darkSidebar: false },
    { id: 'creative-12', name: 'Retro', category: 'creative', layout: 'single', accentColor: '#9d174d', secondaryColor: '#fbcfe8', fontFamily: 'Poppins', headerStyle: 'centered', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: false },
    { id: 'creative-13', name: 'Cosmic', category: 'creative', layout: 'sidebar-right', accentColor: '#5b21b6', secondaryColor: '#c4b5fd', fontFamily: 'Plus Jakarta Sans', headerStyle: 'banner', sectionStyle: 'tag', skillStyle: 'dots', darkSidebar: true },
    { id: 'creative-14', name: 'Lagoon', category: 'creative', layout: 'sidebar-left', accentColor: '#0e7490', secondaryColor: '#67e8f9', fontFamily: 'Outfit', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'bars', darkSidebar: true },

    // ─── CORPORATE (14) ───────────────────────────────────────────────────
    { id: 'corporate-01', name: 'Executive', category: 'corporate', layout: 'single', accentColor: '#1e3a5f', secondaryColor: '#2563eb', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'corporate-02', name: 'Summit', category: 'corporate', layout: 'sidebar-right', accentColor: '#0c4a6e', secondaryColor: '#0284c7', fontFamily: 'Plus Jakarta Sans', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'tags', darkSidebar: true },
    { id: 'corporate-03', name: 'Prestige', category: 'corporate', layout: 'single', accentColor: '#1e293b', secondaryColor: '#0f172a', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'corporate-04', name: 'Boardroom', category: 'corporate', layout: 'two-column', accentColor: '#1a1a2e', secondaryColor: '#16213e', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'filled', skillStyle: 'dots', darkSidebar: true },
    { id: 'corporate-05', name: 'Pinnacle', category: 'corporate', layout: 'single', accentColor: '#155e75', secondaryColor: '#06b6d4', fontFamily: 'Outfit', headerStyle: 'compact', sectionStyle: 'line', skillStyle: 'bars', darkSidebar: false },
    { id: 'corporate-06', name: 'Titan', category: 'corporate', layout: 'sidebar-left', accentColor: '#312e81', secondaryColor: '#4338ca', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'tags', darkSidebar: true },
    { id: 'corporate-07', name: 'Meridian', category: 'corporate', layout: 'single', accentColor: '#1f2937', secondaryColor: '#374151', fontFamily: 'Plus Jakarta Sans', headerStyle: 'centered', sectionStyle: 'dots', skillStyle: 'list', darkSidebar: false },
    { id: 'corporate-08', name: 'Vanguard', category: 'corporate', layout: 'two-column', accentColor: '#0f4c81', secondaryColor: '#1e6fb8', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'filled', skillStyle: 'tags', darkSidebar: true },
    { id: 'corporate-09', name: 'Core', category: 'corporate', layout: 'single', accentColor: '#0d3349', secondaryColor: '#0e79b2', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
    { id: 'corporate-10', name: 'Pillar', category: 'corporate', layout: 'sidebar-right', accentColor: '#1b4f72', secondaryColor: '#2471a3', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'underline', skillStyle: 'bars', darkSidebar: true },
    { id: 'corporate-11', name: 'Sterling', category: 'corporate', layout: 'single', accentColor: '#243b55', secondaryColor: '#141e30', fontFamily: 'Plus Jakarta Sans', headerStyle: 'bold', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'corporate-12', name: 'Anchor', category: 'corporate', layout: 'sidebar-left', accentColor: '#1a237e', secondaryColor: '#3949ab', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'line', skillStyle: 'tags', darkSidebar: true },
    { id: 'corporate-13', name: 'Fortress', category: 'corporate', layout: 'two-column', accentColor: '#263238', secondaryColor: '#546e7a', fontFamily: 'Outfit', headerStyle: 'left', sectionStyle: 'filled', skillStyle: 'list', darkSidebar: true },
    { id: 'corporate-14', name: 'Empire', category: 'corporate', layout: 'single', accentColor: '#37474f', secondaryColor: '#546e7a', fontFamily: 'Inter', headerStyle: 'centered', sectionStyle: 'dots', skillStyle: 'bars', darkSidebar: false },

    // ─── ATS-FRIENDLY (14) ────────────────────────────────────────────────
    { id: 'ats-01', name: 'ATS Pro', category: 'ats', layout: 'single', accentColor: '#1e293b', secondaryColor: '#334155', fontFamily: 'Arial', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-02', name: 'Scan Ready', category: 'ats', layout: 'single', accentColor: '#0f172a', secondaryColor: '#475569', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-03', name: 'Clean Parse', category: 'ats', layout: 'single', accentColor: '#1f2937', secondaryColor: '#374151', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-04', name: 'Keyword Max', category: 'ats', layout: 'single', accentColor: '#111827', secondaryColor: '#6b7280', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'tags', darkSidebar: false },
    { id: 'ats-05', name: 'Recruiter', category: 'ats', layout: 'single', accentColor: '#1e3a5f', secondaryColor: '#2563eb', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-06', name: 'Tracker', category: 'ats', layout: 'two-column', accentColor: '#064e3b', secondaryColor: '#059669', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-07', name: 'Pass Through', category: 'ats', layout: 'single', accentColor: '#1e293b', secondaryColor: '#475569', fontFamily: 'Plus Jakarta Sans', headerStyle: 'left', sectionStyle: 'none', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-08', name: 'Score High', category: 'ats', layout: 'single', accentColor: '#312e81', secondaryColor: '#4338ca', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-09', name: 'Bot Proof', category: 'ats', layout: 'single', accentColor: '#134e4a', secondaryColor: '#0d9488', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-10', name: 'Parse Pro', category: 'ats', layout: 'single', accentColor: '#1e293b', secondaryColor: '#64748b', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'underline', skillStyle: 'tags', darkSidebar: false },
    { id: 'ats-11', name: 'HR Favorite', category: 'ats', layout: 'single', accentColor: '#0c4a6e', secondaryColor: '#0284c7', fontFamily: 'Plus Jakarta Sans', headerStyle: 'left', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-12', name: 'Clear Read', category: 'ats', layout: 'two-column', accentColor: '#1e293b', secondaryColor: '#475569', fontFamily: 'Inter', headerStyle: 'compact', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-13', name: 'Job Ready', category: 'ats', layout: 'single', accentColor: '#14532d', secondaryColor: '#166534', fontFamily: 'Inter', headerStyle: 'left', sectionStyle: 'underline', skillStyle: 'list', darkSidebar: false },
    { id: 'ats-14', name: 'Applicant', category: 'ats', layout: 'single', accentColor: '#312e81', secondaryColor: '#3730a3', fontFamily: 'Inter', headerStyle: 'bold', sectionStyle: 'line', skillStyle: 'list', darkSidebar: false },
];

export const TEMPLATE_CATEGORIES: Array<{ key: TemplateCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'modern', label: 'Modern' },
    { key: 'minimal', label: 'Minimal' },
    { key: 'creative', label: 'Creative' },
    { key: 'corporate', label: 'Corporate' },
    { key: 'ats', label: 'ATS-Friendly' },
];

export const getTemplate = (id: string): ResumeTemplate =>
    TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
