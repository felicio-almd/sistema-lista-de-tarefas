import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Header({ children }) {
    return (
        <header className="px-10 py-4 h-14 w-full flex items-center justify-around">
            <Link href="/" className="bg-none text-lg font-semibold transition-all">Lista de Tarefas do: Felicio</Link>
            {children}
        </header>
    )
}