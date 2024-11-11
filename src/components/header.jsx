import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Header({ children, title }) {
    return (
        <header className="max-lg:px-4 max-lg:py-6 py-4 px-2 h-20 max-w-screen-xl w-full text-3xl flex items-center justify-between">
            <Link href="/" className="bg-none font-semibold max-sm:hidden">{title}</Link>
            <Link href="/" className="bg-none font-semibold sm:hidden">Olá!</Link>
            <div>
                {children}
            </div>
        </header>
    )
}