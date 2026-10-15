import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "car-fleet",
  title: "Car Fleet",
  category: "stacks-queues",
  subcategory: "Monotonic",
  difficulty: "intermediate",
  order: 3,
  summary: "Sort cars from the target backwards and compare arrival times: a car that would arrive no later than the fleet ahead joins it; a slower one starts a new fleet.",
  keywords: ["car fleet", "monotonic stack", "arrival time", "sort by position", "catch up"],
  problems: [
    { id: 853, title: "Car Fleet", difficulty: "Medium", slug: "car-fleet", note: "This page: sort by position, stack of strictly increasing arrival times." },
    { id: 1776, title: "Car Fleet II", difficulty: "Hard", slug: "car-fleet-ii", note: "When does each car catch the one ahead? Monotonic stack of cars it could still collide with." },
    { id: 2211, title: "Count Collisions on a Road", difficulty: "Medium", slug: "count-collisions-on-a-road", note: "Another \"who catches whom\" road problem; reason about which cars can never be stopped." },
    { id: 735, title: "Asteroid Collision", difficulty: "Medium", slug: "asteroid-collision", note: "Stack simulation of objects merging or destroying each other as they meet." },
  ],
};

export default meta;
