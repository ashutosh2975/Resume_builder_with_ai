import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-full hover:bg-primary/10 transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {dark ? (
                <Sun className="h-4 w-4 text-amber-400" />
            ) : (
                <Moon className="h-4 w-4 text-slate-600" />
            )}
        </Button>
    );
}
