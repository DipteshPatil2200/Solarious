import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import CertificatesSection from "@/components/certificates-section";
import PageShell from "@/components/page-shell";
import TeamSection from "@/components/team-section";
import { getAboutCms } from "@/lib/site-cms";
export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Solarious Energy, its mission, manufacturing focus and company values.",
};
export default async function Page() {
  const content = await getAboutCms();
  return (
    <PageShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      image={content.heroImage}
    >
      <section className="content-section">
        <div className="content-grid">
          {content.sections.map((section, index) => (
            <article className="content-card" key={`${section.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <CheckCircle2 size={22} />
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
        {content.timeline.length > 0 && (
          <section className="about-timeline" aria-labelledby="journey-title">
            <p className="eyebrow">Company roadmap</p>
            <h2 id="journey-title">Our Journey</h2>
            <div>
              {content.timeline.map((item, index) => (
                <article key={`${item.year}-${index}`}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" loading="lazy" />
                  )}
                  <strong>{item.year}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        <TeamSection />
        <CertificatesSection />
      </section>
    </PageShell>
  );
}
