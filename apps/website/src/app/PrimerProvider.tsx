"use client"

import * as React from "react";
import { ThemeProvider } from "@primer/react-brand";

export default function PrimerProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = React.useState<"light" | "dark">("dark")

    React.useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('xyd-theme') : null
        const initial = (saved === 'light' || saved === 'dark') ? saved : 'dark'
        document.documentElement.setAttribute('data-color-mode', initial)
        setMode(initial as any)
    }, [])

    function toggleTheme() {
        setMode((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark'
            document.documentElement.setAttribute('data-color-mode', next)
            try { localStorage.setItem('xyd-theme', next) } catch {}
            return next
        })
    }

    return <ThemeProvider colorMode={mode}>
        {children}
        <button aria-label="Toggle theme" className="theme-toggle" onClick={toggleTheme}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21.64 13a1 1 0 0 0-1.05-.14A8 8 0 0 1 11.1 3.41a1 1 0 0 0-1.19-1.31A10 10 0 1 0 22 14a1 1 0 0 0-.36-1z"/>
            </svg>
            <span>Theme</span>
        </button>
    </ThemeProvider>
}