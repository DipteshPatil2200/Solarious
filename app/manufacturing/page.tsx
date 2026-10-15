import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Factory, ScanLine, ShieldCheck } from "lucide-react";
import InnerPageHero from "@/components/inner-page-hero";
import { manufacturingSteps, pageContent } from "@/data/site";

export const metadata: Metadata = { title: "Solar Module Manufacturing", description: "Explore the Solarious solar module manufacturing process, automation, testing and traceability." };

const features = [
  { title: "Controlled production", text: pageContent.manufacturing.sections[0][1], icon: Factory },
  { title: "Automation with oversight", text: pageContent.manufacturing.sections[1][1], icon: ScanLine },
  { title: "Quality monitoring", text: pageContent.manufacturing.sections[2][1], icon: ShieldCheck },
];

export default function ManufacturingPage() {
  return <main className="premium-manufacturing-page">
    <InnerPageHero eyebrow={pageContent.manufacturing.eyebrow} title="Precision Manufacturing. Powering Tomorrow." description={pageContent.manufacturing.intro} image="/manufacturing-line.webp" />
    <section className="manufacturing-editorial premium-section">
      <div className="premium-heading-row"><div><p className="premium-kicker">Manufacturing excellence</p><h2>Process discipline from cell inspection to dispatch.</h2></div><p>Solarious brings controlled material flow, repeatable assembly and structured testing together to support project-ready modules.</p></div>
      <div className="manufacturing-editorial-image"><Image src="/manufacturing-line.webp" alt="Solar module manufacturing equipment" fill sizes="(max-width: 700px) 100vw, 1240px" /><span>Solarious / Production &amp; engineering</span></div>
      <div className="manufacturing-editorial-features">{features.map(({ title, text, icon: Icon }, index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={23} /><h2>{title}</h2><p>{text}</p></article>)}</div>
    </section>
    <section className="manufacturing-process premium-section">
      <div className="premium-heading-row"><div><p className="premium-kicker">How we build excellence</p><h2>A transparent manufacturing journey.</h2></div><p>No unverified capacity or performance statistics—only the real process stages used to shape quality and traceability.</p></div>
      <div className="manufacturing-process-grid">{manufacturingSteps.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><CheckCircle2 size={18} /><strong>{step}</strong></article>)}</div>
      <div className="premium-wide-cta"><div><p className="premium-kicker">Plan with confidence</p><h2>Discuss your module requirements.</h2></div><Link className="premium-button" href="/quote">Request a quote <ArrowRight size={16} /></Link></div>
    </section>
  </main>;
}
