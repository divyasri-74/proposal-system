const { z } = require("zod");

const TEMPLATE_IDS = ["classic", "modern", "minimal"];

// Data-URL images only (PNG / JPEG / WEBP / SVG), ~2MB cap. We never fetch remote URLs.
const LOGO_RE = /^data:image\/(png|jpe?g|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const str = (max, min = 0) => z.string().trim().min(min).max(max);
const optStr = (max) => z.string().trim().max(max).optional().default("");
const money = z.coerce.number().finite().min(0).max(1e12);

const schema = z.object({
  template: z.enum(TEMPLATE_IDS).default("classic"),

  company: z.object({
    name: str(120, 1),
    logo: z
      .string()
      .max(2_800_000)
      .regex(LOGO_RE, "Logo must be a PNG, JPG, WEBP or SVG image")
      .optional()
      .or(z.literal("")),
    email: optStr(120),
    phone: optStr(40),
    address: optStr(300),
    website: optStr(120),
  }),

  client: z.object({
    name: str(120, 1),
    company: optStr(120),
    email: optStr(120),
    phone: optStr(40),
    address: optStr(300),
  }),

  proposal: z.object({
    title: str(160, 1),
    date: optStr(10),
    validUntil: optStr(10),
    currency: z.enum(["USD", "EUR", "GBP", "INR", "AUD", "CAD", "AED", "SGD"]).default("USD"),
    accentColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Accent colour must be a hex value like #1d4ed8")
      .optional()
      .or(z.literal("")),
  }),

  description: optStr(6000),
  scope: optStr(6000),

  items: z
    .array(
      z.object({
        description: str(300, 1),
        qty: money.default(1),
        unitPrice: money.default(0),
      })
    )
    .min(1, "Add at least one pricing item")
    .max(60),

  taxRate: z.coerce.number().min(0).max(100).default(0),
  discount: z.coerce.number().min(0).max(100).default(0),

  timeline: z
    .array(
      z.object({
        phase: str(120, 1),
        duration: optStr(60),
        details: optStr(500),
      })
    )
    .max(30)
    .default([]),

  terms: optStr(8000),
});

function validateProposal(body) {
  const result = schema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const errors = result.error.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));
  return { ok: false, errors };
}

module.exports = { validateProposal, TEMPLATE_IDS };
