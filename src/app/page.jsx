import { ThemeProvider } from "next-themes";
import Welcome from "./pages/dashboard";

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange >
      <Welcome />
    </ThemeProvider>
  );
}
