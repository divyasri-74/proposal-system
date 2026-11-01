// Sample payload used by GET /api/sample, the "Load sample data" button and the samples script.
// A small inline SVG stands in for a company logo.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#1d4ed8"/>
  <path d="M32 82V38h26c13 0 21 7 21 18s-8 18-21 18H46v8z" fill="#fff"/>
  <circle cx="84" cy="80" r="9" fill="#93c5fd"/>
</svg>`;

const sample = {
  template: "classic",
  company: {
    name: "Northwind Digital Studio",
    logo: "data:image/svg+xml;base64," + Buffer.from(logoSvg).toString("base64"),
    email: "hello@northwind.studio",
    phone: "+91 98765 43210",
    address: "21 Cyber Towers, HITEC City, Hyderabad 500081, India",
    website: "www.northwind.studio",
  },
  client: {
    name: "Priya Raman",
    company: "Lakeview Retail Pvt. Ltd.",
    email: "priya.raman@lakeview.example",
    phone: "+91 90000 11122",
    address: "88 Residency Road, Bengaluru 560025, India",
  },
  proposal: {
    title: "E-commerce Platform Redesign & Mobile App",
    date: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency: "INR",
    accentColor: "#1d4ed8",
  },
  description:
    "Lakeview Retail wants to modernise its online store to increase conversion and give customers a fast, reliable mobile experience.\n\nNorthwind Digital Studio proposes a full redesign of the storefront, a new headless commerce back end, and a companion mobile app for iOS and Android, delivered in four focused phases.",
  scope:
    "User research and competitor audit\nUX flows, wireframes and a design system\nResponsive storefront built with Next.js\nHeadless commerce API with inventory and order management\nPayment gateway and shipping integrations\nNative-feeling mobile app (iOS and Android)\nAnalytics dashboard and SEO setup\nTraining and 60 days of post-launch support",
  items: [
    { description: "Discovery, research & UX design", qty: 1, unitPrice: 180000 },
    { description: "Storefront development (Next.js)", qty: 1, unitPrice: 320000 },
    { description: "Headless commerce API & admin", qty: 1, unitPrice: 260000 },
    { description: "Mobile app (iOS + Android)", qty: 1, unitPrice: 420000 },
    { description: "QA, launch & 60-day support (per month)", qty: 2, unitPrice: 45000 },
  ],
  taxRate: 18,
  discount: 5,
  timeline: [
    { phase: "Phase 1 · Discovery & Design", duration: "3 weeks", details: "Research, wireframes, visual design system and clickable prototype." },
    { phase: "Phase 2 · Core Build", duration: "6 weeks", details: "Storefront, commerce API, admin panel and payment integrations." },
    { phase: "Phase 3 · Mobile App", duration: "5 weeks", details: "iOS and Android apps, push notifications and offline cart." },
    { phase: "Phase 4 · QA & Launch", duration: "2 weeks", details: "Load testing, UAT, deployment, training and hand-over." },
  ],
  terms:
    "Payment schedule: 30% on signing, 40% on completion of Phase 2, 30% on launch.\nThis proposal is valid until the date shown above.\nChanges to the agreed scope will be estimated and approved in writing before work begins.\nThe client receives full ownership of the deliverables on receipt of final payment.\nBoth parties agree to keep project information confidential.\nGST is charged as applicable and shown separately in the pricing summary.",
};

module.exports = { sample };
