"use client";
import { useEffect, useRef, useState } from "react";
import ProposalForm from "../components/ProposalForm";
import Preview from "../components/Preview";
import { emptyProposal, toPayload, fromApi } from "../lib/defaults";
import { fetchPdf, fetchPreview, fetchSample, wakeServer } from "../lib/api";

// The API requires a few fields; don't spam the server (or the user) until they exist.
const isReady = (p) => p.company.name.trim() && p.client.name.trim() && p.proposal.title.trim() && p.items.length > 0;

export default function Home() {
  const [data, setData] = useState(emptyProposal);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [tab, setTab] = useState("edit"); // mobile only
  const [serverUp, setServerUp] = useState(null);
  const abortRef = useRef(null);

  // Wake the (possibly sleeping) free-tier backend as soon as the page opens.
  useEffect(() => {
    wakeServer().then(setServerUp);
  }, []);

  // Debounced live preview.
  useEffect(() => {
    const payload = toPayload(data);
    if (!isReady(payload)) {
      setHtml("");
      setPreviewError("");
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        setHtml(await fetchPreview(payload, ctrl.signal));
        setPreviewError("");
        setServerUp(true);
      } catch (err) {
        if (err.name === "AbortError") return;
        setPreviewError(err.message);
      } finally {
        if (abortRef.current === ctrl) setLoading(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [data]);

  const download = async () => {
    setDownloadError("");
    const payload = toPayload(data);
    if (!isReady(payload)) {
      setDownloadError("Please fill in company name, client name, proposal title and at least one price item.");
      return;
    }
    setDownloading(true);
    try {
      const { blob, filename } = await fetchPdf(payload);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const loadSample = async () => {
    try {
      const s = fromApi(await fetchSample());
      setData((d) => ({ ...s, template: d.template }));
    } catch (err) {
      setDownloadError(err.message);
    }
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="logo-mark">P</span>
          <div>
            <h1>Proposal Studio</h1>
            <small>
              {serverUp === null ? "Connecting to server…" : serverUp ? "Server online" : "Server waking up — first request can take ~30s"}
            </small>
          </div>
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={loadSample}>Load sample data</button>
          <button type="button" className="btn ghost" onClick={() => confirm("Clear the whole form?") && setData(emptyProposal())}>Reset</button>
          <button type="button" className="btn primary" onClick={download} disabled={downloading}>
            {downloading ? "Generating PDF…" : "Download PDF"}
          </button>
        </div>
      </header>
      {downloadError && <pre className="error-box banner">{downloadError}</pre>}

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "edit"} className={tab === "edit" ? "on" : ""} onClick={() => setTab("edit")}>Edit</button>
        <button role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? "on" : ""} onClick={() => setTab("preview")}>Preview</button>
      </div>

      <div className="layout">
        <div className={`pane ${tab === "edit" ? "show" : ""}`}>
          <ProposalForm data={data} setData={setData} />
        </div>
        <div className={`pane sticky ${tab === "preview" ? "show" : ""}`}>
          <Preview html={html} loading={loading} error={previewError} />
        </div>
      </div>
    </main>
  );
}
