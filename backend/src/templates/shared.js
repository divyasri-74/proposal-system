// Helpers and section builders shared by every template.
// Every user-supplied value passes through esc() before it touches HTML.

const esc = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const paragraphs = (text = "") =>
  String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

const bulletLines = (text = "") =>
  String(text)
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*\d.)]+\s+/, "").trim())
    .filter(Boolean);

function money(amount, currency = "USD") {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function computeTotals(data) {
  const subtotal = data.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const discountAmount = (subtotal * data.discount) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * data.taxRate) / 100;
  return { subtotal, discountAmount, taxable, taxAmount, total: taxable + taxAmount };
}

function logoImg(data, cls = "logo") {
  return data.company.logo ? `<img class="${cls}" src="${data.company.logo}" alt="">` : "";
}

function contactLines(p) {
  return [p.address, p.email, p.phone, p.website]
    .filter(Boolean)
    .map((l) => `<div>${esc(l)}</div>`)
    .join("");
}

function parties(data) {
  const c = data.company;
  const cl = data.client;
  return `
  <div class="parties">
    <div class="party">
      <div class="label">Prepared by</div>
      <div class="party-name">${esc(c.name)}</div>
      ${contactLines(c)}
    </div>
    <div class="party">
      <div class="label">Prepared for</div>
      <div class="party-name">${esc(cl.name)}</div>
      ${cl.company ? `<div>${esc(cl.company)}</div>` : ""}
      ${contactLines(cl)}
    </div>
  </div>`;
}

function metaRows(data) {
  const p = data.proposal;
  const rows = [];
  if (p.date) rows.push(["Date", fmtDate(p.date)]);
  if (p.validUntil) rows.push(["Valid until", fmtDate(p.validUntil)]);
  rows.push(["Currency", p.currency]);
  return rows.map(([k, v]) => `<div class="meta-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
}

function section(title, body, cls = "") {
  return `<section class="sec ${cls}"><h2 class="sec-title">${esc(title)}</h2>${body}</section>`;
}

function sections(data) {
  const cur = data.proposal.currency;
  const t = computeTotals(data);
  const out = [];

  if (data.description) out.push(section("Project Overview", `<div class="prose">${paragraphs(data.description)}</div>`));

  const scope = bulletLines(data.scope);
  if (scope.length) out.push(section("Scope of Work", `<ul class="scope">${scope.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`));

  const rows = data.items
    .map(
      (i, idx) => `<tr>
        <td class="num">${idx + 1}</td>
        <td>${esc(i.description)}</td>
        <td class="r">${esc(i.qty)}</td>
        <td class="r">${money(i.unitPrice, cur)}</td>
        <td class="r">${money(i.qty * i.unitPrice, cur)}</td>
      </tr>`
    )
    .join("");
  const totals = [
    `<div class="t-row"><span>Subtotal</span><span>${money(t.subtotal, cur)}</span></div>`,
    data.discount > 0 ? `<div class="t-row"><span>Discount (${data.discount}%)</span><span>− ${money(t.discountAmount, cur)}</span></div>` : "",
    data.taxRate > 0 ? `<div class="t-row"><span>Tax (${data.taxRate}%)</span><span>${money(t.taxAmount, cur)}</span></div>` : "",
    `<div class="t-row grand"><span>Total</span><span>${money(t.total, cur)}</span></div>`,
  ].join("");
  out.push(
    section(
      "Investment & Cost Breakdown",
      `<table class="items">
        <thead><tr><th class="num">#</th><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">${totals}</div>`,
      "keep" // keep the cost table and totals on one page whenever they fit
    )
  );

  if (data.timeline.length) {
    const tl = data.timeline
      .map(
        (p, i) => `<div class="tl-item">
          <div class="tl-marker">${i + 1}</div>
          <div class="tl-body">
            <div class="tl-head"><span class="tl-phase">${esc(p.phase)}</span>${p.duration ? `<span class="tl-dur">${esc(p.duration)}</span>` : ""}</div>
            ${p.details ? `<div class="tl-details">${esc(p.details)}</div>` : ""}
          </div>
        </div>`
      )
      .join("");
    out.push(section("Project Timeline", `<div class="timeline">${tl}</div>`));
  }

  const terms = bulletLines(data.terms);
  if (terms.length) out.push(section("Terms & Conditions", `<ol class="terms">${terms.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`));

  out.push(
    `<section class="sec sign">
      <h2 class="sec-title">Acceptance</h2>
      <p class="sign-note">By signing below, ${esc(data.client.company || data.client.name)} accepts this proposal and the terms above.</p>
      <div class="sign-grid">
        <div><div class="line"></div><div class="sign-cap">${esc(data.company.name)}<br><span>Authorised signature &amp; date</span></div></div>
        <div><div class="line"></div><div class="sign-cap">${esc(data.client.name)}<br><span>Client signature &amp; date</span></div></div>
      </div>
    </section>`
  );

  return out.join("\n");
}

// Rules every template needs for good pagination and screen preview.
const BASE_CSS = `
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;color:var(--ink);font-size:10.5pt;line-height:1.55}
  img.logo{display:block;max-height:56px;max-width:170px;object-fit:contain}
  table{border-collapse:collapse;width:100%}
  tr,.tl-item,.sign,.party,.totals,.t-row{break-inside:avoid}
  .sec-title{break-after:avoid}
  .sec.keep{break-inside:avoid}
  .r{text-align:right}
  .prose p{margin:0 0 .7em}
  .scope,.terms{margin:0;padding-left:1.25em}
  .scope li,.terms li{margin:0 0 .35em}
  .totals{margin-left:auto;width:55%;margin-top:10px}
  .t-row{display:flex;justify-content:space-between;padding:5px 0}
  .sign-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:44px}
  .sign .line{border-bottom:1px solid var(--ink);height:1px}
  .sign-cap{font-size:9pt;margin-top:6px}
  .sign-cap span{color:var(--muted)}
  .sign-note{color:var(--muted);margin:0}
  @page{size:A4}
  @media screen{
    html{background:#e9ecf1}
    body{max-width:210mm;min-height:297mm;margin:0 auto;padding:16mm;background:#fff;box-shadow:0 2px 14px rgba(15,23,42,.15)}
  }
`;

function documentShell({ title, accent, css, body }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>:root{--accent:${accent}}${BASE_CSS}${css}</style></head>
<body>${body}</body></html>`;
}

module.exports = { esc, paragraphs, money, fmtDate, computeTotals, logoImg, parties, metaRows, sections, documentShell };
