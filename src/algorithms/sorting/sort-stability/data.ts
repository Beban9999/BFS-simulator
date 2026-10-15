import type { Rec } from "./sorts";

export interface Dataset {
  name: string;
  keyName: string;
  records: Rec[];
}

/** Plain literals; `pos` is the original row. Tests check that every unstable sort visibly breaks each one. */
export const DATASETS: Dataset[] = [
  {
    name: "Students by grade",
    keyName: "grade",
    records: [
      { pos: 0, label: "Maya", key: 1, keyText: "B" },
      { pos: 1, label: "Leo", key: 0, keyText: "A" },
      { pos: 2, label: "Iris", key: 1, keyText: "B" },
      { pos: 3, label: "Omar", key: 2, keyText: "C" },
      { pos: 4, label: "Zoe", key: 0, keyText: "A" },
      { pos: 5, label: "Ben", key: 1, keyText: "B" },
      { pos: 6, label: "Ava", key: 2, keyText: "C" },
      { pos: 7, label: "Kai", key: 0, keyText: "A" },
    ],
  },
  {
    name: "Cards by rank",
    keyName: "rank",
    records: [
      { pos: 0, label: "5♥", key: 5, keyText: "5" },
      { pos: 1, label: "3♠", key: 3, keyText: "3" },
      { pos: 2, label: "5♠", key: 5, keyText: "5" },
      { pos: 3, label: "2♦", key: 2, keyText: "2" },
      { pos: 4, label: "3♥", key: 3, keyText: "3" },
      { pos: 5, label: "5♦", key: 5, keyText: "5" },
      { pos: 6, label: "2♣", key: 2, keyText: "2" },
    ],
  },
  {
    name: "Orders by day",
    keyName: "day",
    records: [
      { pos: 0, label: "#101 09:05", key: 2, keyText: "Tue" },
      { pos: 1, label: "#102 09:40", key: 1, keyText: "Mon" },
      { pos: 2, label: "#103 10:15", key: 2, keyText: "Tue" },
      { pos: 3, label: "#104 11:30", key: 1, keyText: "Mon" },
      { pos: 4, label: "#105 12:00", key: 3, keyText: "Wed" },
      { pos: 5, label: "#106 13:20", key: 2, keyText: "Tue" },
      { pos: 6, label: "#107 14:45", key: 1, keyText: "Mon" },
      { pos: 7, label: "#108 15:10", key: 3, keyText: "Wed" },
    ],
  },
];
