// Template 1 — CLASSIC: formal serif letterhead, ruled tables, restrained navy palette.
const { esc, logoImg, parties, metaRows, sections, documentShell } = require("./shared");

const css = `
  :root{--ink:#1f2430;--muted:#667085;--line:#d5d9e0}
  body{font-family:"Georgia","Liberation Serif","Times New Roman",serif}
  .letterhead{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:3px double var(--accent)}
  .brand{display:flex;align-items:center;gap:14px}
  .brand-name{font-size:17pt;font-weight:bold;color:var(--accent);letter-spacing:.2px}
  .doc-tag{font-size:9pt;text-transform:uppercase;letter-spacing:3px;color:var(--muted)}
  .title-block{text-align:center;margin:30px 0 22px}
  .title-block h1{font-size:23pt;line-height:1.2;margin:0 0 8px;font-weight:normal}
  .title-block .sub{color:var(--muted);font-style:italic}
  .meta{display:flex;justify-content:center;gap:28px;font-size:9.5pt;color:var(--muted);margin-top:10px}
  .meta-row{display:flex;gap:6px}.meta-row strong{color:var(--ink);font-weight:normal}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:28px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 0;margin-bottom:26px;font-size:9.5pt;color:var(--muted)}
  .party .label{font-size:8pt;text-transform:uppercase;letter-spacing:2px;color:var(--accent);margin-bottom:4px}
  .party-name{font-size:11.5pt;color:var(--ink);font-weight:bold}
  .sec{margin-bottom:24px}
  .sec-title{font-size:13pt;color:var(--accent);margin:0 0 10px;padding-bottom:4px;border-bottom:1px solid var(--accent);font-variant:small-caps;letter-spacing:1px}
  .items th{background:var(--accent);color:#fff;font-weight:normal;text-align:left;padding:7px 8px;font-size:9.5pt}
  .items th.r{text-align:right}
  .items td{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  .items .num{width:28px;color:var(--muted)}
  .t-row{border-bottom:1px dotted var(--line)}
  .t-row.grand{border-bottom:0;border-top:2px solid var(--accent);font-weight:bold;font-size:12pt;color:var(--accent);margin-top:4px;padding-top:8px}
  .timeline{border:1px solid var(--line)}
  .tl-item{display:flex;gap:12px;padding:9px 12px;border-bottom:1px solid var(--line)}
  .tl-item:last-child{border-bottom:0}
  .tl-marker{font-weight:bold;color:var(--accent);width:18px}
  .tl-body{flex:1}.tl-head{display:flex;justify-content:space-between;font-weight:bold}
  .tl-dur{color:var(--accent);font-weight:normal;font-style:italic}
  .tl-details{color:var(--muted);font-size:9.8pt}
`;

module.exports = function render(data) {
  const body = `
    <header class="letterhead">
      <div class="brand">${logoImg(data)}<div class="brand-name">${esc(data.company.name)}</div></div>
      <div class="doc-tag">Business Proposal</div>
    </header>
    <div class="title-block">
      <h1>${esc(data.proposal.title)}</h1>
      <div class="sub">Submitted to ${esc(data.client.company || data.client.name)}</div>
      <div class="meta">${metaRows(data)}</div>
    </div>
    ${parties(data)}
    ${sections(data)}`;
  return documentShell({ title: data.proposal.title, accent: data.proposal.accentColor || "#1e3a5f", css, body });
};
