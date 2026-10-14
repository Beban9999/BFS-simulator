import { Link, useParams } from "react-router-dom";
import { CATEGORY_BY_ID } from "../catalog/categories";
import type { CategoryId } from "../engine/types";
import { groupsFor } from "../registry";
import { usePrefs } from "../store/prefs";
import { ProgressIcon } from "../components/ProgressMark";

export function CategoryOverview() {
  const { category } = useParams();
  const progress = usePrefs((s) => s.progress);
  const cat = CATEGORY_BY_ID[category as CategoryId];
  const groups = groupsFor(cat.id);

  return (
    <>
      <div className="hero" style={{ marginTop: 4 }}>
        <h1>{cat.title}</h1>
        <p>{cat.blurb}</p>
      </div>
      {groups.length === 0 && <p className="empty-note">No pages yet — this tab is on the roadmap (see ROADMAP.md).</p>}
      {groups.map((g) => (
        <section key={g.name}>
          <h2 className="section-title">{g.name}</h2>
          <div className="card-grid">
            {g.items.map((m) => (
              <Link key={m.id} to={`/${cat.id}/${m.id}`} className="card">
                <h3>
                  {m.title}
                  <ProgressIcon mark={progress[m.id]} />
                </h3>
                <p>{m.summary}</p>
                <div className="meta">
                  <span className={`diff-badge ${m.difficulty}`}>{m.difficulty}</span>
                  {m.problems?.length ? <span>{m.problems.length} practice problems</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
