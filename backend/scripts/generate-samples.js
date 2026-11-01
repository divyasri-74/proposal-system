// Generates one sample PDF per template into ../../samples using the same pipeline as the API.
const fs = require("fs");
const path = require("path");
const { validateProposal, TEMPLATE_IDS } = require("../src/validate");
const { renderProposal } = require("../src/templates");
const { htmlToPdf, closeBrowser } = require("../src/pdf");
const { sample } = require("../src/sample");

(async () => {
  const outDir = path.join(__dirname, "..", "..", "samples");
  fs.mkdirSync(outDir, { recursive: true });
  const accents = { classic: "#1e3a5f", modern: "#4f46e5", minimal: "#0f766e" };

  for (const template of TEMPLATE_IDS) {
    const payload = { ...sample, template, proposal: { ...sample.proposal, accentColor: accents[template] } };
    const result = validateProposal(payload);
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    const pdf = await htmlToPdf(renderProposal(result.data), {
      footerLabel: `${result.data.company.name} · ${result.data.proposal.title}`,
    });
    const file = path.join(outDir, `sample-${template}.pdf`);
    fs.writeFileSync(file, pdf);
    console.log(`✔ ${file} (${(pdf.length / 1024).toFixed(1)} KB)`);
  }
  await closeBrowser();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
