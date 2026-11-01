import { TEMPLATES } from "../lib/defaults";

// Tiny CSS wireframes so each template is recognisable at a glance.
function Thumb({ id, accent }) {
  if (id === "classic")
    return (
      <div className="thumb t-classic">
        <i style={{ background: accent }} />
        <b /><b className="s" />
        <u /><u /><u className="s" />
      </div>
    );
  if (id === "modern")
    return (
      <div className="thumb t-modern">
        <div className="hero" style={{ background: accent }} />
        <div className="cards"><span /><span /></div>
        <u /><u className="s" />
      </div>
    );
  return (
    <div className="thumb t-minimal">
      <b style={{ background: accent }} className="dot" />
      <h6 /><h6 className="s" />
      <hr /><u /><u className="s" />
    </div>
  );
}

export default function TemplatePicker({ value, accent, onChange }) {
  return (
    <div className="templates" role="radiogroup" aria-label="Template">
      {TEMPLATES.map((t) => (
        <button
          type="button"
          key={t.id}
          role="radio"
          aria-checked={value === t.id}
          className={`tpl ${value === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <Thumb id={t.id} accent={value === t.id && accent ? accent : t.accent} />
          <strong>{t.name}</strong>
          <small>{t.blurb}</small>
        </button>
      ))}
    </div>
  );
}
