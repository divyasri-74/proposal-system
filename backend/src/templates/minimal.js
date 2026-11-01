// Template 3 — MINIMAL: airy, monochrome, hairline rules, one small accent. Left-aligned editorial layout.
const { esc, logoImg, parties, metaRows, sections, documentShell } = require("./shared");

const css = `
  :root{--ink:#18181b;--muted:#71717a;--line:#e4e4e7}
  body{font-family:"Helvetica Neue",Helvetica,"Liberation Sans",Arial,sans-serif;font-size:10pt;line-height:1.65}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:64px}
  .top .logo{max-height:40px}
  .top-name{font-size:9pt;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
  .kicker{font-size:8.5pt;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
  h1{font-size:30pt;line-height:1.1;font-weight:300;letter-spacing:-.5px;margin:0 0 26px;max-width:88%}
  .meta{display:flex;gap:34px;font-size:9pt;border-top:1px solid var(--line);padding-top:12px}
  .meta-row{display:flex;flex-direction:column}
  .meta-row span{color:var(--muted);font-size:8pt;text-transform:uppercase;letter-spacing:1.5px}
  .meta-row strong{font-weight:500}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin:46px 0 40px;font-size:9.5pt;color:var(--muted)}
  .party .label{font-size:8pt;text-transform:uppercase;letter-spacing:2px;color:var(--ink);margin-bottom:6px}
  .party-name{font-size:11pt;color:var(--ink);font-weight:500}
  .sec{display:grid;grid-template-columns:150px 1fr;gap:24px;padding-top:18px;border-top:1px solid var(--line);margin-bottom:28px;break-inside:auto}
  .sec-title{font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;color:var(--muted);font-weight:500;margin:3px 0 0}
  .sec>*:not(.sec-title){grid-column:2}
  .scope,.terms{padding-left:1.1em}
  .scope li::marker,.terms li::marker{color:var(--accent)}
  .items th{text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);font-weight:500;padding:0 6px 8px;border-bottom:1px solid var(--ink)}
  .items th.r{text-align:right}
  .items td{padding:9px 6px;border-bottom:1px solid var(--line);vertical-align:top}
  .items .num{width:24px;color:var(--muted)}
  .totals{width:70%}
  .t-row{color:var(--muted)}
  .t-row.grand{color:var(--ink);font-size:14pt;font-weight:500;border-top:1px solid var(--ink);margin-top:6px;padding-top:9px}
  .timeline{border-left:1px solid var(--line)}
  .tl-item{display:flex;padding:0 0 12px 16px;position:relative}
  .tl-item:before{content:"";position:absolute;left:-4px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--accent)}
  .tl-marker{display:none}
  .tl-body{flex:1}.tl-head{display:flex;justify-content:space-between;font-weight:500}
  .tl-dur{color:var(--accent);font-weight:400;font-size:9pt}
  .tl-details{color:var(--muted);font-size:9.5pt}
  .sign{grid-template-columns:150px 1fr}
  .sign-grid{margin-top:40px}
`;

module.exports = function render(data) {
  const body = `
    <div class="top">
      ${logoImg(data) || `<div></div>`}
      <div class="top-name">${esc(data.company.name)}</div>
    </div>
    <div class="kicker">Proposal · ${esc(data.client.company || data.client.name)}</div>
    <h1>${esc(data.proposal.title)}</h1>
    <div class="meta">${metaRows(data)}</div>
    ${parties(data)}
    ${sections(data)}`;
  return documentShell({ title: data.proposal.title, accent: data.proposal.accentColor || "#0f766e", css, body });
};
