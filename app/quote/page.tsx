import type { Metadata } from "next";
import QuoteWizard from "@/components/quote-wizard";
import { company } from "@/data/site";
export const metadata:Metadata={title:"Request a Quote",description:"Submit project and solar module requirements to the Solarious Energy team."};
export default function Page(){return <main className="quote-page"><section><p className="eyebrow"><span/> Project inquiry</p><h1>Request a <em>Solar Quote</em></h1><p>Share your project details through a guided five-step form. Confirmed specifications and pricing are provided by the Solarious team.</p></section><QuoteWizard/><p className="quote-contact-note">For quotation assistance, email <a href={`mailto:${company.email}`}>{company.email}</a>.</p></main>}
