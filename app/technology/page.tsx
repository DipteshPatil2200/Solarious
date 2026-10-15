import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InnerPageHero from "@/components/inner-page-hero";
import TechnologyTabs from "@/components/technology-tabs";
import { getSiteProducts } from "@/lib/site-products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Technology & Innovation", description: "Compare Mono PERC, TOPCon, HJT and Bifacial solar cell technologies." };

export default async function TechnologyPage() {
  const products = await getSiteProducts();
  return <main className="premium-technology-page">
    <InnerPageHero eyebrow="Technology & innovation" title="Technology That Powers Tomorrow" description="Explore solar cell architectures for different space, performance and project-design priorities." image="/ai-solar-intelligence.webp" />
    <section className="premium-section">
      <div className="premium-heading-row"><div><p className="premium-kicker">Technology portfolio</p><h2>Four pathways to <em>better project fit.</em></h2></div><p>Choose a category to explore its approved overview, key advantages, applicable products and related documents.</p></div>
      <TechnologyTabs products={products} />
      <div className="premium-wide-cta"><div><p className="premium-kicker">Need confirmed specifications?</p><h2>Compare technologies for your project.</h2></div><Link className="premium-button" href="/compare">Open comparison <ArrowRight size={16} /></Link></div>
    </section>
  </main>;
}
