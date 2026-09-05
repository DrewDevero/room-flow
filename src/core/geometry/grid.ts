// Computes grid line positions (in mm, working coordinate space) visible
// within the current pan/zoom viewport (spec.md §6).

export interface GridLines {
  vertical: number[];
  horizontal: number[];
}

const MAX_LINES_PER_AXIS = 300;

export function computeGridLines(
  spacingMm: number,
  visibleMinXMm: number,
  visibleMaxXMm: number,
  visibleMinYMm: number,
  visibleMaxYMm: number,
): GridLines {
  return {
    vertical: computeAxisLines(spacingMm, visibleMinXMm, visibleMaxXMm),
    horizontal: computeAxisLines(spacingMm, visibleMinYMm, visibleMaxYMm),
  };
}

function computeAxisLines(spacingMm: number, min: number, max: number): number[] {
  const start = Math.floor(min / spacingMm) * spacingMm;
  const lines: number[] = [];
  for (let v = start; v <= max && lines.length < MAX_LINES_PER_AXIS; v += spacingMm) {
    lines.push(v);
  }
  return lines;
}
