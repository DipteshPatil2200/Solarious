import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Solarious Energy | Solar Modules for Every Project", template: "%s | Solarious Energy" },
  description: "Explore Solarious Energy solar module technologies, manufacturing capabilities and project support.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
