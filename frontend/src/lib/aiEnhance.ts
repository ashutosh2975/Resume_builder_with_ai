import { correctSpelling, removeWeakWords, improveBullets, formatBullet } from './grammarEngine';

export type AIMode = 'improve' | 'shorten' | 'expand' | 'ats' | 'regenerate';

// ─── Backend AI Proxy ─────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

async function callAIProxy(text: string, mode: AIMode): Promise<string | null> {
    const token = localStorage.getItem('rf_token');
    try {
        const res = await fetch(`${API_BASE}/ai/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ text, mode }),
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.result ?? null;
    } catch {
        return null;
    }
}

// ─── Local Grammar Engine Fallbacks ───────────────────────────────────────────
function improveGrammar(text: string): string {
    let result = correctSpelling(text);
    result = removeWeakWords(result);
    result = result.replace(/([a-z])\s*\n/gi, '$1.\n');
    result = result.replace(/ {2,}/g, ' ');
    result = result.replace(/\bwas (done|handled|made|used) by\b/gi, (_, verb) => {
        const active: Record<string, string> = { done: 'completed', handled: 'managed', made: 'developed', used: 'utilized' };
        return active[verb.toLowerCase()] ?? verb;
    });
    return result.trim();
}

function shortenText(text: string): string {
    const lines = text.split('\n').filter(Boolean);
    const ranked = lines.sort((a, b) => {
        const score = (s: string) =>
            (s.match(/\d+/g)?.length ?? 0) * 2 +
            (s.match(/\b(led|increased|reduced|launched|built|improved|achieved)\b/gi)?.length ?? 0);
        return score(b) - score(a);
    });
    const kept = ranked.slice(0, Math.max(1, Math.ceil(lines.length * 0.6)));
    return kept
        .map((line) => {
            const clean = improveGrammar(line);
            if (clean.length > 120) {
                const cut = clean.lastIndexOf(',', 100);
                return cut > 50 ? formatBullet(clean.slice(0, cut)) : formatBullet(clean.slice(0, 110) + '…');
            }
            return formatBullet(clean);
        })
        .join('\n');
}

function expandText(text: string): string {
    const lines = text.split('\n').filter(Boolean);
    const expanded = lines.map((line) => {
        const improved = improveGrammar(line);
        if (/\b(develop|build|create|engineer)\b/i.test(improved)) {
            return improved.replace(/\.$/, ', using best practices and modern technologies to ensure scalability and maintainability.');
        }
        if (/\b(manage|lead|oversee|direct)\b/i.test(improved)) {
            return improved.replace(/\.$/, ', fostering team collaboration and delivering results on schedule.');
        }
        if (/\b(improve|optimize|enhance|increase|reduce)\b/i.test(improved)) {
            return improved.replace(/\.$/, ', resulting in measurable performance gains and improved efficiency.');
        }
        if (/\b(analyze|research|study|evaluate)\b/i.test(improved)) {
            return improved.replace(/\.$/, ', providing data-driven insights and actionable recommendations.');
        }
        return improved + ' Demonstrated strong attention to detail and commitment to excellence.';
    });
    return expanded.join('\n');
}

function makeATSFriendly(text: string): string {
    let result = improveBullets(text);
    if (!result.includes('\n') && result.length > 100) {
        const sentences = result.match(/[^.!?]+[.!?]+/g) ?? [result];
        result = sentences.map((s) => formatBullet(s.trim())).join('\n');
    }
    const keywordMap: [RegExp, string][] = [
        [/\buse\b/gi, 'utilize'],
        [/\bfix\b/gi, 'remediate'],
        [/\bhelp\b/gi, 'facilitate'],
        [/\bwork with\b/gi, 'collaborate with'],
        [/\bresponsible for\b/gi, 'accountable for'],
    ];
    keywordMap.forEach(([regex, replacement]) => {
        result = result.replace(regex, replacement);
    });
    return result;
}

function regenerate(text: string): string {
    const improved = improveBullets(text);
    const lines = improved.split('\n').filter(Boolean);
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.max(lines.length, 2)).join('\n');
}

function localFallback(text: string, mode: AIMode): string {
    switch (mode) {
        case 'improve': return improveGrammar(text);
        case 'shorten': return shortenText(text);
        case 'expand': return expandText(text);
        case 'ats': return makeATSFriendly(text);
        case 'regenerate': return regenerate(text);
        default: return improveGrammar(text);
    }
}

// ─── Main Enhance Function ────────────────────────────────────────────────────
export async function enhanceText(text: string, mode: AIMode): Promise<string> {
    if (!text.trim()) return text;

    // Try real AI first (via backend proxy with Gemini/DeepSeek/OpenAI)
    const aiResult = await callAIProxy(text, mode);
    if (aiResult && aiResult.trim().length > 0) {
        return aiResult;
    }

    // Fallback to local grammar engine
    return localFallback(text, mode);
}

// ─── Prompt Parser ────────────────────────────────────────────────────────────
export function parsePrompt(prompt: string): { mode: AIMode; section?: string } {
    const lower = prompt.toLowerCase();
    let mode: AIMode = 'improve';

    if (/short|concis|brief|trim|cut/.test(lower)) mode = 'shorten';
    else if (/expand|detail|elaborate|lengthen|add more/.test(lower)) mode = 'expand';
    else if (/ats|keyword|applicant|scan|parse|recruiter/.test(lower)) mode = 'ats';
    else if (/regenerat|rewrite|redo|new version|fresh/.test(lower)) mode = 'regenerate';

    let section: string | undefined;
    const sectionMatch = lower.match(/\b(summary|experience|education|skills|work|project)\b/);
    if (sectionMatch) section = sectionMatch[1] === 'work' ? 'experience' : sectionMatch[1];

    return { mode, section };
}
