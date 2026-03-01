export type AIMode = 'improve' | 'shorten' | 'expand' | 'ats' | 'regenerate';

// ─── GROQ API-based AI Enhancement ────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

type SectionType = 'summary' | 'experience' | 'education' | 'projects' | 'extracurricular' | 'skills' | 'certifications';

// Main GROQ enhancement function - works on all sections
async function callGROQAPI(text: string, mode: AIMode, section?: SectionType): Promise<string | null> {
    const token = localStorage.getItem('rf_token');
    
    try {
        const res = await fetch(`${API_BASE}/ai/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ text, mode, section }),
            signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
            console.error('GROQ API error:', res.statusText);
            return null;
        }

        const json = await res.json();
        return json.result?.trim() ?? null;
    } catch (error) {
        console.error('GROQ API call failed:', error);
        return null;
    }
}

// ─── Main Enhance Function ────────────────────────────────────────────────────
export async function enhanceText(text: string, mode: AIMode, section?: SectionType): Promise<string> {
    if (!text.trim()) return text;

    try {
        const result = await callGROQAPI(text, mode, section);
        if (result && result.length > 0) {
            return result;
        }
    } catch (error) {
        console.error('Enhancement failed:', error);
    }

    // Return original if GROQ fails (fail gracefully)
    return text;
}

// ─── Prompt Parser ────────────────────────────────────────────────────────────
export function parsePrompt(prompt: string): { mode: AIMode; section?: SectionType } {
    const lower = prompt.toLowerCase();
    let mode: AIMode = 'improve';

    if (/short|concis|brief|trim|cut|condense/.test(lower)) mode = 'shorten';
    else if (/expand|detail|elaborate|lengthen|add more|verbose/.test(lower)) mode = 'expand';
    else if (/ats|keyword|applicant|scan|parse|recruiter|system/.test(lower)) mode = 'ats';
    else if (/regenerat|rewrite|redo|new version|fresh|rephrase/.test(lower)) mode = 'regenerate';

    let section: SectionType | undefined;
    const sectionMatch = lower.match(/\b(summary|experience|education|skills|work|project|extracurricular|certification)\b/);
    if (sectionMatch) {
        const matched = sectionMatch[1];
        if (matched === 'work') section = 'experience';
        else if (matched === 'project') section = 'projects';
        else if (matched === 'certification') section = 'certifications';
        else section = matched as SectionType;
    }

    return { mode, section };
}

// ─── Skill Suggestions via GROQ ──────────────────────────────────────────────
export async function getSkillSuggestions(input: string): Promise<string[]> {
    if (!input.trim() || input.length < 2) return [];

    const token = localStorage.getItem('rf_token');
    
    try {
        const res = await fetch(`${API_BASE}/ai/skill-suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ input }),
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) return [];
        
        const json = await res.json();
        if (Array.isArray(json.suggestions)) {
            return json.suggestions.slice(0, 8); // Return top 8 suggestions
        }
        return [];
    } catch (error) {
        console.error('Skill suggestions failed:', error);
        return [];
    }
}
