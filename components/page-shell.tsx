import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function PageShell({eyebrow,title,intro,image="/utility-solar.webp",children}:{eyebrow:string;title:string;intro:string;image?:string;children:React.ReactNode}){return <main><section className="inner-hero"><div><p className="eyebrow"><span/> {eyebrow}</p><h1>{title}</h1><p>{intro}</p><div className="hero-actions"><Link className="button" href="/products">Explore products <ArrowRight size={16}/></Link><Link className="button button-ghost" href="/contact">Contact our team</Link></div></div><div className="inner-hero-image"><Image src={image} alt="Solarious Energy solar technology" fill priority sizes="(max-width: 900px) 100vw, 48vw"/></div></section>{children}</main>}
