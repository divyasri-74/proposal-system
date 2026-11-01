export const TEMPLATES = [
  { id: "classic", name: "Classic", blurb: "Formal serif letterhead, ruled tables", accent: "#1e3a5f" },
  { id: "modern", name: "Modern", blurb: "Gradient cover, numbered sections", accent: "#4f46e5" },
  { id: "minimal", name: "Minimal", blurb: "Airy editorial layout, hairlines", accent: "#0f766e" },
];

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "AED", "SGD"];

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const emptyProposal = () => ({
  template: "classic",
  company: { name: "", logo: "", email: "", phone: "", address: "", website: "" },
  client: { name: "", company: "", email: "", phone: "", address: "" },
  proposal: { title: "", date: today(), validUntil: inDays(30), currency: "USD", accentColor: "#1e3a5f" },
  description: "",
  scope: "",
  items: [{ description: "", qty: "1", unitPrice: "" }],
  taxRate: "0",
  discount: "0",
  timeline: [{ phase: "", duration: "", details: "" }],
  terms: "",
});

// Form state keeps numbers as strings (so inputs can be cleared); convert before sending.
export function toPayload(d) {
  const num = (v, fallback = 0) => (v === "" || v == null || Number.isNaN(Number(v)) ? fallback : Number(v));
  return {
    ...d,
    items: d.items
      .filter((i) => i.description.trim())
      .map((i) => ({ description: i.description, qty: num(i.qty, 1), unitPrice: num(i.unitPrice) })),
    timeline: d.timeline.filter((t) => t.phase.trim()),
    taxRate: num(d.taxRate),
    discount: num(d.discount),
  };
}

// API sample (numbers) -> form state (strings)
export function fromApi(s) {
  return {
    ...s,
    items: s.items.map((i) => ({ ...i, qty: String(i.qty), unitPrice: String(i.unitPrice) })),
    taxRate: String(s.taxRate),
    discount: String(s.discount),
  };
}
