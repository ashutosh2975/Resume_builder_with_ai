import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  link?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  link?: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string;
  link?: string;
}

export interface Extracurricular {
  id: string;
  title: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  link?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  link?: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    website: string;
    linkedin: string;
    github?: string;
    portfolio?: string;
    photo: string; // base64 or URL
    photoPosition?: 'left' | 'center' | 'right'; // Position of photo
  };
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  extracurricular: Extracurricular[];
  skills: string[];
  languages: string[];
  certifications: (string | Certification)[];
}

export interface SavedResume {
  id: string;
  name: string;
  updatedAt: string;
  templateId: string;
  data: ResumeData;
}

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  savedResumes: SavedResume[];
  setSavedResumes: React.Dispatch<React.SetStateAction<SavedResume[]>>;
  currentResumeId: string | null;
  setCurrentResumeId: (id: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  saveResumeToAccount: (name: string) => Promise<void>;
  loadResumesFromAccount: () => Promise<void>;
  deleteResumeFromAccount: (id: string) => Promise<void>;
  isSaving: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultResume: ResumeData = {
  personalInfo: {
    fullName: "", email: "", phone: "", location: "",
    title: "", website: "", linkedin: "", photo: "",
    github: "", portfolio: "", photoPosition: "center",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  extracurricular: [],
  skills: [],
  languages: [],
  certifications: [],
};

const DEFAULT_SECTION_ORDER = ["summary", "experience", "projects", "education", "extracurricular", "skills"];
const DEFAULT_TEMPLATE = "modern-01";
const API_BASE = "http://localhost:5000/api";

// ─── Context ───────────────────────────────────────────────────────────────────

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem("resumeData");
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        // Merge with defaults to pick up new fields
        return {
          ...defaultResume,
          ...parsed,
          personalInfo: { ...defaultResume.personalInfo, ...parsed.personalInfo },
          projects: parsed.projects ?? [],
          languages: parsed.languages ?? [],
          certifications: parsed.certifications ?? [],
        };
      }
    } catch { /* ignore */ }
    return defaultResume;
  });

  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<string>(() =>
    localStorage.getItem("selectedTemplate") ?? DEFAULT_TEMPLATE
  );

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sectionOrder");
      if (saved) {
        const arr = JSON.parse(saved) as string[];
        // Ensure projects is included
        if (!arr.includes("projects")) arr.splice(2, 0, "projects");
        return arr;
      }
    } catch { /* ignore */ }
    return DEFAULT_SECTION_ORDER;
  });

  // Persist to localStorage on every change
  useEffect(() => { localStorage.setItem("resumeData", JSON.stringify(resumeData)); }, [resumeData]);
  useEffect(() => { localStorage.setItem("selectedTemplate", selectedTemplate); }, [selectedTemplate]);
  useEffect(() => { localStorage.setItem("sectionOrder", JSON.stringify(sectionOrder)); }, [sectionOrder]);

  // ── Backend: load resumes ──────────────────────────────────────────────────
  const loadResumesFromAccount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSavedResumes(data.resumes ?? []);
    } catch { /* ignore offline */ }
  }, [token]);

  // Load on login
  useEffect(() => {
    if (token && user) loadResumesFromAccount();
  }, [token, user, loadResumesFromAccount]);

  // ── Backend: save resume ───────────────────────────────────────────────────
  const saveResumeToAccount = useCallback(async (name: string) => {
    if (!token) {
      // Fallback: save to localStorage only
      const id = currentResumeId ?? Date.now().toString();
      const entry: SavedResume = { id, name, updatedAt: new Date().toISOString(), templateId: selectedTemplate, data: resumeData };
      setSavedResumes(prev => {
        const existing = prev.find(r => r.id === id);
        return existing ? prev.map(r => r.id === id ? entry : r) : [entry, ...prev];
      });
      setCurrentResumeId(id);
      return;
    }
    setIsSaving(true);
    try {
      const url = currentResumeId
        ? `${API_BASE}/resumes/${currentResumeId}`
        : `${API_BASE}/resumes`;
      const method = currentResumeId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, template_id: selectedTemplate, data: resumeData }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();

      const newId = json.resume.id;
      setCurrentResumeId(newId);

      // Update local list directly instead of full refresh
      const entry: SavedResume = {
        id: String(newId),
        name,
        updatedAt: new Date().toISOString(),
        templateId: selectedTemplate,
        data: resumeData
      };

      setSavedResumes(prev => {
        const existing = prev.find(r => String(r.id) === String(newId));
        if (existing) {
          return prev.map(r => String(r.id) === String(newId) ? entry : r);
        }
        return [entry, ...prev];
      });
    } finally {
      setIsSaving(false);
    }
  }, [token, currentResumeId, resumeData, selectedTemplate, loadResumesFromAccount]);

  // ── Backend: delete resume ─────────────────────────────────────────────────
  const deleteResumeFromAccount = useCallback(async (id: string) => {
    setSavedResumes(prev => prev.filter(r => r.id !== id));
    if (!token) return;
    try {
      await fetch(`${API_BASE}/resumes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  }, [token]);

  return (
    <ResumeContext.Provider value={{
      resumeData, setResumeData,
      savedResumes, setSavedResumes,
      currentResumeId, setCurrentResumeId,
      currentStep, setCurrentStep,
      selectedTemplate, setSelectedTemplate,
      sectionOrder, setSectionOrder,
      saveResumeToAccount,
      loadResumesFromAccount,
      deleteResumeFromAccount,
      isSaving,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
};
