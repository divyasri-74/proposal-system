// Template registry. To add a template: create a file exporting render(data) and register it here
// (and add its id to TEMPLATE_IDS in ../validate.js).
const classic = require("./classic");
const modern = require("./modern");
const minimal = require("./minimal");

const templates = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Formal serif letterhead with ruled tables. Ideal for law, consulting and finance.",
    defaultAccent: "#1e3a5f",
    render: classic,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold gradient cover, numbered sections and a visual timeline. Great for agencies and tech.",
    defaultAccent: "#4f46e5",
    render: modern,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Airy editorial layout with hairline rules. Suits design studios and premium services.",
    defaultAccent: "#0f766e",
    render: minimal,
  },
};

const listTemplates = () => Object.values(templates).map(({ render, ...meta }) => meta);
const renderProposal = (data) => templates[data.template].render(data);

module.exports = { listTemplates, renderProposal };
