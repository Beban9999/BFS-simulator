import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { CATEGORY_BY_ID } from "../catalog/categories";
import type { CategoryId } from "../engine/types";
import { Sidebar } from "../components/Sidebar";
import { Icon } from "../components/Icons";
import { NotFound } from "./NotFound";
import { CheatSheet } from "./CheatSheet";

export function CategoryLayout() {
  const { category } = useParams();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setNavOpen(false), [location.pathname]);

  if (!category || !(category in CATEGORY_BY_ID)) return <NotFound />;
  if (category === "cheatsheet") return <CheatSheet />;
  const id = category as CategoryId;

  return (
    <div className="page">
      <Sidebar category={id} open={navOpen} onNavigate={() => setNavOpen(false)} />
      {navOpen && <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} />}
      <main className="page-main" id="main">
        <button type="button" className="btn btn-secondary small mobile-nav-toggle" onClick={() => setNavOpen(true)}>
          <Icon name="menu" /> {CATEGORY_BY_ID[id].short} topics
        </button>
        <Outlet />
      </main>
    </div>
  );
}
