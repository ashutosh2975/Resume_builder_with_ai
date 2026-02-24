import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Download, Image, Layout, Plus, Trash2,
  User, GraduationCap, Briefcase, Wrench, FileText,
  ChevronDown, ChevronUp, Sparkles, Save, Loader2,
  FolderOpen, Camera, Link as LinkIcon, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useResume } from '@/context/ResumeContext';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { TemplateSwitcher } from '@/components/resume/TemplateSwitcher';
import { AIPromptBox } from '@/components/resume/AIPromptBox';
import { SortableSectionList } from '@/components/resume/SortableSectionList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { downloadPDF, downloadPNG, type ExportQuality, QUALITY_OPTIONS } from '@/lib/exportUtils';
import { enhanceText, type AIMode } from '@/lib/aiEnhance';
import { getTemplate } from '@/data/templates';
import { toast } from 'sonner';

// ─── Country Codes ─────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', label: 'US/CA' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+86', flag: '🇨🇳', label: 'CN' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+52', flag: '🇲🇽', label: 'MX' },
  { code: '+27', flag: '🇿🇦', label: 'ZA' },
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+880', flag: '🇧🇩', label: 'BD' },
  { code: '+7', flag: '🇷🇺', label: 'RU' },
  { code: '+82', flag: '🇰🇷', label: 'KR' },
  { code: '+39', flag: '🇮🇹', label: 'IT' },
  { code: '+34', flag: '🇪🇸', label: 'ES' },
];

const SECTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  summary: { label: 'Summary', icon: FileText },
  experience: { label: 'Experience', icon: Briefcase },
  projects: { label: 'Projects', icon: FolderOpen },
  education: { label: 'Education', icon: GraduationCap },
  skills: { label: 'Skills', icon: Wrench },
};

type AILoadingState = Record<string, boolean>;

const AI_MODES: Array<{ mode: AIMode; label: string }> = [
  { mode: 'improve', label: '✨ Improve' },
  { mode: 'shorten', label: '✂ Shorten' },
  { mode: 'expand', label: '📝 Expand' },
  { mode: 'ats', label: '🎯 ATS' },
  { mode: 'regenerate', label: '🔄 Regen' },
];

