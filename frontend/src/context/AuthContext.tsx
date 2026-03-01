import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: number;
    full_name: string;
    email: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (full_name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5000/api";
const TOKEN_KEY = "rf_token";
const USER_KEY = "rf_user";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const u = localStorage.getItem(USER_KEY);
            return u ? JSON.parse(u) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [backendOnline, setBackendOnline] = useState(true);

    // On mount: verify backend/health and stored token
    useEffect(() => {
        // ping health to detect if server is running
        fetch(`${API_BASE}/health`)
            .then((r) => {
                if (!r.ok) throw new Error("down");
                setBackendOnline(true);
            })
            .catch(() => {
                setBackendOnline(false);
            });

        if (!token) return;
        setIsLoading(true);
        fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("invalid");
                const data = await res.json();
                const u = data.user;
                setUser(u);
                localStorage.setItem(USER_KEY, JSON.stringify(u));
            })
            .catch(() => {
                // Token invalid / expired — clear it
                setToken(null);
                setUser(null);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            })
            .finally(() => setIsLoading(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const persist = (t: string, u: AuthUser) => {
        setToken(t);
        setUser(u);
        localStorage.setItem(TOKEN_KEY, t);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            // network error will throw before we get here
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed.");
            persist(data.token, data.user);
        } catch (err: any) {
            if (err instanceof TypeError) {
                // fetch failed to reach server (CORS, network down, server stopped)
                throw new Error("Unable to contact backend API. Is the server running on http://localhost:5000?");
            }
            throw err;
        }
    };

    const register = async (full_name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                // Propagate field-level validation errors
                if (data.errors) {
                    const err: any = new Error("Validation failed");
                    err.fields = data.errors;
                    throw err;
                }
                throw new Error(data.error || "Registration failed.");
            }
            persist(data.token, data.user);
        } catch (err: any) {
            if (err instanceof TypeError) {
                throw new Error("Unable to contact backend API. Is the server running on http://localhost:5000?");
            }
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    return (
        <AuthContext.Provider value={{
            user, token, isLoading,
            backendOnline,
            isAuthenticated: !!token && !!user,
            login, register, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
