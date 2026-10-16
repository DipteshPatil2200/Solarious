"use client";
import { useEffect, useState } from "react";
import { Download, ExternalLink, FileCheck2 } from "lucide-react";
type Certificate = {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  issuingOrganization?: string;
  certificateNumber?: string;
  logoUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  verificationUrl?: string;
};
export default function CertificatesSection() {
  const [items, setItems] = useState<Certificate[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/resources", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { resources?: Array<Certificate & { category: string }> }) =>
        setItems(
          (data.resources || []).filter(
            (item) => item.category === "Certificates",
          ),
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <section
      className="about-certificates"
      aria-labelledby="certificates-title"
    >
      <div>
        <p className="eyebrow">Verified documents</p>
        <h2 id="certificates-title">Certifications</h2>
        <p>
          Only certificates published by an authorised administrator are shown
          here.
        </p>
      </div>
      {items.length ? (
        <div className="resource-grid">
          {items.map((item) => (
            <article key={item.id}>
              {item.logoUrl ? (
                <img src={item.logoUrl} alt="" />
              ) : (
                <FileCheck2 size={26} />
              )}
              <span>Certificate</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {item.issuingOrganization && (
                <p>
                  <strong>Issued by:</strong> {item.issuingOrganization}
                </p>
              )}
              {item.certificateNumber && (
                <p>
                  <strong>Certificate:</strong> {item.certificateNumber}
                </p>
              )}
              {(item.issueDate || item.expiryDate) && (
                <p>
                  {item.issueDate
                    ? `Issued ${new Date(item.issueDate).toLocaleDateString("en-IN")}`
                    : ""}
                  {item.expiryDate
                    ? ` · Valid until ${new Date(item.expiryDate).toLocaleDateString("en-IN")}`
                    : ""}
                </p>
              )}
              <small>
                {item.file_name} · {(item.file_size / 1024 / 1024).toFixed(1)}{" "}
                MB
              </small>
              <div className="resource-actions">
                <a
                  href={`/api/resources/${item.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} /> Preview
                </a>
                <a href={`/api/resources/${item.id}/file?download=1`}>
                  <Download size={15} /> Download
                </a>
                {item.verificationUrl && (
                  <a
                    href={item.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} /> Verify
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="document-empty">
          Verified certificate files will appear here after publication.
        </p>
      )}
    </section>
  );
}
