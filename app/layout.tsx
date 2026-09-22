import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FloatingAssistant from "@/components/floating-assistant";

export const metadata: Metadata = {
  title: { default: "Solarious Energy | Solar Modules for Every Project", template: "%s | Solarious Energy" },
  description: "Explore Solarious Energy solar module technologies, manufacturing capabilities and project support.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  metadataBase: new URL("https://solarious-energy-corporate.dipteshpatil83.chatgpt.site"),
  openGraph: { type:"website", siteName:"Solarious Energy", title:"Solarious Energy", description:"Solar modules, manufacturing and project-focused engineering support." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /><FloatingAssistant /></body></html>;
}
