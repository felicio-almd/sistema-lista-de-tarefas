import { Poppins } from 'next/font/google'
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

export const metadata = {
  title: "Lista de Tarefas",
  description: "Sistema de Lista de Tarefas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={poppins.className}
      >
        {children}
      </body>
    </html>
  );
}
