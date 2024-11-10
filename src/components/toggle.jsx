"use client"
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    function isDark() {
        return theme === "dark";
    }

    return (
        <button
            className="focus:outline-none text-2xl"
            onClick={() => setTheme(isDark() ? "light" : "dark")}
            aria-label="Theme toggle"
        >
            {isDark() ? <div className="flex"><Icon icon="material-symbols:sunny" scale={30} fontSize={28} /></div> : <div className="flex gap-2"><Icon icon="material-symbols:mode-night" scale={30} fontSize={28} /></div>}
        </button>
    );
}