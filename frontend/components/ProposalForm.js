"use client";
import { useState } from "react";
import TemplatePicker from "./TemplatePicker";
import { CURRENCIES } from "../lib/defaults";
import { fileToLogoDataUrl } from "../lib/image";

function Field({ label, required, children, wide }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>
        {label}
        {required && <em> *</em>}
      </span>
      {children}
    </label>
  );
}

function Card({ title, hint, children }) {
  return (
    <section className="card">
      <header>
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export default function ProposalForm({ data, setData }) {
  const [logoError, setLogoError] = useState("");
  const update = (fn) =>
    setData((d) => {
      const n = structuredClone(d);
      fn(n);
      return n;
    });
  const bind = (path) => {
    const keys = path.split(".");
    const get = () => keys.reduce((o, k) => o[k], data);
    return {
      value: get() ?? "",
      onChange: (e) =>
        update((n) => {
          const last = keys.pop();
          keys.reduce((o, k) => o[k], n)[last] = e.target.value;
        }),
    };
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLogoError("");
      const url = await fileToLogoDataUrl(file);
      update((n) => void (n.company.logo = url));
    } catch (err) {
      setLogoError(err.message);
    }
    e.target.value = "";
  };

  const subtotal = data.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const afterDiscount = subtotal * (1 - (Number(data.discount) || 0) / 100);
  const total = afterDiscount * (1 + (Number(data.taxRate) || 0) / 100);
  const fmt = (n) =>
    new Intl.NumberFormat(data.proposal.currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: data.proposal.currency,
    }).format(n);

  return (
    <div className="form">
      <Card title="1 · Choose a template" hint="You can switch at any time — your content is kept.">
        <TemplatePicker
          value={data.template}
          accent={data.proposal.accentColor}
          onChange={(id) => update((n) => void (n.template = id))}
        />
        <div className="grid">
          <Field label="Accent colour">
            <div className="color-row">
              <input type="color" {...bind("proposal.accentColor")} />
              <input type="text" {...bind("proposal.accentColor")} maxLength={7} />
            </div>
          </Field>
        </div>
      </Card>

      <Card title="2 · Your company">
        <div className="grid">
          <Field label="Company name" required><input {...bind("company.name")} placeholder="Acme Studio" /></Field>
          <Field label="Logo">
            <div className="logo-row">
              {data.company.logo ? <img src={data.company.logo} alt="Logo preview" /> : <div className="logo-ph">No logo</div>}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogo} />
              {data.company.logo && (
                <button type="button" className="link" onClick={() => update((n) => void (n.company.logo = ""))}>
                  Remove
                </button>
              )}
            </div>
            {logoError && <small className="err">{logoError}</small>}
          </Field>
          <Field label="Email"><input type="email" {...bind("company.email")} /></Field>
          <Field label="Phone"><input {...bind("company.phone")} /></Field>
          <Field label="Website"><input {...bind("company.website")} /></Field>
          <Field label="Address"><input {...bind("company.address")} /></Field>
        </div>
      </Card>

      <Card title="3 · Client details">
        <div className="grid">
          <Field label="Contact name" required><input {...bind("client.name")} /></Field>
          <Field label="Client company"><input {...bind("client.company")} /></Field>
          <Field label="Email"><input type="email" {...bind("client.email")} /></Field>
          <Field label="Phone"><input {...bind("client.phone")} /></Field>
          <Field label="Address" wide><input {...bind("client.address")} /></Field>
        </div>
      </Card>

      <Card title="4 · Project">
        <div className="grid">
          <Field label="Proposal title" required wide><input {...bind("proposal.title")} placeholder="Website redesign & development" /></Field>
          <Field label="Date"><input type="date" {...bind("proposal.date")} /></Field>
          <Field label="Valid until"><input type="date" {...bind("proposal.validUntil")} /></Field>
          <Field label="Currency">
            <select {...bind("proposal.currency")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Project description" wide>
            <textarea rows={5} {...bind("description")} placeholder="Describe the goals and your approach. Blank line = new paragraph." />
          </Field>
          <Field label="Scope of work (one item per line)" wide>
            <textarea rows={5} {...bind("scope")} placeholder={"Wireframes and UX flows\nResponsive build\nTesting and launch"} />
          </Field>
        </div>
      </Card>

      <Card title="5 · Pricing" hint="Rows with an empty description are ignored.">
        <div className="rows">
          <div className="row head"><span>Description</span><span>Qty</span><span>Unit price</span><span /></div>
          {data.items.map((item, i) => (
            <div className="row" key={i}>
              <input placeholder="Service or deliverable" {...bind(`items.${i}.description`)} />
              <input type="number" min="0" step="any" {...bind(`items.${i}.qty`)} />
              <input type="number" min="0" step="any" placeholder="0.00" {...bind(`items.${i}.unitPrice`)} />
              <button type="button" className="icon" aria-label="Remove row" disabled={data.items.length === 1}
                onClick={() => update((n) => void n.items.splice(i, 1))}>×</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn ghost" onClick={() => update((n) => void n.items.push({ description: "", qty: "1", unitPrice: "" }))}>
          + Add item
        </button>
        <div className="grid">
          <Field label="Discount (%)"><input type="number" min="0" max="100" step="any" {...bind("discount")} /></Field>
          <Field label="Tax (%)"><input type="number" min="0" max="100" step="any" {...bind("taxRate")} /></Field>
        </div>
        <div className="total-bar"><span>Estimated total</span><strong>{fmt(total)}</strong></div>
      </Card>

      <Card title="6 · Timeline">
        <div className="rows">
          {data.timeline.map((t, i) => (
            <div className="tl-row" key={i}>
              <input placeholder="Phase name" {...bind(`timeline.${i}.phase`)} />
              <input placeholder="Duration (e.g. 3 weeks)" {...bind(`timeline.${i}.duration`)} />
              <button type="button" className="icon" aria-label="Remove phase"
                onClick={() => update((n) => void n.timeline.splice(i, 1))}>×</button>
              <input className="full" placeholder="What happens in this phase" {...bind(`timeline.${i}.details`)} />
            </div>
          ))}
        </div>
        <button type="button" className="btn ghost" onClick={() => update((n) => void n.timeline.push({ phase: "", duration: "", details: "" }))}>
          + Add phase
        </button>
      </Card>

      <Card title="7 · Terms & conditions" hint="One term per line — they are numbered automatically.">
        <textarea rows={6} {...bind("terms")} placeholder={"50% payment upfront, 50% on delivery\nChanges outside scope are quoted separately"} />
      </Card>
    </div>
  );
}
