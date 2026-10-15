import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "heap-scheduling",
  title: "Scheduling with a Heap (Meeting Rooms II)",
  category: "heaps",
  subcategory: "Patterns",
  difficulty: "intermediate",
  order: 4,
  summary: "Sort meetings by start; a min-heap of end times says which room frees up first — reuse it or open a new one. The heap's size is the answer.",
  keywords: ["meeting rooms ii", "minimum meeting rooms", "interval scheduling", "min heap of end times", "resource allocation"],
  problems: [
    { id: 253, title: "Meeting Rooms II", difficulty: "Medium", slug: "meeting-rooms-ii", note: "This page: heap of end times, one entry per busy room." },
    { id: 2402, title: "Meeting Rooms III", difficulty: "Hard", slug: "meeting-rooms-iii", note: "Two heaps: free rooms by number and busy rooms by end time; delayed meetings keep their length." },
    { id: 1094, title: "Car Pooling", difficulty: "Medium", slug: "car-pooling", note: "Same sweep by start; a heap (or difference array) releases passengers whose trip ended." },
    { id: 1942, title: "The Number of the Smallest Unoccupied Chair", difficulty: "Medium", slug: "the-number-of-the-smallest-unoccupied-chair", note: "A heap of free chairs plus a heap of (leave time, chair) for occupied ones." },
  ],
};

export default meta;
