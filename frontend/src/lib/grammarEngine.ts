// ─── Action Verb Replacements ────────────────────────────────────────────────
const ACTION_VERB_MAP: Record<string, string[]> = {
    made: ['engineered', 'developed', 'built', 'created', 'crafted'],
    did: ['executed', 'accomplished', 'managed', 'delivered', 'achieved'],
    worked: ['collaborated', 'partnered', 'contributed', 'engaged', 'operated'],
    helped: ['facilitated', 'supported', 'assisted', 'enabled', 'empowered'],
    used: ['leveraged', 'utilized', 'implemented', 'applied', 'deployed'],
    got: ['obtained', 'secured', 'acquired', 'earned', 'attained'],
    improved: ['optimized', 'enhanced', 'elevated', 'transformed', 'amplified'],
    increased: ['accelerated', 'expanded', 'maximized', 'boosted', 'scaled'],
    reduced: ['minimized', 'streamlined', 'cut', 'eliminated', 'trimmed'],
    led: ['spearheaded', 'orchestrated', 'directed', 'championed', 'steered'],
    managed: ['oversaw', 'supervised', 'coordinated', 'governed', 'administered'],
    created: ['architected', 'designed', 'established', 'launched', 'pioneered'],
    developed: ['engineered', 'built', 'constructed', 'implemented', 'delivered'],
    handled: ['managed', 'executed', 'processed', 'oversaw', 'administered'],
    ran: ['operated', 'executed', 'directed', 'managed', 'administered'],
    built: ['engineered', 'architected', 'constructed', 'developed', 'crafted'],
    wrote: ['authored', 'drafted', 'documented', 'composed', 'produced'],
    designed: ['architected', 'crafted', 'conceptualized', 'engineered', 'shaped'],
    tested: ['validated', 'verified', 'evaluated', 'assessed', 'certified'],
    fixed: ['resolved', 'remediated', 'debugged', 'addressed', 'corrected'],
};

const WEAK_WORDS = new Set([
    'very', 'really', 'quite', 'basically', 'actually', 'generally',
    'somewhat', 'kind of', 'sort of', 'a lot', 'a bit', 'just',
]);

// Power verbs for starting bullets
const POWER_VERBS = [
    'Achieved', 'Accelerated', 'Architected', 'Automated', 'Built',
    'Championed', 'Collaborated', 'Conceived', 'Coordinated', 'Crafted',
    'Delivered', 'Designed', 'Developed', 'Directed', 'Drove',
    'Eliminated', 'Enabled', 'Engineered', 'Enhanced', 'Executed',
    'Facilitated', 'Generated', 'Grew', 'Improved', 'Implemented',
    'Increased', 'Innovated', 'Launched', 'Led', 'Leveraged',
    'Managed', 'Maximized', 'Mentored', 'Migrated', 'Modernized',
    'Optimized', 'Orchestrated', 'Overhauled', 'Partnered', 'Pioneered',
    'Reduced', 'Resolved', 'Scaled', 'Secured', 'Spearheaded',
    'Streamlined', 'Transformed', 'Unified', 'Upgraded', 'Validated',
];

// ─── Grammar Checks ───────────────────────────────────────────────────────────
const SPELLING_MAP: Record<string, string> = {
    expereince: 'experience', recieve: 'receive', achive: 'achieve',
    acheive: 'achieve', teh: 'the', thier: 'their', occured: 'occurred',
    occurance: 'occurrence', responsibilty: 'responsibility',
    managment: 'management', developement: 'development',
    implemenation: 'implementation', succes: 'success',
    proffesional: 'professional', collaboarate: 'collaborate',
    optmize: 'optimize', analysied: 'analysed', independant: 'independent',
    calender: 'calendar', definately: 'definitely', enviroment: 'environment',
    seperate: 'separate', manajer: 'manager', programe: 'program',
    skilset: 'skillset', interpersonal: 'interpersonal', relavant: 'relevant',
    knowldge: 'knowledge', prefered: 'preferred', requirment: 'requirement',
};

export function correctSpelling(text: string): string {
    return text.replace(/\b\w+\b/g, (word) => {
        const lower = word.toLowerCase();
        return SPELLING_MAP[lower]
            ? word[0] === word[0].toUpperCase()
                ? SPELLING_MAP[lower].charAt(0).toUpperCase() + SPELLING_MAP[lower].slice(1)
                : SPELLING_MAP[lower]
            : word;
    });
}

export function removeWeakWords(text: string): string {
    let result = text;
    WEAK_WORDS.forEach((w) => {
        result = result.replace(new RegExp(`\\b${w}\\b`, 'gi'), '');
    });
    return result.replace(/\s{2,}/g, ' ').trim();
}

export function formatBullet(line: string): string {
    let b = line.trim();
    if (!b) return b;
    // Capitalize first letter
    b = b.charAt(0).toUpperCase() + b.slice(1);
    // Ensure ends with period
    if (!/[.!?]$/.test(b)) b += '.';
    return b;
}

export function suggestActionVerb(text: string): string {
    const first = text.trim().split(/\s+/)[0]?.toLowerCase();
    const suggestions = ACTION_VERB_MAP[first];
    if (suggestions) return suggestions[0];
    return POWER_VERBS[Math.floor(Math.random() * POWER_VERBS.length)];
}

export function getActionVerbSuggestions(text: string): string[] {
    const first = text.trim().split(/\s+/)[0]?.toLowerCase();
    return ACTION_VERB_MAP[first] ?? POWER_VERBS.slice(0, 5);
}

export function improveBullets(text: string): string {
    return text
        .split('\n')
        .map((line) => {
            let l = correctSpelling(removeWeakWords(line.trim()));
            if (!l) return '';
            // Replace weak starting verb
            const firstWord = l.split(/\s+/)[0]?.toLowerCase();
            if (ACTION_VERB_MAP[firstWord]) {
                const replacement = ACTION_VERB_MAP[firstWord][0];
                l = replacement.charAt(0).toUpperCase() + replacement.slice(1) + l.slice(firstWord.length);
            }
            return formatBullet(l);
        })
        .filter(Boolean)
        .join('\n');
}
