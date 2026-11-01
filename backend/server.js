const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { validateProposal } = require("./src/validate");
const { listTemplates, renderProposal } = require("./src/templates");
const { htmlToPdf, closeBrowser } = require("./src/pdf");
const { sample } = require("./src/sample");

const app = express();
const PORT = process.env.PORT || 4000;

// Comma-separated list of allowed frontend origins, e.g. "https://my-app.vercel.app".
// Unset = allow all (fine for local development only).
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      cb(new Error("Origin not allowed by CORS"));
    },
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.json({ limit: "4mb" })); // logo arrives as a base64 data URL

app.use("/api", rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.get("/api/templates", (_req, res) => res.json(listTemplates()));
app.get("/api/sample", (_req, res) => res.json(sample));

function parse(req, res) {
  const result = validateProposal(req.body);
  if (!result.ok) {
    res.status(400).json({ error: "Validation failed", details: result.errors });
    return null;
  }
  return result.data;
}

// HTML preview — the exact markup that is later converted to PDF, so preview == download.
app.post("/api/preview", (req, res) => {
  const data = parse(req, res);
  if (!data) return;
  res.type("html").send(renderProposal(data));
});

app.post("/api/generate", async (req, res, next) => {
  const data = parse(req, res);
  if (!data) return;
  try {
    const pdf = await htmlToPdf(renderProposal(data), {
      footerLabel: `${data.company.name} · ${data.proposal.title}`,
    });
    const filename =
      data.proposal.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "proposal";
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    });
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Payload too large (logo max ~2MB)" });
  res.status(500).json({ error: "Something went wrong while generating the proposal" });
});

const server = app.listen(PORT, () => console.log(`Proposal API listening on :${PORT}`));

const shutdown = async () => {
  server.close();
  await closeBrowser();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
