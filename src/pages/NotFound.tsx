import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="page-main" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="hero">
        <h1>Page not found</h1>
        <p>
          That page doesn't exist (yet). <Link to="/">Back to all topics</Link>.
        </p>
      </div>
    </main>
  );
}
