import { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { CommandPalette } from "./components/CommandPalette";
import { HomePage } from "./pages/HomePage";
import { CategoryLayout } from "./pages/CategoryLayout";
import { CategoryOverview } from "./pages/CategoryOverview";
import { NotFound } from "./pages/NotFound";
import { usePrefs } from "./store/prefs";

const AlgorithmPage = lazy(() => import("./pages/AlgorithmPage"));

export default function App() {
  const theme = usePrefs((s) => s.theme);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Header onSearch={() => setPaletteOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:category" element={<CategoryLayout />}>
          <Route index element={<CategoryOverview />} />
          <Route
            path=":id"
            element={
              <Suspense fallback={<p className="loading">Loading…</p>}>
                <AlgorithmPage />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </>
  );
}
