import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full h-16 flex items-center justify-center gap-4 py-4">
            <Link
                href="https://github.com/felicio-almd"
                target="_blank"
                className="rounded-lg p-2 text-lg flex items-center justify-center gap-2 text-black h-full hover:bg-blue-500 transition-all"
            >
                <Icon icon="mdi:github" width="32" height="32" />
                <p>github</p>
            </Link>

            <Link
                href="https://www.linkedin.com/in/felicio-rodney-almeida-rocha/"
                target="_blank"
                className="rounded-lg p-1 text-lg flex items-center justify-center text-black h-full hover:bg-blue-500 transition-all"
            >
                © felicio.almd
            </Link>
        </footer>
    );
}