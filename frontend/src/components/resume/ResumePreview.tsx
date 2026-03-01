import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, FileText, Linkedin, ExternalLink } from 'lucide-react';
import type { ResumeData } from '@/context/ResumeContext';
import { getTemplate } from '@/data/templates';

interface ResumePreviewProps {
    data: ResumeData;
    templateId: string;
    sectionOrder?: string[];
    scale?: number;
}

// Section heading styles by template sectionStyle
function SectionHeading({ label, accentColor, style }: { label: string; accentColor: string; style: string }) {
    if (style === 'filled') {
        return (
            <div className="flex items-center mb-3" style={{ backgroundColor: accentColor, margin: '0 -16px', padding: '4px 16px' }}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white">{label}</h4>
            </div>
        );
    }
    if (style === 'tag') {
        return (
            <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: accentColor }}>{label}</span>
            </div>
        );
    }
    if (style === 'dots') {
        return (
            <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{label}</h4>
                <span className="flex-1 h-px" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
            </div>
        );
    }
    if (style === 'none') {
        return <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700">{label}</h4>;
    }
    // default: underline or line
    return (
        <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest pb-1" style={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}>{label}</h4>
        </div>
    );
}

// Skill display by skillStyle
function SkillDisplay({ skills, accentColor, style }: { skills: string[]; accentColor: string; style: string }) {
    if (style === 'tags') {
        return (
            <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: accentColor }}>{s}</span>
                ))}
            </div>
        );
    }
    if (style === 'bars') {
        return (
            <div className="space-y-1.5">
                {skills.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <span className="text-xs w-24 shrink-0 text-gray-700">{s}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full" style={{ backgroundColor: accentColor, width: `${65 + Math.random() * 30}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (style === 'dots') {
        return (
            <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        <span className="text-xs text-gray-700">{s}</span>
                    </div>
                ))}
            </div>
        );
    }
    if (style === 'circles') {
        return (
            <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: accentColor, color: accentColor }}>
                            {s.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 text-center" style={{ maxWidth: 48 }}>{s}</span>
                    </div>
                ))}
            </div>
        );
    }
    // list
    return (
        <ul className="space-y-0.5">
            {skills.map((s) => (
                <li key={s} className="text-xs text-gray-700 flex items-center gap-2">
                    <span style={{ color: accentColor }}>▸</span> {s}
                </li>
            ))}
        </ul>
    );
}

