import { useMemo, useState } from "react";
import { marked } from "marked";
import type { Problem } from "../engine/types";
import { Icon } from "./Icons";

/** Split info.md on `## ` headings into ordered sections. */
export function splitSections(md: string): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  let current: { title: string; lines: string[] } | null = null;
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (current) out.push({ title: current.title, body: current.lines.join("\n").trim() });
      current = { title: m[1].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) out.push({ title: current.title, body: current.lines.join("\n").trim() });
  return out;
}

export function InfoTabs({ info, problems }: { info: string; problems?: Problem[] }) {
  const sections = useMemo(() => splitSections(info), [info]);
  const tabs = [...sections.map((s) => s.title), ...(problems?.length ? ["Practice problems"] : [])];
  const [active, setActive] = useState(0);
  const tab = Math.min(active, tabs.length - 1);
  const section = sections[tab];
  const html = useMemo(() => (section ? (marked.parse(section.body, { async: false }) as string) : ""), [section]);

  return (
    <section className="panel info" aria-label="Explanation">
      <div className="info-tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`info-tab-${i}`}
            aria-selected={i === tab}
            aria-controls="info-panel"
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
      </div>
      <div id="info-panel" role="tabpanel" aria-labelledby={`info-tab-${tab}`}>
        {section ? (
          // info.md files are authored in this repo, so rendering them as HTML is safe.
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="prose">
            <ul className="problems">
              {problems?.map((p) => (
                <li key={p.id}>
                  <span className="num">#{p.id}</span>
                  <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer noopener">
                    {p.title}{" "}
                    <span className="ext-icon">
                      <Icon name="external" />
                    </span>
                  </a>
                  <span className={`lc-diff ${p.difficulty}`}>{p.difficulty}</span>
                  <span className="note">{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
