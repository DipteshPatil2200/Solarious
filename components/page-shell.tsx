import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InnerPageHero from "@/components/inner-page-hero";import LeadFormModal from "@/components/lead-form-modal";
export default function PageShell({eyebrow,title,intro,image="/utility-solar.webp",children}:{eyebrow:string;title:string;intro:string;image?:string;children:React.ReactNode}){return <main><InnerPageHero eyebrow={eyebrow} title={title} description={intro} image={image} actions={<><Link className="button" href="/products">Explore products <ArrowRight size={16}/></Link><LeadFormModal label="Contact our team" className="button button-ghost" kind="contact"/></>}/>{children}</main>}
