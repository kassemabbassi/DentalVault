import { ZoomIn, X, ChevronLeft, ChevronRight, Scan, FileText, Mic, FileImage } from "lucide-react";

type AttachmentItem = {
  type: string;
  name: string;
  date: string;
  url?: string;
  size?: string;
};

const TYPE_META: Record<string, {
  label: string; color: string; bg: string; border: string; icon: React.ReactNode;
}> = {
  xray: {
    label: "Radiographie", color: "#38bdf8",
    bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.25)",
    icon: <Scan className="w-4 h-4" />,
  },
  image: {
    label: "Photo clinique", color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)",
    icon: <FileImage className="w-4 h-4" />,
  },
  audio: {
    label: "Note vocale", color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)",
    icon: <Mic className="w-4 h-4" />,
  },
  report: {
    label: "Rapport", color: "#34d399",
    bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)",
    icon: <FileText className="w-4 h-4" />,
  },
};
const getMeta = (t: string) => TYPE_META[t] ?? TYPE_META["image"];

function Thumbnail({ attachment }: { attachment: AttachmentItem }) {
  const imgUrl = attachment.url ?? "";
  const meta = getMeta(attachment.type);

  if (attachment.type === "audio") {
    return (
      <div style={{
        width: "100%", height: 180, borderRadius: 10,
        background: "rgba(124,58,237,0.06)",
        border: "1px solid rgba(124,58,237,0.15)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#a78bfa",
        }}>
          <Mic style={{ width: 18, height: 18 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 28 }}>
          {[5,9,14,8,18,11,7,15,9,6,13,7,11,17,9,7,13,5,9,11].map((h, i) => (
            <div key={i} style={{
              width: 3, height: h, borderRadius: 2,
              background: `rgba(167,139,250,${0.25 + (h / 18) * 0.65})`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (imgUrl) {
    return (
      <div style={{
        width: "100%", height: 180, borderRadius: 10,
        overflow: "hidden", position: "relative",
      }}>
        <img
          src={imgUrl}
          alt={attachment.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)",
        }} />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: 180, borderRadius: 10,
      background: meta.bg, border: `1px solid ${meta.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ color: meta.color, opacity: 0.4, transform: "scale(2.8)" }}>
        {meta.icon}
      </div>
    </div>
  );
}

function LightboxContent({ attachment }: { attachment: AttachmentItem }) {
  const imgUrl = attachment.url ?? "";
  const meta = getMeta(attachment.type);

  if (attachment.type === "audio") {
    return (
      <div style={{
        width: "100%", minHeight: 280,
        background: "rgba(124,58,237,0.05)",
        border: "1px solid rgba(124,58,237,0.15)",
        borderRadius: 14,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#a78bfa",
        }}>
          <Mic style={{ width: 28, height: 28 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 52 }}>
          {[5,10,16,9,22,13,8,19,11,7,16,8,13,20,11,8,17,6,11,14,8,18,10,7,15,9,13,19,11,7,17,5,12,20,9,8,16,7,10,13].map((h, i) => (
            <div key={i} style={{
              width: 4, height: h, borderRadius: 2,
              background: `rgba(167,139,250,${0.2 + (h / 22) * 0.7})`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={attachment.name}
        style={{
          width: "100%", maxHeight: "62vh",
          objectFit: "contain", borderRadius: 12, display: "block",
        }}
      />
    );
  }

  return (
    <div style={{
      width: "100%", height: 280, borderRadius: 14,
      background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ color: meta.color, opacity: 0.3, transform: "scale(4)" }}>{meta.icon}</div>
    </div>
  );
}

export function AttachmentsGrid({
  attachments,
  lightboxIndex,
  setLightboxIndex,
}: {
  attachments: AttachmentItem[];
  lightboxIndex: number | null;
  setLightboxIndex: (i: number | null) => void;
}) {
  const total = attachments.length;
  const prev = () => setLightboxIndex(lightboxIndex !== null ? (lightboxIndex - 1 + total) % total : null);
  const next = () => setLightboxIndex(lightboxIndex !== null ? (lightboxIndex + 1) % total : null);

  return (
    <>
      <style>{`
        .att-card {
          border-radius: 16px;
          border: 1px solid var(--color-border-tertiary, rgba(55,138,221,0.13));
          background: var(--color-background-secondary);
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .att-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(24,95,165,0.14);
          border-color: rgba(55,138,221,0.4);
        }
        .att-zoom-hint {
          position: absolute; inset: 0; border-radius: 16px;
          background: rgba(5,12,30,0.46);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .att-card:hover .att-zoom-hint { opacity: 1; }
        .lb-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(3,7,20,0.93);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          animation: lbFade 0.18s ease;
        }
        @keyframes lbFade { from{opacity:0} to{opacity:1} }
        .lb-panel {
          background: #050e1c;
          border: 1px solid rgba(55,138,221,0.18);
          border-radius: 22px;
          width: min(740px, 93vw);
          overflow: hidden;
          animation: lbPop 0.2s ease;
        }
        @keyframes lbPop { from{transform:scale(0.94);opacity:0} to{transform:scale(1);opacity:1} }
        .lb-arrow {
          position: fixed; top: 50%; transform: translateY(-50%);
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(14,60,130,0.4);
          border: 1px solid rgba(55,138,221,0.3);
          color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; z-index: 10000;
        }
        .lb-arrow:hover { background: rgba(24,95,165,0.65); }
      `}</style>

      {/* GRILLE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
      }}>
        {attachments.map((a, i) => {
          const meta = getMeta(a.type);
          return (
            <div key={i} className="att-card" onClick={() => setLightboxIndex(i)}>
              <div style={{ padding: "10px 10px 0" }}>
                <Thumbnail attachment={a} />
              </div>

              <div className="att-zoom-hint">
                <div style={{
                  background: "rgba(4,12,30,0.82)",
                  border: "1px solid rgba(55,138,221,0.35)",
                  borderRadius: 10, padding: "5px 13px",
                  display: "flex", alignItems: "center", gap: 6,
                  color: "white", fontSize: 12, fontWeight: 500,
                }}>
                  <ZoomIn style={{ width: 13, height: 13 }} /> Agrandir
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "8px 10px 10px" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  borderRadius: 7, padding: "2px 8px",
                  color: meta.color, fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.3px", marginBottom: 6,
                }}>
                  <span style={{ display: "flex", width: 12, height: 12 }}>{meta.icon}</span>
                  {meta.label}
                </div>
                <p style={{
                  margin: 0, fontSize: 12, fontWeight: 600,
                  color: "var(--color-text-primary)",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "1.4",
                }}>{a.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-secondary)" }}>
                  {a.date}{a.size ? ` · ${a.size}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (() => {
        const a = attachments[lightboxIndex];
        const meta = getMeta(a.type);
        return (
          <>
            <div className="lb-backdrop" onClick={() => setLightboxIndex(null)}>
              <div className="lb-panel" onClick={e => e.stopPropagation()}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(55,138,221,0.1)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: meta.bg, border: `1px solid ${meta.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: meta.color,
                    }}>{meta.icon}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#cde3f6" }}>{a.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#3d6080" }}>{meta.label} · {a.date}</p>
                    </div>
                  </div>
                  <button onClick={() => setLightboxIndex(null)} style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 8, padding: "6px 12px",
                    color: "#7a8fa0", cursor: "pointer", fontSize: 12,
                    display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit",
                  }}>
                    <X style={{ width: 13, height: 13 }} /> Fermer
                  </button>
                </div>

                <div style={{ padding: "18px 20px" }}>
                  <LightboxContent attachment={a} />
                </div>

                <div style={{
                  padding: "10px 18px 16px",
                  borderTop: "1px solid rgba(55,138,221,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {attachments.map((_, i) => (
                    <div key={i} onClick={() => setLightboxIndex(i)} style={{
                      width: i === lightboxIndex ? 22 : 6, height: 6, borderRadius: 3,
                      background: i === lightboxIndex ? "#378ADD" : "rgba(55,138,221,0.2)",
                      cursor: "pointer", transition: "all 0.2s",
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {total > 1 && (
              <>
                <button className="lb-arrow" style={{ left: "calc(50% - 395px)" }}
                  onClick={e => { e.stopPropagation(); prev(); }}>
                  <ChevronLeft style={{ width: 20, height: 20 }} />
                </button>
                <button className="lb-arrow" style={{ right: "calc(50% - 395px)" }}
                  onClick={e => { e.stopPropagation(); next(); }}>
                  <ChevronRight style={{ width: 20, height: 20 }} />
                </button>
              </>
            )}
          </>
        );
      })()}
    </>
  );
}