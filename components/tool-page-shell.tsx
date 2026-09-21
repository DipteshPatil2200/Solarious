import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ToolPageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <main className="tool-page"><header className="tool-header"><Link href="/" className="brand" aria-label="Solarious Energy home"><Image src="/solarious-logo.jpeg" alt="Solarious Energy" width={236} height={86} priority /></Link><Link className="back-link" href="/"><ArrowLeft size={16} /> Back to home</Link></header><section className="tool-hero"><p className="eyebrow"><span /> {eyebrow}</p><h1>{title}</h1><p>{intro}</p></section>{children}</main>;
}
