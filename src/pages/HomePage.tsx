import { Link } from "react-router-dom";
import { CATEGORIES } from "../catalog/categories";
import { ALL_META, countFor } from "../registry";
import { usePrefs } from "../store/prefs";

export function HomePage() {
  const progress = usePrefs((s) => s.progress);
  const learned = Object.values(progress).filter((m) => m === "learned").length;
  const live = CATEGORIES.filter((c) => countFor(c.id) > 0);
  const soon = CATEGORIES.filter((c) => countFor(c.id) === 0);

  return (
    <main className="page-main" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="hero">
        <h1>Watch every interview algorithm run, one step at a time.</h1>
        <p>
          Each page pairs an animated simulation with the code executing line by line, live variables and call stack,
          and a short explanation of when to reach for it. {ALL_META.length} pages so far · {learned} marked learned.
        </p>
      </div>
      <div className="card-grid">
        {live.map((c) => {
          const n = countFor(c.id);
          const done = ALL_META.filter((m) => m.category === c.id && progress[m.id] === "learned").length;
          return (
            <Link key={c.id} to={`/${c.id}`} className="card">
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className="meta">
                <span>
                  {n} page{n === 1 ? "" : "s"} · {done} learned
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {soon.length > 0 && (
        <>
          <h2 className="section-title">Coming soon</h2>
          <div className="card-grid">
            {soon.map((c) => (
              <div key={c.id} className="card disabled">
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <h2 className="section-title">Keyboard</h2>
      <p className="empty-note" style={{ fontSize: "0.9rem" }}>
        <kbd>Space</kbd> play / pause · <kbd>←</kbd> <kbd>→</kbd> step · <kbd>Home</kbd> <kbd>End</kbd> jump ·{" "}
        <kbd>+</kbd> <kbd>-</kbd> speed · <kbd>Ctrl</kbd> <kbd>K</kbd> search
      </p>
    </main>
  );
}