// Header variants
function PhotoCircle({ src, size = 72, ac }: { src: string; size?: number; ac: string }) {
    return (
        <div
            style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${ac}`, flexShrink: 0, backgroundColor: '#e2e8f0' }}
        >
            <img src={src} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
    );
}

function ContactRow({ email, phone, location, website, linkedin, small = false }: {
    email?: string; phone?: string; location?: string; website?: string; linkedin?: string; small?: boolean;
}) {
    const sz = small ? 9 : 10;
    const cls = `flex items-center gap-1${small ? ' text-[10px]' : ' text-xs'} text-gray-500`;
    return (
        <div className={`flex flex-wrap gap-${small ? '2' : '4'} mt-2`}>
            {email && <span className={cls}><Mail size={sz} />{email}</span>}
            {phone && <span className={cls}><Phone size={sz} />{phone}</span>}
            {location && <span className={cls}><MapPin size={sz} />{location}</span>}
            {website && <span className={cls}><Globe size={sz} />{website}</span>}
            {linkedin && <span className={cls}><Linkedin size={sz} />{linkedin}</span>}
        </div>
    );
}

function ResumeHeader({ data, template }: { data: ResumeData; template: ReturnType<typeof getTemplate> }) {
    const { fullName, title, email, phone, location, website, linkedin, photo } = data.personalInfo;
    const photoPos = data.photoPosition ?? 'center';
    const ac = template.accentColor;

    // Helper to get photo alignment
    const getPhotoAlignment = () => {
        if (photoPos === 'left') return 'flex-start';
        if (photoPos === 'right') return 'flex-end';
        return 'center'; // center
    };

    if (template.headerStyle === 'banner') {
        return (
            <div className="p-6 text-white" style={{ backgroundColor: ac }}>
                <div className="flex items-center gap-4">
                    {photo && <PhotoCircle src={photo} size={64} ac="rgba(255,255,255,0.6)" />}
                    <div>
                        <h2 className="text-2xl font-bold">{fullName || 'Your Name'}</h2>
                        <p className="text-sm mt-0.5 opacity-90">{title || 'Job Title'}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-85">
                            {email && <span className="flex items-center gap-1"><Mail size={10} />{email}</span>}
                            {phone && <span className="flex items-center gap-1"><Phone size={10} />{phone}</span>}
                            {location && <span className="flex items-center gap-1"><MapPin size={10} />{location}</span>}
                            {website && <span className="flex items-center gap-1"><Globe size={10} />{website}</span>}
                            {linkedin && <span className="flex items-center gap-1"><Linkedin size={10} />{linkedin}</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (template.headerStyle === 'centered') {
        return (
            <div className="text-center pb-4 mb-4" style={{ borderBottom: `2px solid ${ac}` }}>
                {photo && <div style={{ display: 'flex', justifyContent: getPhotoAlignment(), marginBottom: '12px' }}><PhotoCircle src={photo} size={72} ac={ac} /></div>}
                <h2 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: ac }}>{title || 'Job Title'}</p>
                <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-gray-500">
                    {email && <span className="flex items-center gap-1"><Mail size={10} />{email}</span>}
                    {phone && <span className="flex items-center gap-1"><Phone size={10} />{phone}</span>}
                    {location && <span className="flex items-center gap-1"><MapPin size={10} />{location}</span>}
                    {website && <span className="flex items-center gap-1"><Globe size={10} />{website}</span>}
                    {linkedin && <span className="flex items-center gap-1"><Linkedin size={10} />{linkedin}</span>}
                </div>
            </div>
        );
    }

    if (template.headerStyle === 'bold') {
        const isCentered = photoPos === 'center';
        const isRight = photoPos === 'right';
        
        if (isCentered || isRight) {
            // When centered or right, show photo above text
            return (
                <div className="pb-4 mb-4">
                    {photo && <div style={{ display: 'flex', justifyContent: getPhotoAlignment(), marginBottom: '12px' }}><PhotoCircle src={photo} size={68} ac={ac} /></div>}
                    <div style={{ textAlign: photoPos === 'center' ? 'center' : 'right' }}>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">{fullName || 'Your Name'}</h2>
                        <p className="text-base font-semibold mt-0.5" style={{ color: ac }}>{title || 'Job Title'}</p>
                        <div className={`flex flex-wrap gap-3 mt-2 text-xs text-gray-500 ${photoPos === 'center' ? 'justify-center' : 'justify-end'}`}>
                            {email && <span className="flex items-center gap-1"><Mail size={10} />{email}</span>}
                            {phone && <span className="flex items-center gap-1"><Phone size={10} />{phone}</span>}
                            {location && <span className="flex items-center gap-1"><MapPin size={10} />{location}</span>}
                            {website && <span className="flex items-center gap-1"><Globe size={10} />{website}</span>}
                            {linkedin && <span className="flex items-center gap-1"><Linkedin size={10} />{linkedin}</span>}
                        </div>
                    </div>
                    <div className="h-1 mt-3 rounded-full" style={{ background: `linear-gradient(to right, ${ac}, transparent)` }} />
                </div>
            );
        }
        
        // Left (default)
        return (
            <div className="pb-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {photo && <PhotoCircle src={photo} size={68} ac={ac} />}
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-gray-900">{fullName || 'Your Name'}</h2>
                            <p className="text-base font-semibold mt-0.5" style={{ color: ac }}>{title || 'Job Title'}</p>
                        </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 space-y-0.5 shrink-0">
                        {email && <div className="flex items-center gap-1 justify-end"><Mail size={10} />{email}</div>}
                        {phone && <div className="flex items-center gap-1 justify-end"><Phone size={10} />{phone}</div>}
                        {location && <div className="flex items-center gap-1 justify-end"><MapPin size={10} />{location}</div>}
                        {website && <div className="flex items-center gap-1 justify-end"><Globe size={10} />{website}</div>}
                        {linkedin && <div className="flex items-center gap-1 justify-end"><Linkedin size={10} />{linkedin}</div>}
                    </div>
                </div>
                <div className="h-1 mt-3 rounded-full" style={{ background: `linear-gradient(to right, ${ac}, transparent)` }} />
            </div>
        );
    }

    if (template.headerStyle === 'compact') {
        return (
            <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${ac}` }}>
                <div className="flex items-center gap-3">
                    {photo && <PhotoCircle src={photo} size={44} ac={ac} />}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{fullName || 'Your Name'}</h2>
                        <p className="text-xs font-medium" style={{ color: ac }}>{title || 'Job Title'}</p>
                    </div>
                </div>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                    {email && <div>{email}</div>}
                    {phone && <div>{phone}</div>}
                    {location && <div>{location}</div>}
                </div>
            </div>
        );
    }

    // left (default)
    return (
        <div className="pb-4 mb-4" style={{ borderBottom: `2px solid ${ac}` }}>
            <div className="flex items-start gap-4">
                {photo && <PhotoCircle src={photo} size={72} ac={ac} />}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: ac }}>{title || 'Job Title'}</p>
                    <ContactRow email={email} phone={phone} location={location} website={website} linkedin={linkedin} />
                </div>
            </div>
        </div>
    );
}

