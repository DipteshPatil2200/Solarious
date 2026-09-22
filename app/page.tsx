import Link from "next/link";
import { ArrowRight, Factory, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import AiSolarSection from "@/components/ai-solar-section";

const pillars = [
  { number: "01", title: "Premium Quality", text: "Every module is designed around disciplined inspection, dependable materials and traceable quality checks.", icon: ShieldCheck },
  { number: "02", title: "Advanced Technology", text: "Modern module technologies and automated processes support consistent performance across project types.", icon: Sparkles },
  { number: "03", title: "Sustainable Progress", text: "Efficient manufacturing and durable solar solutions help projects move toward lower-carbon energy.", icon: Leaf },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="about">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Advanced solar module manufacturing</p>
          <h1>Clean energy.<br /><em>Pure world.</em></h1>
          <p className="hero-lede">Solarious Energy builds high-efficiency solar modules for EPC companies, developers and renewable-energy projects—backed by a focus on engineering, quality and responsive technical support.</p>
          <div className="hero-actions"><Link className="button" href="/products">Explore products <ArrowRight size={18} /></Link><Link className="button button-ghost" href="/contact#quote">Talk to our team</Link></div>
          <div className="ai-indicator"><Sparkles size={16} /><span><strong>AI-Enabled Solar Solutions</strong><small>Digital guidance for product discovery and project planning</small></span></div>
          <p className="data-note">Technical specifications and company statistics are published only after verification.</p>
        </div>
        <div className="hero-visual" aria-label="Solar module installation">
          <div className="hero-sun" />
          <div className="panel-grid" aria-hidden="true">{Array.from({ length: 24 }).map((_, i) => <span key={i} />)}</div>
          <div className="hero-tag"><Factory size={19} /><span><strong>Made for real projects</strong><small>Commercial · Industrial · Utility</small></span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Key capabilities">
        <p>Project-focused engineering</p><p>Multi-technology portfolio</p><p>Technical sales support</p><p>Configurable specifications</p>
      </section>

      <section className="section pillars" id="technology">
        <div className="section-heading"><div><p className="eyebrow">Why Solarious</p><h2>Built on <em>three pillars</em></h2></div><p>Purposeful technology, disciplined quality and sustainability thinking—brought together for demanding solar projects.</p></div>
        <div className="pillar-grid">{pillars.map(({ number, title, text, icon: Icon }) => <article className="pillar-card" key={number}><div className="card-top"><span className="icon-box"><Icon size={22} /></span><span>{number}</span></div><h3>{title}</h3><p>{text}</p><Link href="/#manufacturing">Learn more <ArrowRight size={15} /></Link></article>)}</div>
      </section>

      <AiSolarSection />
    </main>
  );
}