export default function ResumeBuilder() {
  const {
    resumeData, setResumeData,
    selectedTemplate, setSelectedTemplate,
    sectionOrder, setSectionOrder,
    saveResumeToAccount, isSaving,
  } = useResume();
  const [newSkill, setNewSkill] = useState('');
  const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true, summary: false, experience: false, projects: false, education: false, skills: false,
  });
  const [aiLoading, setAiLoading] = useState<AILoadingState>({});
  const [exportLoading, setExportLoading] = useState<'pdf' | 'png' | null>(null);
  const [showGlobalAI, setShowGlobalAI] = useState(false);
  const [showExportModal, setShowExportModal] = useState<'pdf' | 'png' | null>(null);
  const [exportQuality, setExportQuality] = useState<ExportQuality>('high');
  const [countryCode, setCountryCode] = useState('+1');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const previewRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // ─── Auto-save ───────────────────────────────────────────────────────────
  useEffect(() => {
    // skip the very first mount (avoids saving stale initial state)
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setAutoSaveStatus('saving');
    autoSaveRef.current = setTimeout(async () => {
      // always persist to localStorage immediately
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('selectedTemplate', selectedTemplate);
      // try account save silently
      try {
        await saveResumeToAccount(
          resumeData.personalInfo.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'Untitled Resume',
        );
      } catch { /* no token / offline — that's fine */ }
      setAutoSaveStatus('saved');
      // reset after 2.5 s
      setTimeout(() => setAutoSaveStatus('idle'), 2500);
    }, 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [resumeData, selectedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Project CRUD ────────────────────────────────────────────────────────
  const addProject = () => {
    const id = Date.now().toString();
    setResumeData(p => ({
      ...p,
      projects: [...(p.projects ?? []), {
        id, name: '', role: '', url: '',
        startDate: '', endDate: '', description: '',
      }],
    }));
    setExpandedSections(s => ({ ...s, projects: true }));
    setTimeout(() => {
      document.getElementById(`project-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateProject = (id: string, field: string, value: string) =>
    setResumeData(p => ({ ...p, projects: (p.projects ?? []).map(pr => pr.id === id ? { ...pr, [field]: value } : pr) }));

  const removeProject = (id: string) =>
    setResumeData(p => ({ ...p, projects: (p.projects ?? []).filter(pr => pr.id !== id) }));

  // ─── Photo upload ────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, photo: base64 } }));
      toast.success('Photo added!');
    };
    reader.readAsDataURL(file);
  };

  // ─── Helpers ────────────────────────────────────────────────────────────
  const toggleSection = (key: string) =>
    setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const updatePersonal = (field: string, value: string) =>
    setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, [field]: value } }));

  const addEducation = () => {
    const id = Date.now().toString();
    setResumeData(p => ({
      ...p,
      education: [...p.education, { id, school: '', degree: '', field: '', startDate: '', endDate: '' }],
    }));
    setExpandedSections(s => ({ ...s, education: true }));
    setTimeout(() => {
      document.getElementById(`education-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateEducation = (id: string, field: string, value: string) =>
    setResumeData(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const removeEducation = (id: string) =>
    setResumeData(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));

  const addExperience = () => {
    const id = Date.now().toString();
    setResumeData(p => ({
      ...p,
      experience: [...p.experience, { id, company: '', position: '', startDate: '', endDate: '', description: '' }],
    }));
    setExpandedSections(s => ({ ...s, experience: true }));
    setTimeout(() => {
      document.getElementById(`experience-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateExperience = (id: string, field: string, value: string) =>
    setResumeData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  const removeExperience = (id: string) =>
    setResumeData(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(p => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) =>
    setResumeData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const runSectionAI = useCallback(async (section: string, mode: AIMode) => {
    const key = `${section}-${mode}`;
    setAiLoading((p) => ({ ...p, [key]: true }));
    try {
      if (section === 'summary') {
        const result = await enhanceText(resumeData.summary, mode);
        setResumeData((p) => ({ ...p, summary: result }));
      } else if (section === 'experience') {
        const updated = await Promise.all(
          resumeData.experience.map(async (exp) => ({
            ...exp,
            description: exp.description ? await enhanceText(exp.description, mode) : exp.description,
          }))
        );
        setResumeData((p) => ({ ...p, experience: updated }));
      }
      toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} applied!`);
    } finally {
      setAiLoading((p) => ({ ...p, [key]: false }));
    }
  }, [resumeData, setResumeData]);

  const handleExportPDF = () => setShowExportModal('pdf');
  const handleExportPNG = () => setShowExportModal('png');

  const confirmExport = async () => {
    const type = showExportModal;
    setShowExportModal(null);
    if (!type) return;
    setExportLoading(type);
    try {
      const fname = resumeData.personalInfo.fullName || 'resume';
      if (type === 'pdf') {
        await downloadPDF(previewRef, `${fname}.pdf`, exportQuality);
        toast.success('PDF downloaded!');
      } else {
        await downloadPNG(previewRef, `${fname}.png`, exportQuality);
        toast.success('PNG downloaded!');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  const handleSave = async () => {
    const name = resumeData.personalInfo.fullName
      ? `${resumeData.personalInfo.fullName}'s Resume`
      : 'Untitled Resume';
    try {
      await saveResumeToAccount(name);
      toast.success('Resume saved to your account!');
    } catch {
      // Fallback: save to localStorage only
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('selectedTemplate', selectedTemplate);
      toast.success('Resume saved locally!');
    }
  };

  const currentTemplate = getTemplate(selectedTemplate);

  // ─── Section Renderers ──────────────────────────────────────────────────
  const renderPersonal = () => (
    <SectionCard id="personal" icon={User} label="Personal Info" expanded={expandedSections.personal} onToggle={() => toggleSection('personal')}>
      {/* Photo upload */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl border border-dashed border-border bg-muted/20">
        <div
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer border-2 border-border hover:border-primary/50 transition-colors"
          onClick={() => photoInputRef.current?.click()}
        >
          {resumeData.personalInfo.photo ? (
            <img src={resumeData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground mb-1">Optional — adds a professional touch</p>
          <div className="flex gap-2">
            <button onClick={() => photoInputRef.current?.click()} className="text-xs text-primary hover:underline">
              {resumeData.personalInfo.photo ? 'Change photo' : 'Upload photo'}
            </button>
            {resumeData.personalInfo.photo && (
              <button onClick={() => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, photo: '' } }))} className="text-xs text-destructive hover:underline">
                Remove
              </button>
            )}
          </div>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { field: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
          { field: 'title', label: 'Job Title', placeholder: 'Software Engineer' },
          { field: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
          { field: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
          { field: 'website', label: 'Website / Portfolio', placeholder: 'yoursite.com' },
          { field: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
        ].map(({ field, label, placeholder, type }) => (
          <div key={field}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
            <Input
              type={type ?? 'text'}
              placeholder={placeholder}
              value={(resumeData.personalInfo as Record<string, string>)[field] ?? ''}
              onChange={e => updatePersonal(field, e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        ))}
        {/* Phone with country code picker */}
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
          <div className="flex gap-1.5">
            <select
              value={countryCode}
              onChange={e => {
                const newCode = e.target.value;
                const oldCode = countryCode;
                setCountryCode(newCode);
                const current = resumeData.personalInfo.phone || '';
                const stripped = current.startsWith(oldCode) ? current.slice(oldCode.length).trimStart() : current;
                updatePersonal('phone', `${newCode} ${stripped}`.trim());
              }}
              className="h-8 text-sm rounded-md border border-border bg-background px-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} {c.label}</option>
              ))}
            </select>
            <Input
              placeholder="555-0123"
              value={(resumeData.personalInfo.phone || '').replace(new RegExp(`^\\${countryCode}\\s*`), '')}
              onChange={e => updatePersonal('phone', `${countryCode} ${e.target.value}`.trim())}
              className="h-8 text-sm flex-1"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderSummary = () => (
    <SectionCard
      id="summary"
      icon={FileText}
      label="Professional Summary"
      expanded={expandedSections.summary}
      onToggle={() => toggleSection('summary')}
      aiActions={AI_MODES.map((m) => ({
        ...m,
        loading: !!aiLoading[`summary-${m.mode}`],
        onClick: () => runSectionAI('summary', m.mode),
      }))}
    >
      <Textarea
        placeholder="Experienced professional with 5+ years..."
        value={resumeData.summary}
        onChange={(e) => setResumeData((p) => ({ ...p, summary: e.target.value }))}
        rows={4}
        className="resize-none text-sm"
      />
      <p className="text-xs text-muted-foreground text-right mt-1">{resumeData.summary.length} characters</p>
      {resumeData.summary && (
        <AIPromptBox
          currentText={resumeData.summary}
          sectionLabel="Summary"
          onApply={(text) => setResumeData((p) => ({ ...p, summary: text }))}
        />
      )}
    </SectionCard>
  );

  const renderExperience = () => (
    <SectionCard
      id="experience"
      icon={Briefcase}
      label="Work Experience"
      expanded={expandedSections.experience}
      onToggle={() => toggleSection('experience')}
      action={<Button variant="outline" size="sm" onClick={addExperience} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>}
      aiActions={AI_MODES.filter((m) => m.mode !== 'regenerate').map((m) => ({
        ...m,
        loading: !!aiLoading[`experience-${m.mode}`],
        onClick: () => runSectionAI('experience', m.mode),
      }))}
    >
      {resumeData.experience.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-xs">No experience yet. Click "Add" to start.</div>
      ) : (
        resumeData.experience.map((exp) => (
          <div key={exp.id} id={`experience-${exp.id}`} className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="Start (e.g. Jan 2022)" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="End (or Present)" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} className="h-8 text-sm" />
            </div>
            <Textarea
              placeholder="• Led a team of 5 engineers to ship..."
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            {exp.description && (
              <AIPromptBox
                currentText={exp.description}
                sectionLabel={`${exp.position || 'Experience'}`}
                onApply={(text) => updateExperience(exp.id, 'description', text)}
              />
            )}
            <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => removeExperience(exp.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        ))
      )}
    </SectionCard>
  );

  const renderEducation = () => (
    <SectionCard
      id="education"
      icon={GraduationCap}
      label="Education"
      expanded={expandedSections.education}
      onToggle={() => toggleSection('education')}
      action={<Button variant="outline" size="sm" onClick={addEducation} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>}
    >
      {resumeData.education.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-xs">No education yet. Click "Add" to start.</div>
      ) : (
        resumeData.education.map((edu) => (
          <div key={edu.id} id={`education-${edu.id}`} className="rounded-xl border border-border bg-background p-4 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UniversityAutocomplete
                value={edu.school}
                onChange={v => updateEducation(edu.id, 'school', v)}
              />
              <Input placeholder="Degree (e.g. B.S.)" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input placeholder="Start" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} className="h-8 text-sm" />
                <Input placeholder="End" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => removeEducation(edu.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        ))
      )}
    </SectionCard>
  );

  const renderSkills = () => (
    <SectionCard
      id="skills"
      icon={Wrench}
      label="Skills"
      expanded={expandedSections.skills}
      onToggle={() => toggleSection('skills')}
    >
      <div className="flex gap-2">
        <Input
          placeholder="Add a skill…"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          className="h-8 text-sm"
        />
        <Button onClick={addSkill} variant="outline" size="sm" className="h-8">Add</Button>
      </div>
      {resumeData.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {resumeData.skills.map((skill) => (
            <motion.span
              key={skill}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive transition-colors">×</button>
            </motion.span>
          ))}
        </div>
      )}
    </SectionCard>
  );

  const renderProjects = () => (
    <SectionCard
      id="projects"
      icon={FolderOpen}
      label="Projects"
      expanded={expandedSections.projects}
      onToggle={() => toggleSection('projects')}
      action={<Button variant="outline" size="sm" onClick={addProject} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>}
    >
      {(resumeData.projects ?? []).length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-xs">No projects yet. Click "Add" to showcase your work.</div>
      ) : (
        (resumeData.projects ?? []).map(pr => (
          <div key={pr.id} id={`project-${pr.id}`} className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Project Name" value={pr.name} onChange={e => updateProject(pr.id, 'name', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="Your Role" value={pr.role} onChange={e => updateProject(pr.id, 'role', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="Project URL (optional)" value={pr.url} onChange={e => updateProject(pr.id, 'url', e.target.value)} className="h-8 text-sm col-span-1 sm:col-span-2" />
              <Input placeholder="Start (e.g. Jan 2023)" value={pr.startDate} onChange={e => updateProject(pr.id, 'startDate', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="End (or Present)" value={pr.endDate} onChange={e => updateProject(pr.id, 'endDate', e.target.value)} className="h-8 text-sm" />
            </div>
            <Textarea
              placeholder="• Built a full-stack app using React and Node.js...\n• Achieved 99.9% uptime with AWS Lambda"
              value={pr.description}
              onChange={e => updateProject(pr.id, 'description', e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            {pr.description && (
              <AIPromptBox currentText={pr.description} sectionLabel={pr.name || 'Project'}
                onApply={text => updateProject(pr.id, 'description', text)} />
            )}
            <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => removeProject(pr.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        ))
      )}
    </SectionCard>
  );

  const sectionRenderMap: Record<string, () => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    skills: renderSkills,
  };

  // ─── Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-3 sticky top-0 z-30 shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <span className="font-bold text-sm gradient-text">ResumeForge</span>
        <div className="flex-1" />

        {/* Template name badge */}
        <button
          onClick={() => setShowTemplateSwitcher(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Layout className="h-3.5 w-3.5 text-primary" />
          <span>{currentTemplate.name}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize text-xs">{currentTemplate.category}</span>
        </button>

        {/* AI toggle */}
        <Button
          variant={showGlobalAI ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowGlobalAI((p) => !p)}
          className={`gap-1.5 text-xs h-8 ${showGlobalAI ? 'gradient-bg border-0' : ''}`}
        >
          <Sparkles className="h-3.5 w-3.5" /> AI
        </Button>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {autoSaveStatus !== 'idle' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`hidden sm:flex items-center gap-1 text-xs ${autoSaveStatus === 'saving' ? 'text-muted-foreground' : 'text-emerald-500'
                }`}
            >
              {autoSaveStatus === 'saving' ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />Saving…</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Saved</>
              )}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Save */}
        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 text-xs h-8">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Saving…' : 'Save'}
        </Button>

        <ThemeToggle />
      </header>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Form Panel ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:border-r border-border lg:max-w-[52%]">

          {/* Global AI prompt */}
          <AnimatePresence>
            {showGlobalAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <AIPromptBox
                  currentText={[
                    resumeData.summary,
                    ...resumeData.experience.map((e) => e.description),
                  ].filter(Boolean).join('\n\n')}
                  sectionLabel="Entire Resume"
                  onApply={(text) => {
                    const parts = text.split('\n\n');
                    if (parts[0]) setResumeData((p) => ({ ...p, summary: parts[0] }));
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personal always on top */}
          <div className="mb-4">{renderPersonal()}</div>

          {/* Drag-and-drop sections */}
          <SortableSectionList
            sections={sectionOrder}
            onReorder={setSectionOrder}
            renderSection={(id) => sectionRenderMap[id]?.() ?? null}
          />
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className="hidden lg:flex flex-col flex-1 bg-muted/20 overflow-y-auto">
          {/* Preview toolbar */}
          <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex-1">Live Preview</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSwitcher(true)}
              className="gap-1.5 text-xs h-7 hover:border-primary/40"
            >
              <Layout className="h-3 w-3" /> Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPNG}
              disabled={exportLoading !== null}
              className="gap-1.5 text-xs h-7"
            >
              {exportLoading === 'png' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />}
              PNG
            </Button>
            <Button
              size="sm"
              onClick={handleExportPDF}
              disabled={exportLoading !== null}
              className="gradient-bg border-0 gap-1.5 text-xs h-7"
            >
              {exportLoading === 'pdf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              PDF
            </Button>
          </div>

          {/* Preview content */}
          <div className="flex-1 p-6 flex justify-center">
            <div className="w-full max-w-[680px]">
              <ResumePreview
                ref={previewRef}
                data={resumeData}
                templateId={selectedTemplate}
                sectionOrder={sectionOrder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Preview / Export tab ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm p-3 flex gap-2 z-20">
        <Button variant="outline" size="sm" onClick={() => setShowTemplateSwitcher(true)} className="flex-1 gap-1 text-xs">
          <Layout className="h-3.5 w-3.5" /> Templates
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={exportLoading !== null} className="gap-1 text-xs">
          {exportLoading === 'png' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />} PNG
        </Button>
        <Button size="sm" onClick={handleExportPDF} disabled={exportLoading !== null} className="gradient-bg border-0 gap-1 text-xs">
          {exportLoading === 'pdf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
        </Button>
      </div>

      {/* ── Template Switcher Modal ── */}
      <AnimatePresence>
        {showTemplateSwitcher && (
          <TemplateSwitcher
            currentTemplateId={selectedTemplate}
            onSelect={setSelectedTemplate}
            onClose={() => setShowTemplateSwitcher(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Export Quality Modal ── */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base">Export Quality</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose resolution for your {showExportModal?.toUpperCase()}</p>
                </div>
                <button onClick={() => setShowExportModal(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {QUALITY_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setExportQuality(opt.key)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${exportQuality === opt.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                      }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{opt.dpi}</div>
                    <div className="text-xs text-muted-foreground">{opt.description}</div>
                  </button>
                ))}
              </div>
              <Button
                onClick={confirmExport}
                className="w-full gradient-bg border-0 gap-2"
              >
                {showExportModal === 'pdf' ? <Download className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                Download {showExportModal?.toUpperCase()} — {QUALITY_OPTIONS.find(o => o.key === exportQuality)?.label}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
interface AIActionItem {
  mode: AIMode;
  label: string;
  loading: boolean;
  onClick: () => void;
}

interface SectionCardProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
  aiActions?: AIActionItem[];
}

function SectionCard({ icon: Icon, label, expanded, onToggle, children, action, aiActions }: SectionCardProps) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-3"
    >
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold flex-1 text-left">{label}</span>
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* AI quick actions bar */}
      <AnimatePresence>
        {expanded && aiActions && aiActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-muted/20 px-4 py-2 flex gap-1.5 flex-wrap"
          >
            {aiActions.map((a) => (
              <button
                key={a.mode}
                onClick={a.onClick}
                disabled={a.loading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
              >
                {a.loading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
                {a.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 pt-3 space-y-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── University Autocomplete ───────────────────────────────────────────────────
function UniversityAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [results, setResults] = useState<Array<{ name: string; country: string }>>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/universities?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.universities ?? []);
          setOpen((data.universities?.length ?? 0) > 0);
        }
      } catch { /* backend not running: silent fail — user can type freely */ }
      finally { setLoading(false); }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search university…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          className="h-8 text-sm pr-7"
        />
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {results.map((r, i) => (
              <button
                key={`${r.name}-${i}`}
                onMouseDown={() => { onChange(r.name); setOpen(false); setResults([]); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
              >
                <span className="font-medium text-foreground truncate">{r.name}</span>
                <span className="text-muted-foreground shrink-0">{r.country}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
