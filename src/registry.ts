import type { AlgorithmMeta, AlgorithmModule, CategoryId } from "./engine/types";
import { CATEGORIES } from "./catalog/categories";

/**
 * Every algorithm lives in src/algorithms/<category>/<id>/.
 * meta.ts is loaded eagerly (menus, search); index.ts is lazy so each
 * algorithm's code, info and generator ship in their own chunk.
 */
const metaModules = import.meta.glob<AlgorithmMeta>("./algorithms/*/*/meta.ts", {
  eager: true,
  import: "default",
});
const moduleLoaders = import.meta.glob<AlgorithmModule>("./algorithms/*/*/index.ts", {
  import: "default",
});

export const ALL_META: AlgorithmMeta[] = [];
const loaderById = new Map<string, () => Promise<AlgorithmModule>>();

for (const [path, meta] of Object.entries(metaModules)) {
  const loader = moduleLoaders[path.replace(/meta\.ts$/, "index.ts")];
  if (!loader) continue;
  if (loaderById.has(meta.id)) throw new Error(`Duplicate algorithm id "${meta.id}"`);
  loaderById.set(meta.id, loader);
  ALL_META.push(meta);
}

export const META_BY_ID = new Map(ALL_META.map((m) => [m.id, m]));

export function loadAlgorithm(id: string): Promise<AlgorithmModule> | null {
  return loaderById.get(id)?.() ?? null;
}

export interface SubcategoryGroup {
  name: string;
  items: AlgorithmMeta[];
}

/** Algorithms of one category grouped by subcategory, in catalog order. */
export function groupsFor(category: CategoryId): SubcategoryGroup[] {
  const cat = CATEGORIES.find((c) => c.id === category);
  const items = ALL_META.filter((m) => m.category === category);
  const names = new Set(items.map((m) => m.subcategory));
  const ordered = [
    ...(cat?.subcategories ?? []).filter((s) => names.has(s)),
    ...[...names].filter((s) => !cat?.subcategories.includes(s)).sort(),
  ];
  return ordered.map((name) => ({
    name,
    items: items
      .filter((m) => m.subcategory === name)
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title)),
  }));
}

export function countFor(category: CategoryId): number {
  return ALL_META.filter((m) => m.category === category).length;
}
