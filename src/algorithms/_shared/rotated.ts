import type { Rng } from "../../engine/types";
import { randInt } from "../../engine/random";

/** True if nums is a rotation of a strictly increasing array. */
export function isRotatedSorted(nums: number[]): boolean {
  if (new Set(nums).size !== nums.length) return false;
  let drops = 0;
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) drops++;
  if (drops === 0) return true;
  return drops === 1 && nums[nums.length - 1] < nums[0];
}

export function randomRotated(rng: Rng, size: number): number[] {
  const n = Math.max(1, Math.min(16, size));
  const values = new Set<number>();
  while (values.size < n) values.add(randInt(rng, 0, 40));
  const sorted = [...values].sort((a, b) => a - b);
  const k = randInt(rng, 0, n - 1);
  return [...sorted.slice(k), ...sorted.slice(0, k)];
}

export const ROTATED_HINT = "nums must be a rotated sorted array of distinct values (e.g. 4 5 6 7 0 1 2).";
