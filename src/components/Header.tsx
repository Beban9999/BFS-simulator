import { Link, NavLink } from "react-router-dom";
import { CATEGORIES } from "../catalog/categories";
import { countFor } from "../registry";
import { usePrefs } from "../store/prefs";
import { Icon, Logo } from "./Icons";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Header({ onSearch }: { onSearch: () => void }) {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);
  const next = theme === "dark" ? "light" : "dark";

  return (
    <header className="app-header">
      <div className="header-row">
        <Link to="/" className="brand" aria-label="Steplore home">
          <Logo />
          Steplore
        </Link>
        <div className="header-spacer" />
        <button type="button" className="search-btn" onClick={onSearch} aria-label="Search algorithms and problems">
          <Icon name="search" />
          <span>Search algorithms & problems…</span>
          <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(next)}
          aria-label={`Switch to ${next} mode`}
          title={`Switch to ${next} mode`}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
      </div>
      <nav className="tabs-row" aria-label="Categories">
        {/* Tabs without pages yet stay hidden; they reappear as soon as one algorithm folder exists. */}
        {CATEGORIES.filter((c) => countFor(c.id) > 0).map((c) => {
          const n = countFor(c.id);
          return (
            <NavLink
              key={c.id}
              to={`/${c.id}`}
              className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
              title={c.title}
            >
              {c.short}
              <span className="tab-count">{n}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
