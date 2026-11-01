"use client";
import { useEffect, useRef, useState } from "react";

const PAGE_PX = 794; // A4 width at 96dpi

export default function Preview({ html, loading, error }) {
  const wrap = useRef(null);
  const frame = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PAGE_PX)));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const measure = () => {
    try {
      const doc = frame.current.contentDocument;
      setHeight(Math.max(1123, doc.documentElement.scrollHeight));
    } catch {}
  };

  return (
    <div className="preview">
      <div className="preview-bar">
        <span>Live preview</span>
        <span className={`pill ${error ? "bad" : loading ? "busy" : "ok"}`}>
          {error ? "Needs attention" : loading ? "Updating…" : "Up to date"}
        </span>
      </div>
      {error && <pre className="error-box">{error}</pre>}
      <div ref={wrap} className="preview-stage">
        {html ? (
          <div style={{ height: height * scale, overflow: "hidden" }}>
            <iframe
              ref={frame}
              title="Proposal preview"
              srcDoc={html}
              sandbox="allow-same-origin"
              onLoad={measure}
              style={{ width: PAGE_PX, height, border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
            />
          </div>
        ) : (
          <div className="empty">Fill in the required fields (company, client, title, one price item) to see your proposal here.</div>
        )}
      </div>
      <p className="hint">Preview shows one continuous page; the PDF paginates automatically and adds page numbers.</p>
    </div>
  );
}
