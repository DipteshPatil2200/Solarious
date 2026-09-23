import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import AiSolarSection from "@/components/ai-solar-section";
import HeroSlider from "@/components/hero-slider";
import { getHeroBanners } from "@/lib/hero-banners";

const pillars = [
  { number: "01", title: "Premium Quality", text: "Every module is designed around disciplined inspection, dependable materials and traceable quality checks.", icon: ShieldCheck },
  { number: "02", title: "Advanced Technology", text: "Modern module technologies and automated processes support consistent performance across project types.", icon: Sparkles },
  { number: "03", title: "Sustainable Progress", text: "Efficient manufacturing and durable solar solutions help projects move toward lower-carbon energy.", icon: Leaf },
];

export default async function Home() {
  const banners = await getHeroBanners();
  return (
    <main>
      <HeroSlider banners={banners}/>

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
