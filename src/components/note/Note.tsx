import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { META_BY_ID } from "../../registry";

/** Building blocks shared by note pages (pages without a simulation). */

export function NoteCard({ title, actions, children, className }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel note-card${className ? ` ${className}` : ""}`} aria-label={title}>
      <div className="panel-head">
        <h2 className="panel-title">{title}</h2>
        {actions}
      </div>
      <div className="note-body">{children}</div>
    </section>
  );
}

/** Two columns on wide screens, one on narrow ones. */
export function NoteGrid({ children }: { children: ReactNode }) {
  return <div className="note-grid">{children}</div>;
}

/** Link to another page by id; falls back to plain text when the page doesn't exist (yet). */
export function PageLink({ id, children }: { id: string; children?: ReactNode }) {
  const meta = META_BY_ID.get(id);
  if (!meta) return <span>{children ?? id}</span>;
  return <Link to={`/${meta.category}/${meta.id}`}>{children ?? meta.title}</Link>;
}

/** Segmented single-choice control. */
export function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
