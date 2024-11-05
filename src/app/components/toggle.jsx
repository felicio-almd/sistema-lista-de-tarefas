import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Aqui dizemos que esse componente só deve ser mostrado
    // depois da página carregada. Isso evita que o ícone
    // errado apareça antes do next-themes saber se deve
    // carregar o tema dark ou o tema light
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    // Uma função simples para verificar qual tema está ativo
    function isDark() {
        return theme === "dark";
    }

    return (
        <button
            className="focus:outline-none"
            onClick={() => setTheme(isDark() ? "light" : "dark")}
            aria-label="Theme toggle"
        >
            {isDark() ? <Icon icon="material-symbols:sunny" scale={20} /> : <Icon icon="material-symbols:mode-night" scale={20} />}
        </button>
    );
}