import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import type { CodeSet, Language } from "../engine/types";
import { parseCode } from "../engine/markers";
import { usePrefs, type PopupGeometry } from "../store/prefs";
import { Icon } from "./Icons";

const LANG_LABEL: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

/** Colours come from CSS variables so the code follows the site theme. */
const theme: PrismTheme = {
  plain: { color: "var(--code-text)", backgroundColor: "transparent" },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "var(--code-comment)", fontStyle: "italic" } },
    { types: ["keyword", "builtin", "boolean", "important", "atrule"], style: { color: "var(--code-keyword)" } },
    { types: ["string", "char", "attr-value", "template-string", "regex"], style: { color: "var(--code-string)" } },
    { types: ["number", "constant", "symbol"], style: { color: "var(--code-number)" } },
    { types: ["function", "class-name", "decorator"], style: { color: "var(--code-function)" } },
    { types: ["operator", "punctuation"], style: { color: "var(--code-operator)" } },
  ],
};

interface CodeViewProps {
  code: CodeSet;
  marker: string;
}

function CodeBody({ code, marker, language }: CodeViewProps & { language: Language }) {
  const src = code[language] ?? code.python;
  const parsed = useMemo(() => parseCode(src), [src]);
  const current = parsed.marks[marker];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the current line visible inside the code box without scrolling the page.
  useLayoutEffect(() => {
    const box = scrollRef.current;
    const line = box?.querySelector<HTMLElement>(".code-line.current");
    if (!box || !line) return;
    const top = line.offsetTop;
    const bottom = top + line.offsetHeight;
    if (top < box.scrollTop + 24 || bottom > box.scrollTop + box.clientHeight - 24) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [current, language]);

  const prismLang = language === "javascript" ? "javascript" : language === "cpp" ? "cpp" : language === "java" ? "clike" : "python";

  return (
    <div className="code-scroll" ref={scrollRef} tabIndex={0} aria-label={`${LANG_LABEL[language]} source code`}>
      <Highlight theme={theme} code={parsed.text} language={prismLang}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="code-pre">
            {tokens.map((line, i) => {
              const n = i + 1;
              const props = getLineProps({ line });
              const isCurrent = n === current;
              return (
                <div
                  key={i}
                  {...props}
                  className={`code-line${isCurrent ? " current" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="code-ln">{n}</span>
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

function LanguageTabs({ code, language, onChange }: { code: CodeSet; language: Language; onChange: (l: Language) => void }) {
  const langs = (Object.keys(LANG_LABEL) as Language[]).filter((l) => code[l]);
  return (
    <div className="segmented" role="tablist" aria-label="Code language">
      {langs.map((l) => (
        <button key={l} type="button" role="tab" aria-selected={l === language} onClick={() => onChange(l)}>
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

export function CodePanel({ code, marker }: CodeViewProps) {
  const language = usePrefs((s) => s.language);
  const setLanguage = usePrefs((s) => s.setLanguage);
  const detached = usePrefs((s) => s.codeDetached);
  const setDetached = usePrefs((s) => s.setCodeDetached);
  const lang = code[language] ? language : "python";

  const head = (
    <>
      <h2 className="panel-title">Code</h2>
      <LanguageTabs code={code} language={lang} onChange={setLanguage} />
      <button
        type="button"
        className="icon-btn small square"
        onClick={() => setDetached(!detached)}
        aria-label={detached ? "Dock code panel" : "Pop out code into a floating window"}
        title={detached ? "Dock code panel" : "Pop out into a floating window"}
      >
        <Icon name={detached ? "dock" : "popout"} />
      </button>
    </>
  );

  if (detached) {
    return (
      <>
        <section className="panel">
          <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p className="empty-note" style={{ flex: 1 }}>
              Code is in a floating window.
            </p>
            <button type="button" className="btn btn-secondary small" onClick={() => setDetached(false)}>
              <Icon name="dock" /> Dock
            </button>
          </div>
        </section>
        <CodePopup head={head}>
          <CodeBody code={code} marker={marker} language={lang} />
        </CodePopup>
      </>
    );
  }

  return (
    <section className="panel code-panel" aria-label="Code">
      <div className="panel-head">{head}</div>
      <CodeBody code={code} marker={marker} language={lang} />
    </section>
  );
}

function clampGeometry(g: PopupGeometry): PopupGeometry {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(Math.max(280, g.w), vw - 16);
  const h = Math.min(Math.max(160, g.h), vh - 16);
  const x = g.x < 0 ? vw - w - 24 : Math.min(Math.max(8, g.x), vw - Math.min(w, 120));
  const y = g.y < 0 ? 120 : Math.min(Math.max(8, g.y), vh - 48);
  return { x, y, w, h };
}

/** Floating, draggable, resizable window that remembers where it was left. */
function CodePopup({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  const saved = usePrefs((s) => s.popup);
  const save = usePrefs((s) => s.setPopup);
  const [geo, setGeo] = useState(() => clampGeometry(saved));
  const boxRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef(geo);
  geoRef.current = geo;

  // Persist size changes from the native resize handle.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let t = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const next = { ...geoRef.current, w: box.offsetWidth, h: box.offsetHeight };
        if (next.w !== geoRef.current.w || next.h !== geoRef.current.h) {
          setGeo(next);
          save(next);
        }
      }, 200);
    });
    ro.observe(box);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [save]);

  useEffect(() => {
    const onResize = () => setGeo((g) => clampGeometry(g));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = geoRef.current;
    const move = (ev: PointerEvent) => {
      setGeo(clampGeometry({ ...start, x: start.x + ev.clientX - startX, y: start.y + ev.clientY - startY }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      save(geoRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.shiftKey ? 40 : 10;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
      ArrowUp: [0, -delta],
      ArrowDown: [0, delta],
    };
    const m = moves[e.key];
    if (!m || (e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    e.stopPropagation();
    const next = clampGeometry({ ...geoRef.current, x: geoRef.current.x + m[0], y: geoRef.current.y + m[1] });
    setGeo(next);
    save(next);
  };

  return createPortal(
    <div
      ref={boxRef}
      className="code-popup"
      role="dialog"
      aria-label="Code (floating window)"
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h }}
    >
      <div
        className="panel-head"
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        tabIndex={0}
        data-no-player-keys
        title="Drag to move (or focus and use arrow keys). Resize from the bottom-right corner."
      >
        {head}
      </div>
      {children}
    </div>,
    document.body,
  );
}
