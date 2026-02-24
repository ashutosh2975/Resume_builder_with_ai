import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from '@/data/templates';
import { Button } from '@/components/ui/button';

interface TemplateSwitcherProps {
    currentTemplateId: string;
    onSelect: (id: string) => void;
    onClose: () => void;
}

// Mini thumbnail preview of a template
function TemplateThumbnail({ accentColor, layout, darkSidebar }: { accentColor: string; layout: string; darkSidebar: boolean }) {
    const isSidebar = layout === 'sidebar-left' || layout === 'sidebar-right';
    const isRight = layout === 'sidebar-right';

    if (isSidebar) {
        return (
            <div className="flex h-full rounded overflow-hidden">
                {!isRight && <div className="w-[35%] h-full" style={{ backgroundColor: darkSidebar ? accentColor : `${accentColor}20` }} />}
                <div className="flex-1 p-2 space-y-1.5">
                    <div className="h-2 rounded" style={{ backgroundColor: accentColor, width: '60%' }} />
                    <div className="h-1 rounded bg-gray-200" style={{ width: '40%' }} />
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="space-y-1">
                        <div className="h-1 rounded bg-gray-200" style={{ width: '90%' }} />
                        <div className="h-1 rounded bg-gray-200" style={{ width: '75%' }} />
                    </div>
                </div>
                {isRight && <div className="w-[35%] h-full" style={{ backgroundColor: darkSidebar ? accentColor : `${accentColor}20` }} />}
            </div>
        );
    }

    if (layout === 'two-column') {
        return (
            <div className="p-2 h-full space-y-1.5">
                <div className="h-2 rounded" style={{ backgroundColor: accentColor, width: '55%' }} />
                <div className="h-px" style={{ backgroundColor: accentColor }} />
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <div className="space-y-1">
                        <div className="h-1 rounded bg-gray-200 w-full" />
                        <div className="h-1 rounded bg-gray-200 w-3/4" />
                        <div className="h-1 rounded bg-gray-200 w-full" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-1 rounded bg-gray-200 w-full" />
                        <div className="h-1 rounded bg-gray-200 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    // single
    return (
        <div className="p-2 h-full space-y-1.5">
            <div className="h-2 rounded" style={{ backgroundColor: accentColor, width: '60%' }} />
            <div className="h-1 rounded bg-gray-300" style={{ width: '45%' }} />
            <div className="h-px mt-1" style={{ backgroundColor: accentColor }} />
            <div className="space-y-1 mt-1">
                <div className="h-1 rounded bg-gray-200 w-full" />
                <div className="h-1 rounded bg-gray-200 w-4/5" />
                <div className="h-1 rounded bg-gray-200 w-full" />
                <div className="h-1 rounded bg-gray-200 w-3/4" />
            </div>
            <div className="flex gap-1 mt-1">
                <div className="h-3 rounded px-1" style={{ backgroundColor: `${accentColor}30`, width: 24 }} />
                <div className="h-3 rounded px-1" style={{ backgroundColor: `${accentColor}30`, width: 28 }} />
                <div className="h-3 rounded px-1" style={{ backgroundColor: `${accentColor}30`, width: 20 }} />
            </div>
        </div>
    );
}

export function TemplateSwitcher({ currentTemplateId, onSelect, onClose }: TemplateSwitcherProps) {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = TEMPLATES.filter((t) => {
        const matchCat = activeCategory === 'all' || t.category === activeCategory;
        const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold">Choose Template</h2>
                        <p className="text-sm text-muted-foreground">{TEMPLATES.length} professional templates</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search + Filter */}
                <div className="p-4 border-b border-border space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search templates…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                        />
                    </div>
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
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory + searchQuery}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                        >
                            {filtered.map((tpl, i) => {
                                const isActive = tpl.id === currentTemplateId;
                                return (
                                    <motion.button
                                        key={tpl.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => { onSelect(tpl.id); onClose(); }}
                                        className={`relative rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${isActive
                                                ? 'border-primary shadow-md ring-2 ring-primary/30'
                                                : 'border-border hover:border-primary/40'
                                            }`}
                                        style={{ height: 100 }}
                                    >
                                        <div className="h-[72px]" style={{ backgroundColor: '#f8fafc' }}>
                                            <TemplateThumbnail accentColor={tpl.accentColor} layout={tpl.layout} darkSidebar={tpl.darkSidebar} />
                                        </div>
                                        <div className="px-2 py-1 bg-card border-t border-border flex items-center justify-between">
                                            <span className="text-xs font-medium truncate">{tpl.name}</span>
                                            {isActive && <Check className="h-3 w-3 text-primary shrink-0" />}
                                        </div>
                                        {isActive && (
                                            <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-xl" />
                                        )}
                                    </motion.button>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className="col-span-4 py-12 text-center text-muted-foreground text-sm">
                                    No templates found for "{searchQuery}"
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
