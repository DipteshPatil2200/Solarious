import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import LocationMap from "@/components/location-map";
import PageShell from "@/components/page-shell";
import { company } from "@/data/site";
import { getLocations } from "@/lib/site-cms";
export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Solarious Energy for module specifications, quotations and project support.",
};
export default async function Page() {
  const locations = await getLocations();
  return (
    <PageShell
      eyebrow="Get in touch"
      title="Let’s Work Together"
      intro="Tell us about your application, capacity and timeline. The right Solarious team member can respond with confirmed information."
      image="/ai-solar-intelligence.webp"
    >
      <section className="content-section">
        <div className="contact-layout">
          <div>
            <p className="eyebrow">Request information</p>
            <h2>Start your inquiry</h2>
            <ContactForm />
            <p className="contact-email-note">
              Prefer email?{" "}
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
          </div>
          <aside>
            <h2>Company details</h2>
            <dl>
              <div>
                <dt>Company</dt>
                <dd>{company.legalName}</dd>
              </div>
              <div>
                <dt>Head Office</dt>
                <dd>{company.headOffice}</dd>
              </div>
              <div>
                <dt>Manufacturing Unit</dt>
                <dd>{company.manufacturingUnit}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="contact-actions">
              <a className="button" href={`mailto:${company.email}`}>
                Email Solarious
              </a>
            </div>
            <p>
              No company phone number is published because it has not been
              verified in the supplied company document.
            </p>
          </aside>
        </div>
        {locations.map((location) => (
          <LocationMap
            key={location.id || `${location.latitude}-${location.longitude}`}
            location={location}
          />
        ))}
      </section>
    </PageShell>
  );
}
