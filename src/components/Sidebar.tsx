import { Link, NavLink } from "react-router-dom";
import type { CategoryId } from "../engine/types";
import { CATEGORY_BY_ID } from "../catalog/categories";
import { groupsFor } from "../registry";
import { usePrefs } from "../store/prefs";
import { ProgressIcon } from "./ProgressMark";

export function Sidebar({ category, open, onNavigate }: { category: CategoryId; open: boolean; onNavigate: () => void }) {
  const progress = usePrefs((s) => s.progress);
  const groups = groupsFor(category);
  const all = groups.flatMap((g) => g.items);
  const learned = all.filter((m) => progress[m.id] === "learned").length;
  const cat = CATEGORY_BY_ID[category];

  return (
    <aside className={`sidebar${open ? " open" : ""}`} aria-label={`${cat.title} topics`}>
      <h2 className="sidebar-title">
        <Link to={`/${category}`} onClick={onNavigate}>
          {cat.title}
        </Link>
        {all.length > 0 && (
          <span className="sidebar-progress">
            {learned}/{all.length} learned
          </span>
        )}
      </h2>
      {all.length > 0 && (
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={learned}
          aria-label="Learned in this tab"
        >
          <span style={{ width: `${(learned / all.length) * 100}%` }} />
        </div>
      )}
      {groups.map((g) => (
        <section key={g.name} className="sub-group">
          <h3 className="sub-title">{g.name}</h3>
          <ul className="nav-list">
            {g.items.map((m) => (
              <li key={m.id}>
                <NavLink
                  to={`/${category}/${m.id}`}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  onClick={onNavigate}
                >
                  <ProgressIcon mark={progress[m.id]} />
                  <span className="nav-label">{m.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {all.length === 0 && (
        <p className="empty-note" style={{ padding: "0 6px" }}>
          Pages for this tab are on the roadmap.
        </p>
      )}
    </aside>
  );
}