// Main content sections
function MainContent({ data, template, sectionOrder }: { data: ResumeData; template: ReturnType<typeof getTemplate>; sectionOrder: string[] }) {
    const ac = template.accentColor;
    const ss = template.sectionStyle;
    const sk = template.skillStyle;

    const isEmpty = !data.personalInfo.fullName && !data.summary
        && data.experience.length === 0 && data.education.length === 0
        && data.skills.length === 0 && (data.projects ?? []).length === 0;

    const sectionMap: Record<string, React.ReactNode> = {
        summary: data.summary ? (
            <div key="summary">
                <SectionHeading label="Professional Summary" accentColor={ac} style={ss} />
                <p className="text-xs text-gray-600 leading-relaxed">{data.summary}</p>
            </div>
        ) : null,

        experience: data.experience.length > 0 ? (
            <div key="experience">
                <SectionHeading label="Work Experience" accentColor={ac} style={ss} />
                <div className="space-y-3">
                    {data.experience.map((exp) => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{exp.position || 'Position'}</p>
                                    <p className="text-xs font-medium" style={{ color: ac }}>{exp.company || 'Company'}</p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 ml-2">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                            </div>
                            {exp.description && (
                                <div className="mt-1">
                                    {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                                            <span style={{ color: ac }} className="mt-0.5 shrink-0">▸</span>
                                            <span>{line.replace(/^[•▸\-]\s*/, '')}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        projects: (data.projects ?? []).length > 0 ? (
            <div key="projects">
                <SectionHeading label="Projects" accentColor={ac} style={ss} />
                <div className="space-y-3">
                    {(data.projects ?? []).map((pr) => (
                        <div key={pr.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-gray-800">{pr.name || 'Project Name'}</p>
                                        {pr.url && (
                                            <a href={pr.url} target="_blank" rel="noreferrer" className="flex items-center" style={{ color: ac }}>
                                                <ExternalLink size={9} />
                                            </a>
                                        )}
                                    </div>
                                    {pr.role && <p className="text-xs font-medium" style={{ color: ac }}>{pr.role}</p>}
                                </div>
                                {(pr.startDate || pr.endDate) && (
                                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 ml-2">{pr.startDate}{pr.endDate ? ` – ${pr.endDate}` : ''}</span>
                                )}
                            </div>
                            {pr.description && (
                                <div className="mt-1">
                                    {pr.description.split('\n').filter(Boolean).map((line, i) => (
                                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                                            <span style={{ color: ac }} className="mt-0.5 shrink-0">▸</span>
                                            <span>{line.replace(/^[•▸\-]\s*/, '')}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        education: data.education.length > 0 ? (
            <div key="education">
                <SectionHeading label="Education" accentColor={ac} style={ss} />
                <div className="space-y-2">
                    {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-800">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                                <p className="text-xs" style={{ color: ac }}>{edu.school}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 ml-2">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        extracurricular: (data.extracurricular ?? []).length > 0 ? (
            <div key="extracurricular">
                <SectionHeading label="Extracurricular" accentColor={ac} style={ss} />
                <div className="space-y-3">
                    {(data.extracurricular ?? []).map((ec) => (
                        <div key={ec.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{ec.title || 'Activity'}</p>
                                    <p className="text-xs font-medium" style={{ color: ac }}>{ec.organization || 'Organization'}</p>
                                    {ec.role && <p className="text-xs text-gray-600">{ec.role}</p>}
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 ml-2">{ec.startDate}{ec.endDate ? ` – ${ec.endDate}` : ''}</span>
                            </div>
                            {ec.description && (
                                <div className="mt-1">
                                    {ec.description.split('\n').filter(Boolean).map((line, i) => (
                                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                                            <span style={{ color: ac }} className="mt-0.5 shrink-0">▸</span>
                                            <span>{line.replace(/^[•▸\-]\s*/, '')}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                            {ec.link && (
                                <div className="mt-1">
                                    <a href={ec.link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1" style={{ color: ac }}>
                                        <ExternalLink size={9} />
                                        {ec.link}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        skills: data.skills.length > 0 ? (
            <div key="skills">
                <SectionHeading label="Skills" accentColor={ac} style={ss} />
                <SkillDisplay skills={data.skills} accentColor={ac} style={sk} />
            </div>
        ) : null,
    };

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <FileText size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Start filling in your details to see the preview</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {sectionOrder.map((key) => sectionMap[key] ?? null)}
        </div>
    );
}

// Sidebar content (for sidebar layouts)
function SidebarContent({ data, template }: { data: ResumeData; template: ReturnType<typeof getTemplate> }) {
    const ac = template.accentColor;
    const textColor = template.darkSidebar ? '#fff' : '#374151';
    const mutedColor = template.darkSidebar ? 'rgba(255,255,255,0.7)' : '#6b7280';
    const headingColor = template.darkSidebar ? 'rgba(255,255,255,0.6)' : ac;

    return (
        <div className="space-y-5">
            {/* Photo */}
            {data.personalInfo.photo && (
                <div className="flex justify-center mb-1">
                    <PhotoCircle src={data.personalInfo.photo} size={80} ac={template.darkSidebar ? 'rgba(255,255,255,0.5)' : ac} />
                </div>
            )}

            {/* Contact */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: headingColor }}>Contact</h4>
                <div className="space-y-1.5 text-xs" style={{ color: mutedColor }}>
                    {data.personalInfo.email && <div className="flex items-center gap-1.5"><Mail size={10} style={{ color: ac }} /><span className="truncate">{data.personalInfo.email}</span></div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={10} style={{ color: ac }} />{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-1.5"><MapPin size={10} style={{ color: ac }} />{data.personalInfo.location}</div>}
                    {data.personalInfo.website && <div className="flex items-center gap-1.5"><Globe size={10} style={{ color: ac }} /><span className="truncate">{data.personalInfo.website}</span></div>}
                    {data.personalInfo.linkedin && <div className="flex items-center gap-1.5"><Linkedin size={10} style={{ color: ac }} /><span className="truncate">{data.personalInfo.linkedin}</span></div>}
                </div>
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: headingColor }}>Skills</h4>
                    <ul className="space-y-1">
                        {data.skills.map((s) => (
                            <li key={s} className="text-xs flex items-center gap-1.5" style={{ color: textColor }}>
                                <span style={{ color: ac }}>▸</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Education (in sidebar) */}
            {data.education.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: headingColor }}>Education</h4>
                    {data.education.map((edu) => (
                        <div key={edu.id} className="mb-2 text-xs" style={{ color: textColor }}>
                            <p className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                            <p style={{ color: mutedColor }}>{edu.school}</p>
                            <p style={{ color: mutedColor }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Main exported component
export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
    ({ data, templateId, sectionOrder, scale = 1 }, ref) => {
        const template = getTemplate(templateId);
        const defaultOrder = ['summary', 'experience', 'projects', 'education', 'skills'];
        const order = sectionOrder ?? defaultOrder;

        const isSidebar = template.layout === 'sidebar-left' || template.layout === 'sidebar-right';
        const isTwoCol = template.layout === 'two-column';

        const sidebarBg = template.darkSidebar ? template.accentColor : '#f1f5f9';

        const fontMap: Record<string, string> = {
            'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
            'Inter': "'Inter', sans-serif",
            'Outfit': "'Outfit', sans-serif",
            'Poppins': "'Poppins', sans-serif",
            'Arial': "'Arial', sans-serif",
        };

        const fontFamily = fontMap[template.fontFamily] ?? "'Inter', sans-serif";

        return (
            <motion.div
                key={templateId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                ref={ref}
                id="resume-preview-root"
                data-resume-preview="true"
                className="bg-white shadow-xl overflow-hidden text-sm"
                style={{
                    fontFamily,
                    transformOrigin: 'top left',
                    // A4 dimensions at 96dpi: 794 × 1123 px
                    width: '794px',
                    minHeight: '1123px',
                }}
            >
                {/* Banner header */}
                {template.headerStyle !== 'banner' && template.layout !== 'sidebar-left' && template.layout !== 'sidebar-right' ? (
                    <div className="p-8">
                        <ResumeHeader data={data} template={template} />
                        {isTwoCol ? (
                            <div className="grid grid-cols-2 gap-6 mt-2">
                                <MainContent data={data} template={template} sectionOrder={order.filter(s => ['summary', 'experience', 'projects'].includes(s))} />
                                <div>
                                    <MainContent data={data} template={template} sectionOrder={order.filter(s => ['education', 'skills'].includes(s))} />
                                </div>
                            </div>
                        ) : (
                            <MainContent data={data} template={template} sectionOrder={order} />
                        )}
                    </div>
                ) : template.layout === 'sidebar-left' ? (
                    <div className="flex min-h-full">
                        {/* Left sidebar */}
                        <div className="w-[36%] p-5 shrink-0" style={{ backgroundColor: sidebarBg }}>
                            {template.headerStyle === 'banner' ? (
                                <div className="mb-5">
                                    <h2 className="text-lg font-bold" style={{ color: template.darkSidebar ? '#fff' : '#1e293b' }}>
                                        {data.personalInfo.fullName || 'Your Name'}
                                    </h2>
                                    <p className="text-xs mt-0.5" style={{ color: template.darkSidebar ? 'rgba(255,255,255,0.7)' : template.accentColor }}>
                                        {data.personalInfo.title || 'Job Title'}
                                    </p>
                                </div>
                            ) : null}
                            <SidebarContent data={data} template={template} />
                        </div>
                        {/* Right main */}
                        <div className="flex-1 p-6">
                            {template.headerStyle !== 'banner' && <ResumeHeader data={data} template={template} />}
                            <MainContent data={data} template={template} sectionOrder={order.filter(s => ['summary', 'experience', 'projects'].includes(s))} />
                        </div>
                    </div>
                ) : template.layout === 'sidebar-right' ? (
                    <div className="flex min-h-full">
                        {/* Left main */}
                        <div className="flex-1 p-6">
                            <ResumeHeader data={data} template={template} />
                            <MainContent data={data} template={template} sectionOrder={order.filter(s => ['summary', 'experience', 'projects'].includes(s))} />
                        </div>
                        {/* Right sidebar */}
                        <div className="w-[32%] p-5 shrink-0" style={{ backgroundColor: sidebarBg }}>
                            <SidebarContent data={data} template={template} />
                        </div>
                    </div>
                ) : (
                    // banner single column
                    <div>
                        <ResumeHeader data={data} template={template} />
                        <div className="p-6">
                            <MainContent data={data} template={template} sectionOrder={order} />
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }
);

ResumePreview.displayName = 'ResumePreview';
