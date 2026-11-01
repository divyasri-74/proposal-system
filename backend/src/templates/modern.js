// Template 2 — MODERN: bold gradient hero, numbered sections, card layout, vertical timeline.
const { esc, logoImg, parties, metaRows, sections, documentShell } = require("./shared");

const css = `
  :root{--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--soft:#f3f4f8}
  body{font-family:"Inter","Helvetica Neue",Helvetica,"Liberation Sans",Arial,sans-serif}
  .hero{background:linear-gradient(135deg,var(--accent),#0f172a);color:#fff;border-radius:14px;padding:26px 28px;position:relative;overflow:hidden}
  .hero:after{content:"";position:absolute;right:-50px;top:-50px;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.09)}
  .hero-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:34px;position:relative;z-index:1}
  .hero .logo{background:#fff;padding:6px 8px;border-radius:8px}
  .hero-company{font-weight:700;letter-spacing:.4px}
  .eyebrow{font-size:8.5pt;text-transform:uppercase;letter-spacing:3px;opacity:.75;position:relative;z-index:1}
  .hero h1{font-size:25pt;line-height:1.15;margin:6px 0 16px;max-width:85%;position:relative;z-index:1}
  .meta{display:flex;gap:22px;font-size:9pt;position:relative;z-index:1}
  .meta-row{display:flex;flex-direction:column}.meta-row span{opacity:.7;font-size:8pt;text-transform:uppercase;letter-spacing:1px}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0 26px;font-size:9.5pt;color:var(--muted)}
  .party{background:var(--soft);border-radius:12px;padding:14px 16px;border-left:4px solid var(--accent)}
  .party .label{font-size:8pt;text-transform:uppercase;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:4px}
  .party-name{font-size:11.5pt;color:var(--ink);font-weight:700}
  body{counter-reset:sec}
  .sec{margin-bottom:26px}
  .sec-title{display:flex;align-items:center;gap:10px;font-size:14pt;margin:0 0 12px}
  .sec-title:before{counter-increment:sec;content:counter(sec,decimal-leading-zero);background:var(--accent);color:#fff;font-size:9pt;border-radius:6px;padding:3px 7px}
  .scope{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .scope li{margin:0;background:var(--soft);border-radius:8px;padding:8px 10px 8px 28px;position:relative;font-size:9.8pt}
  .scope li:before{content:"✓";position:absolute;left:10px;color:var(--accent);font-weight:700}
  .items th{text-align:left;font-size:8.5pt;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:8px;border-bottom:2px solid var(--ink)}
  .items th.r{text-align:right}
  .items td{padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  .items .num{width:26px;color:var(--muted)}
  .totals{background:var(--soft);border-radius:12px;padding:10px 16px}
  .t-row.grand{border-top:1px solid #cbd0da;margin-top:4px;padding-top:9px;font-size:13pt;font-weight:700;color:var(--accent)}
  .timeline{position:relative;padding-left:6px}
  .timeline:before{content:"";position:absolute;left:19px;top:8px;bottom:8px;width:2px;background:var(--line)}
  .tl-item{display:flex;gap:14px;padding:0 0 14px;position:relative}
  .tl-marker{width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:9pt;display:flex;align-items:center;justify-content:center;flex:none;z-index:1;border:3px solid #fff}
  .tl-body{flex:1;padding-top:2px}.tl-head{display:flex;justify-content:space-between;align-items:center;font-weight:700}
  .tl-dur{font-weight:600;font-size:8.5pt;background:var(--soft);color:var(--accent);padding:2px 9px;border-radius:99px}
  .tl-details{color:var(--muted);font-size:9.8pt;margin-top:2px}
  .terms{color:#374151;font-size:9.8pt}
`;

module.exports = function render(data) {
  const body = `
    <header class="hero">
      <div class="hero-top">
        ${logoImg(data)}
        <div class="hero-company">${esc(data.company.name)}</div>
      </div>
      <div class="eyebrow">Proposal for ${esc(data.client.company || data.client.name)}</div>
      <h1>${esc(data.proposal.title)}</h1>
      <div class="meta">${metaRows(data)}</div>
    </header>
    ${parties(data)}
    ${sections(data)}`;
  return documentShell({ title: data.proposal.title, accent: data.proposal.accentColor || "#4f46e5", css, body });
};
