import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "difference-array",
  title: "Difference Array (range updates)",
  category: "arrays-hashing",
  subcategory: "Prefix sums",
  difficulty: "intermediate",
  order: 4,
  summary: "Apply 'add v to every item in [l, r]' in O(1) by marking +v at l and −v at r+1, then prefix-sum once at the end.",
  keywords: ["difference array", "range update", "sweep", "imos", "car pooling", "corporate flight bookings"],
  problems: [
    { id: 370, title: "Range Addition", difficulty: "Medium", slug: "range-addition", note: "Exactly this page (premium)." },
    { id: 1109, title: "Corporate Flight Bookings", difficulty: "Medium", slug: "corporate-flight-bookings", note: "Each booking is a range add of seats." },
    { id: 1094, title: "Car Pooling", difficulty: "Medium", slug: "car-pooling", note: "Range-add passengers over trip stops, then check the max load." },
    { id: 2381, title: "Shifting Letters II", difficulty: "Medium", slug: "shifting-letters-ii", note: "Range shifts accumulate in a difference array, applied mod 26." },
  ],
};

export default meta;
