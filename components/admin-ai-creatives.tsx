"use client";
import { adminFetch } from "@/lib/admin-fetch";
import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { apiError } from "@/lib/api-error";

type Settings = {
  company_name: string;
  email: string;
  mobile: string;
  website: string;
  default_cta: string;
  show_email: number;
  show_mobile: number;
  show_website: number;
};
type Creative = {
  id: string;
  creative_date: string;
  daily_sequence: number;
  generation_type: "automatic" | "manual";
  theme: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string;
  image_prompt: string;
  campaign_type: string;
  image_url: string;
  content_only: boolean;
  status: string;
  failure_code: string;
};
type ManualGeneration = {
  date: string;
  count: number;
  limit: number;
  remaining: number;
};
const occasions = [
  "Republic Day",
  "Independence Day",
  "Gandhi Jayanti",
  "Diwali",
  "Dussehra",
  "Ganesh Chaturthi",
  "Holi",
  "Gudi Padwa",
  "Makar Sankranti",
  "Raksha Bandhan",
  "Christmas",
  "New Year",
  "Maharashtra Day",
  "Labour Day",
  "Company Anniversary",
  "Custom Occasion",
];

export default function AdminAiCreatives() {
  const [settings, setSettings] = useState<Settings | null>(null),
    [items, setItems] = useState<Creative[]>([]),
    [manualGeneration, setManualGeneration] = useState<ManualGeneration>({
      date: "",
      count: 0,
      limit: 3,
      remaining: 3,
    }),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [preview, setPreview] = useState<Creative | null>(null);
  const [festival, setFestival] = useState({
    occasion: "Diwali",
    customOccasion: "",
    year: new Date().getFullYear(),
    language: "English",
    aspectRatio: "1:1",
    headline: "Warm wishes from Solarious Energy",
    caption:
      "May this occasion bring light, progress and sustainable prosperity.",
    theme: "Elegant festive lights with premium solar-inspired details",
    fontSize: 58,
    color: "#ffffff",
    alignment: "middle",
    position: 68,
  });
  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        adminFetch("/api/admin/creative-settings"),
        adminFetch("/api/admin/creatives"),
      ]);
      if (!a.ok)
        throw await apiError(a, "Creative settings could not be loaded");
      if (!b.ok)
        throw await apiError(b, "Generation history could not be loaded");
      const [settingsData, creativesData] = await Promise.all([
        a.json(),
        b.json(),
      ]);
      setSettings(settingsData.settings);
      setItems(creativesData.creatives);
      setManualGeneration(
        creativesData.manualGeneration || {
          date: "",
          count: 0,
          limit: 3,
          remaining: 3,
        },
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Marketing data could not be loaded.",
      );
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await adminFetch("/api/admin/creative-settings", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      if (!response.ok)
        throw await apiError(response, "Branding settings could not be saved");
      setNotice("Branding settings saved.");
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Branding settings could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function request(
    path: string,
    options?: RequestInit,
    success?: string,
  ) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await adminFetch(path, options);
      if (!response.ok)
        throw await apiError(response, "Creative request failed");
      setNotice(success || "Creative updated.");
      await load();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Creative request failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copyCaption(item: Creative) {
    try {
      await navigator.clipboard.writeText(
        item.caption + "\n\n" + item.hashtags,
      );
      setNotice("Caption copied.");
    } catch {
      setNotice("Caption could not be copied. Please select it manually.");
    }
  }
  async function editCaption(item: Creative) {
    const caption = window.prompt("Edit caption", item.caption);
    if (caption === null) return;
    await request(
      "/api/admin/creatives",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, caption }),
      },
      "Caption updated.",
    );
  }
  function share(item: Creative) {
    const message =
      item.headline +
      "\n\n" +
      item.caption +
      "\n\n" +
      item.hashtags +
      (item.image_url ? "\n" + item.image_url : "");
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer",
    );
  }
  function download(item: Creative) {
    window.open(
      "/api/admin/creatives/" + item.id + "/download",
      "_blank",
      "noopener,noreferrer",
    );
  }
  const generateFestival = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await request(
      "/api/admin/creatives/festival",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...festival,
          textConfig: {
            fontSize: festival.fontSize,
            color: festival.color,
            alignment: festival.alignment,
            position: festival.position,
            fontFamily: "Noto Sans Devanagari, Mangal, Arial, sans-serif",
            fontWeight: 700,
            shadow: true,
          },
        }),
      },
      "Festival creative generated and saved.",
    );
  };
  return (
    <section className="admin-panel creative-admin">
      <div className="admin-panel-head">
        <div>
          <h2>Marketing / Festival Creative Studio</h2>
          <p>
            Create deterministic branded greetings with AI backgrounds and a
            resilient editable-template fallback.
          </p>
          <p>
            <strong>
              Today&apos;s Daily AI Generations: {manualGeneration.count} /{" "}
              {manualGeneration.limit}
            </strong>
          </p>
        </div>
        <button
          className="button"
          onClick={() =>
            void request(
              "/api/admin/creatives",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
              },
              "Creative generated and saved.",
            )
          }
          disabled={busy || manualGeneration.count >= manualGeneration.limit}
        >
          {busy ? (
            <Loader2 className="spin" size={16} />
          ) : (
            <ImagePlus size={16} />
          )}{" "}
          {manualGeneration.count >= manualGeneration.limit
            ? "Generation Limit Reached"
            : "Generate Daily Creative"}
        </button>
      </div>
      {notice && <div className="admin-notice">{notice}</div>}
      <form
        className="creative-settings festival-studio"
        onSubmit={generateFestival}
      >
        <label>
          Occasion
          <select
            value={festival.occasion}
            onChange={(e) =>
              setFestival({ ...festival, occasion: e.target.value })
            }
          >
            {occasions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        {festival.occasion === "Custom Occasion" && (
          <label>
            Custom occasion
            <input
              required
              value={festival.customOccasion}
              onChange={(e) =>
                setFestival({ ...festival, customOccasion: e.target.value })
              }
            />
          </label>
        )}
        <label>
          Year
          <input
            type="number"
            min="2020"
            max="2100"
            value={festival.year}
            onChange={(e) =>
              setFestival({ ...festival, year: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Language
          <select
            value={festival.language}
            onChange={(e) =>
              setFestival({ ...festival, language: e.target.value })
            }
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
        </label>
        <label>
          Aspect ratio
          <select
            value={festival.aspectRatio}
            onChange={(e) =>
              setFestival({ ...festival, aspectRatio: e.target.value })
            }
          >
            <option value="1:1">1:1 Square</option>
            <option value="4:5">4:5 Portrait</option>
            <option value="9:16">9:16 Story</option>
            <option value="16:9">16:9 Banner</option>
          </select>
        </label>
        <label>
          Greeting headline
          <input
            required
            value={festival.headline}
            onChange={(e) =>
              setFestival({ ...festival, headline: e.target.value })
            }
          />
        </label>
        <label>
          Supporting text
          <input
            value={festival.caption}
            onChange={(e) =>
              setFestival({ ...festival, caption: e.target.value })
            }
          />
        </label>
        <label>
          Visual theme
          <input
            value={festival.theme}
            onChange={(e) =>
              setFestival({ ...festival, theme: e.target.value })
            }
          />
        </label>
        <label>
          Font size: {festival.fontSize}px
          <input
            type="range"
            min="28"
            max="96"
            value={festival.fontSize}
            onChange={(e) =>
              setFestival({ ...festival, fontSize: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Text position: {festival.position}%
          <input
            type="range"
            min="28"
            max="82"
            value={festival.position}
            onChange={(e) =>
              setFestival({ ...festival, position: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Text colour
          <input
            type="color"
            value={festival.color}
            onChange={(e) =>
              setFestival({ ...festival, color: e.target.value })
            }
          />
        </label>
        <label>
          Alignment
          <select
            value={festival.alignment}
            onChange={(e) =>
              setFestival({ ...festival, alignment: e.target.value })
            }
          >
            <option value="start">Left</option>
            <option value="middle">Centre</option>
            <option value="end">Right</option>
          </select>
        </label>
        <button className="button" disabled={busy}>
          {busy ? (
            <Loader2 className="spin" size={16} />
          ) : (
            <ImagePlus size={16} />
          )}{" "}
          Generate festival creative
        </button>
      </form>
      {settings && (
        <form className="creative-settings" onSubmit={save}>
          <label>
            Company logo
            <input
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp,image/avif"
            />
          </label>
          <label>
            Company name
            <input
              name="companyName"
              defaultValue={settings.company_name}
              required
            />
          </label>
          <label>
            Email ID
            <input
              type="email"
              name="email"
              defaultValue={settings.email}
              required
            />
          </label>
          <label>
            Verified mobile number
            <input
              name="mobile"
              defaultValue={settings.mobile}
              placeholder="Required for final image branding"
              required
            />
          </label>
          <label>
            Website URL
            <input name="website" defaultValue={settings.website} />
          </label>
          <label>
            Default CTA
            <input
              name="defaultCta"
              defaultValue={settings.default_cta}
              required
            />
          </label>
          <div className="creative-toggles">
            <label>
              <input
                type="checkbox"
                name="showEmail"
                value="true"
                defaultChecked={Boolean(settings.show_email)}
              />{" "}
              Show email
            </label>
            <label>
              <input
                type="checkbox"
                name="showMobile"
                value="true"
                defaultChecked={Boolean(settings.show_mobile)}
              />{" "}
              Show mobile
            </label>
            <label>
              <input
                type="checkbox"
                name="showWebsite"
                value="true"
                defaultChecked={Boolean(settings.show_website)}
              />{" "}
              Show website
            </label>
          </div>
          <button className="button" disabled={busy}>
            <Save size={16} /> Save branding
          </button>
        </form>
      )}
      <div className="creative-history">
        <h3>Creative Library</h3>
        {items.map((item) => (
          <article key={item.id}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.headline} />
            ) : (
              <div className="creative-image-empty">Content Only</div>
            )}
            <div>
              <span>
                {item.creative_date} ·{" "}
                {item.generation_type === "manual" && item.daily_sequence
                  ? "Creative #" + item.daily_sequence + " · "
                  : ""}
                {item.status === "completed"
                  ? "Completed"
                  : item.content_only
                    ? "Content Only"
                    : item.status}
              </span>
              <h4>{item.headline}</h4>
              <p>{item.caption}</p>
              <p>
                <strong>CTA:</strong> {item.cta}
              </p>
              <p>
                <strong>Hashtags:</strong> {item.hashtags}
              </p>
              {!item.image_url && (
                <p>
                  <strong>Image prompt:</strong> {item.image_prompt}
                </p>
              )}
              {item.failure_code && (
                <small>Last attempt: {item.failure_code}</small>
              )}
              <div>
                {item.image_url && (
                  <>
                    <button
                      className="button button-ghost"
                      onClick={() => setPreview(item)}
                    >
                      <Eye size={15} /> Preview
                    </button>
                    <button
                      className="button button-ghost"
                      onClick={() => download(item)}
                    >
                      <Download size={15} /> Download
                    </button>
                  </>
                )}
                {!item.image_url && (
                  <button
                    className="button button-ghost"
                    onClick={() =>
                      void request(
                        "/api/admin/creatives/" + item.id + "/generate-image",
                        { method: "POST" },
                        "Image generated and saved.",
                      )
                    }
                  >
                    <ImagePlus size={15} /> Generate Image
                  </button>
                )}
                <button
                  className="button button-ghost"
                  onClick={() =>
                    void request(
                      "/api/admin/creatives/" + item.id + "/regenerate",
                      { method: "POST" },
                      "Creative regenerated.",
                    )
                  }
                >
                  <RefreshCw size={15} /> Regenerate
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => void editCaption(item)}
                >
                  Edit Caption
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => void copyCaption(item)}
                >
                  <Copy size={15} /> Copy Caption
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => share(item)}
                >
                  <Send size={15} /> WhatsApp Share
                </button>
                <button
                  className="button button-ghost"
                  onClick={() => {
                    if (window.confirm("Delete this creative?"))
                      void request(
                        "/api/admin/creatives?id=" +
                          encodeURIComponent(item.id),
                        { method: "DELETE" },
                        "Creative deleted.",
                      );
                  }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {!items.length && (
          <p className="admin-empty">
            No creatives yet. Configure branding, then generate a creative.
          </p>
        )}
      </div>
      {preview && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal creative-preview">
            <button
              className="icon-button creative-close"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            <img src={preview.image_url} alt={preview.headline} />
            <h3>{preview.headline}</h3>
            <p>{preview.caption}</p>
            <p>
              <strong>{preview.cta}</strong>
            </p>
            <p>{preview.hashtags}</p>
            <div className="admin-modal-actions">
              <button
                className="button button-ghost"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
              <button className="button" onClick={() => download(preview)}>
                <Download size={15} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
