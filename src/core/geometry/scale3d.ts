// Converts floor-plan mm coordinates into Three.js scene meters (spec.md §7).
// Floor-plan (x, y) maps to scene (x, z); height runs along scene Y (up).

export const MM_TO_M = 0.001;

export function mmToM(mm: number): number {
  return mm * MM_TO_M;
}
