"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Calculator, ChartNoAxesCombined, SearchCheck, Send, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const features = [
  { number: "01", title: "AI Solar Assistant", text: "Ask questions about Solarious products, technologies, applications, specifications and the quotation process.", label: "Ask Solarious AI", href: null, icon: Bot },
  { number: "02", title: "Smart Module Finder", text: "Identify a suitable solar module category based on your project type, space and performance priorities.", label: "Find my module", href: "/module-recommender", icon: SearchCheck },
  { number: "03", title: "Solar Project Calculator", text: "Get preliminary module quantity, system capacity and area estimates using transparent assumptions.", label: "Calculate project", href: "/solar-calculator", icon: Calculator },
  { number: "04", title: "Intelligent Comparison", text: "Compare Mono PERC, TOPCon, HJT and Bifacial technologies using approved category-level information.", label: "Compare modules", href: "/compare", icon: ChartNoAxesCombined },
];

function AssistantDialog() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Choose a quick question or ask about module technologies and project planning.");
  const reply = (value: string) => {
    const q = value.toLowerCase();
    if (q.includes("topcon")) setAnswer("TOPCon is a high-efficiency cell technology often considered for projects prioritising performance. Exact Solarious specifications must be confirmed by the technical team.");
    else if (q.includes("bifacial")) setAnswer("Bifacial modules can generate from front and rear surfaces when site conditions support rear-side irradiance. Suitability depends on mounting, albedo and project design.");
    else if (q.includes("quote") || q.includes("price")) setAnswer("For confirmed pricing and availability, please share your project capacity, location and preferred technology through the quote form.");
    else setAnswer("Please contact the Solarious technical team for confirmed information. I can also help you find a module category, compare technologies or start a quote.");
    setQuestion("");
  };
  return <Dialog><DialogTrigger asChild><button className="ai-card-action" type="button">Ask Solarious AI <ArrowRight size={15} /></button></DialogTrigger><DialogContent className="assistant-dialog"><DialogHeader><DialogTitle>Solarious AI Assistant</DialogTitle><DialogDescription>Product guidance based on approved website information. Confirm final specifications with the technical team.</DialogDescription></DialogHeader><div className="assistant-answer" aria-live="polite">{answer}</div><div className="quick-prompts"><button onClick={() => reply("TOPCon")}>What is TOPCon?</button><button onClick={() => reply("Bifacial")}>When is bifacial suitable?</button><button onClick={() => reply("Quote")}>How do I request a quote?</button></div><form className="assistant-form" onSubmit={(event) => { event.preventDefault(); if (question.trim()) reply(question); }}><label className="sr-only" htmlFor="ai-question">Ask Solarious AI</label><input id="ai-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about solar modules…" /><button type="submit" aria-label="Send question"><Send size={18} /></button></form><div className="assistant-links"><Link href="/module-recommender">Find a module</Link><Link href="/compare">Compare products</Link><Link href="/contact#quote">Request quote</Link></div></DialogContent></Dialog>;
}

export default function AiSolarSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const node = ref.current; if (!node) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: .12 }); observer.observe(node); return () => observer.disconnect(); }, []);
  return <section ref={ref} className={`section ai-section ${visible ? "is-visible" : ""}`} aria-labelledby="ai-solar-heading">
    <div className="ai-section-grid">
      <div className="ai-visual-wrap">
        <Image className="ai-visual" src="/ai-solar-intelligence.webp" alt="Solar panel installation with subtle digital energy monitoring and performance analytics" fill sizes="(max-width: 900px) 100vw, 48vw" />
        <div className="analytics-panel" aria-hidden="true"><span className="analytics-kicker">LIVE INTELLIGENCE</span><strong>Performance overview</strong><div className="analytics-chart"><i /><i /><i /><i /><i /><i /><i /></div><div className="analytics-meta"><span>Generation</span><span>Monitoring active</span></div></div>
        <div className="data-node node-one" aria-hidden="true"><Sparkles size={15} /> Predictive insights</div>
        <div className="data-node node-two" aria-hidden="true">Smart grid connected</div>
      </div>
      <div className="ai-copy">
        <p className="eyebrow"><span /> AI-powered solar technology</p>
        <h2 id="ai-solar-heading">Smarter Solar.<br /><em>Powered by Intelligence.</em></h2>
        <p>Combine advanced solar technology with intelligent digital tools to help customers understand module technologies, compare products, estimate project requirements, and connect with the right Solarious solution.</p>
        <div className="ai-assurance"><Sparkles size={18} /><span><strong>Engineering assistance, not guesswork</strong><small>Digital guidance uses approved information and clearly identifies when technical confirmation is required.</small></span></div>
      </div>
    </div>
    <div className="ai-feature-grid">{features.map(({ number, title, text, label, href, icon: Icon }) => <article className="ai-feature-card" key={number}><div className="ai-card-top"><span>{number}</span><Icon size={21} /></div><h3>{title}</h3><p>{text}</p>{href ? <Link className="ai-card-action" href={href}>{label} <ArrowRight size={15} /></Link> : <AssistantDialog />}</article>)}</div>
  </section>;
}
