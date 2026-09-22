import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ToolPageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <main className="tool-page"><div className="tool-back"><Link className="back-link" href="/"><ArrowLeft size={16} /> Back to home</Link></div><section className="tool-hero"><p className="eyebrow"><span /> {eyebrow}</p><h1>{title}</h1><p>{intro}</p></section>{children}</main>;
}
