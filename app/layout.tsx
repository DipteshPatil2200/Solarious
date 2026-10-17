import type { Metadata } from "next";
import "./globals.css";
import "./resource-admin.css";
import "./form-fixes.css";
import "./company-details.css";
import "./hero-slider.css";
import "./premium-home.css";
import "./log-management.css";
import "./inner-pages.css";
import "./quote-overrides.css";
import "./quote-popup.css";
import "./usability.css";
import "./footer.css";
import "./team.css";
import "./mobile-navigation.css";
import "./product-image-sizing.css";
import "./content-image-sizing.css";
import "./admin-products.css";
import "./admin-dashboard.css";
import "./admin-team-photo.css";
import "./dynamic-image-fixes.css";
import "./events.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FloatingAssistant from "@/components/floating-assistant";
import { getBrandingCms } from "@/lib/site-cms";

const baseMetadata: Metadata = {
  title: {
    default: "Solarious Energy | Solar Modules for Every Project",
    template: "%s | Solarious Energy",
  },
  description:
    "Explore Solarious Energy solar module technologies, manufacturing capabilities and project support.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.solariousenergy.in",
  ),
  openGraph: {
    type: "website",
    siteName: "Solarious Energy",
    title: "Solarious Energy",
    description:
      "Solar modules, manufacturing and project-focused engineering support.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingCms();
  return {
    ...baseMetadata,
    icons: { icon: branding.faviconUrl, shortcut: branding.faviconUrl },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const branding = await getBrandingCms();
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <SiteHeader
          logoUrl={branding.logoUrl}
          alternateLogoUrl={branding.alternateLogoUrl}
        />
        <div id="main-content">{children}</div>
        <SiteFooter logoUrl={branding.footerLogoUrl || branding.logoUrl} />
        <FloatingAssistant />
      </body>
    </html>
  );
}
