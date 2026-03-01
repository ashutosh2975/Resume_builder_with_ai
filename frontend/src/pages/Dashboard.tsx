import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Clock, Upload, Layout, Download, Trash2, LogOut, Sparkles, Edit3, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useResume, defaultResume } from '@/context/ResumeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { downloadPDF, downloadPNG } from '@/lib/exportUtils';
import { toast } from 'sonner';

const Dashboard = () => {
  const {
    savedResumes, setResumeData, setSelectedTemplate,
    deleteResumeFromAccount, saveResumeToAccount, setCurrentResumeId,
    loadResumesFromAccount
  } = useResume();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const resumeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleNewResume = () => {
    setResumeData({ ...defaultResume });
    setCurrentResumeId(null);
    navigate('/select-template');
  };

  const handleOpenResume = async (id: string) => {
    const resume = savedResumes.find(r => r.id === id);
    if (!resume) return;

    // Load full data from backend if we have a token
    try {
      const res = await fetch(`http://localhost:5000/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('rf_token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setResumeData({
          ...defaultResume, ...json.resume.data,
          personalInfo: { ...defaultResume.personalInfo, ...json.resume.data?.personalInfo },
          projects: json.resume.data?.projects ?? [],
        });
        setSelectedTemplate(json.resume.templateId ?? 'modern-01');
        setCurrentResumeId(id);
        navigate('/builder');
        return;
      }
    } catch { /* fallback below */ }

    // Fallback: use cached data
    if ((resume as any).data) {
      setResumeData({
        ...defaultResume, ...(resume as any).data,
        personalInfo: { ...defaultResume.personalInfo, ...(resume as any).data?.personalInfo },
        projects: (resume as any).data?.projects ?? [],
      });
    }
    setSelectedTemplate(resume.templateId ?? 'modern-01');
    setCurrentResumeId(id);
    navigate('/builder');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteResumeFromAccount(id);
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const resume = savedResumes.find(r => r.id === id);
    if (!resume) return;

    setExportingId(id);
    try {
      const resumeElement = resumeRefs.current[id];
      if (!resumeElement) {
        toast.error('Resume preview not found');
        return;
      }

      // Export as PDF by default
      await downloadPDF(
        { current: resumeElement },
        `${resume.name || 'resume'}.pdf`,
        'high'
      );
      toast.success('Resume exported as PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export resume');
    } finally {
      setExportingId(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return s; }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="gradient-bg rounded-lg p-1.5">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">ResumeForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive/40 rounded-lg px-2.5 py-1.5 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-extrabold mb-1">My Resumes</h1>
          <p className="text-muted-foreground mb-10">Create, edit and manage all your professional resumes in one place.</p>
        </motion.div>

        {/* Workflow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {/* Create from Scratch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }} onClick={handleNewResume}
            className="relative cursor-pointer rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-7 flex flex-col items-start gap-4 hover:border-primary/60 transition-all shadow-sm hover:shadow-lg overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-md">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Create from Scratch</h2>
              <p className="text-sm text-muted-foreground">Choose a template, fill in your details, and let AI refine everything into a polished, ATS-friendly resume.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Pick Template', 'Fill Details', 'AI Polish', 'Download'].map((step, i) => (
                <span key={step} className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  {step}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Upload Existing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }} onClick={() => navigate('/upload')}
            className="relative cursor-pointer rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-orange-100/20 p-7 flex flex-col items-start gap-4 hover:border-accent/60 transition-all shadow-sm hover:shadow-lg overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
              <Upload className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Upload Existing Resume</h2>
              <p className="text-sm text-muted-foreground">Upload your current resume, we'll extract all data with AI, choose a template, and refine it.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Upload File', 'AI Extraction', 'Pick Template', 'Download'].map((step, i) => (
                <span key={step} className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                  <span className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  {step}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Saved Resumes */}
        {savedResumes.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Saved Resumes
                <span className="ml-1 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {savedResumes.length}
                </span>
              </h2>
              <button onClick={() => loadResumesFromAccount()} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {savedResumes.map((resume, i) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ y: -3 }}
                    className="group glass-card rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => handleOpenResume(resume.id)}
                  >
                    {/* ── Real resume thumbnail ── */}
                    <div className="h-48 bg-white dark:bg-zinc-900 relative overflow-hidden border-b border-border">
                      {/* Scale the full 794px A4 resume down to fit the ~320px card width */}
                      <div
                        ref={el => { if (el) resumeRefs.current[resume.id] = el; }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 794,
                          transformOrigin: 'top left',
                          transform: 'scale(0.405)',
                          pointerEvents: 'none',
                        }}
                      >
                        <ResumePreview
                          data={
                            (resume as any).data
                              ? { ...defaultResume, ...(resume as any).data, personalInfo: { ...defaultResume.personalInfo, ...(resume as any).data?.personalInfo } }
                              : defaultResume
                          }
                          templateId={resume.templateId ?? 'modern-01'}
                          sectionOrder={['summary', 'experience', 'projects', 'education', 'skills']}
                        />
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          className="bg-primary text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                          onClick={e => { e.stopPropagation(); handleOpenResume(resume.id); }}
                        >
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          className="bg-card border border-border rounded-lg px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
                          onClick={e => handleExport(e, resume.id)}
                          disabled={exportingId === resume.id}
                        >
                          <Download className="h-3 w-3" /> {exportingId === resume.id ? 'Exporting...' : 'Export'}
                        </button>
                        <button
                          className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-3 py-2 text-xs font-semibold hover:bg-destructive hover:text-white transition-colors flex items-center gap-1"
                          onClick={e => handleDelete(e, resume.id)}
                          disabled={deletingId === resume.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{resume.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatDate(resume.updatedAt)}</span>
                          {resume.templateId && (
                            <span className="text-xs text-muted-foreground/60 ml-1">· {resume.templateId}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Saved to account" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No resumes yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first resume — it only takes a few minutes!</p>
            <Button className="gradient-bg border-0" onClick={handleNewResume}>
              <Plus className="h-4 w-4 mr-2" /> Create My First Resume
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
