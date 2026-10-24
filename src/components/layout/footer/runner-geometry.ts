export type Point = [number, number];
export function parseSvgPath(d: string): Point[][] {
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const polygons: Point[][] = [];
  let cursor: Point = [0, 0];
  let start: Point = [0, 0];
  let polygon: Point[] = [];
  let index = 0;
  const number = () => Number(tokens[index++]);
  const point = (): Point => [number(), number()];
  const add = (next: Point) => {
    polygon.push(next);
    cursor = next;
  };
  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === 'M') {
      if (polygon.length) polygons.push(polygon);
      polygon = [point()];
      cursor = polygon[0];
      start = cursor;
      while (index < tokens.length && !/[A-Za-z]/.test(tokens[index])) add(point());
    } else if (command === 'L') {
      while (index < tokens.length && !/[A-Za-z]/.test(tokens[index])) add(point());
    } else if (command === 'H') {
      while (index < tokens.length && !/[A-Za-z]/.test(tokens[index])) add([number(), cursor[1]]);
    } else if (command === 'V') {
      while (index < tokens.length && !/[A-Za-z]/.test(tokens[index])) add([cursor[0], number()]);
    } else if (command === 'C') {
      while (index < tokens.length && !/[A-Za-z]/.test(tokens[index])) {
        const from = cursor,
          control1 = point(),
          control2 = point(),
          to = point();
        for (let step = 1; step <= 8; step++) {
          const t = step / 8,
            inverse = 1 - t;
          add([
            inverse ** 3 * from[0] +
              3 * inverse ** 2 * t * control1[0] +
              3 * inverse * t ** 2 * control2[0] +
              t ** 3 * to[0],
            inverse ** 3 * from[1] + 3 * inverse ** 2 * t * control1[1] + t ** 3 * to[1],
          ]);
        }
      }
    } else if (command === 'Z') {
      if (polygon.length && (cursor[0] !== start[0] || cursor[1] !== start[1])) polygon.push(start);
    }
  }
  if (polygon.length) polygons.push(polygon);
  return polygons;
}

export function containsPoint(polygons: Point[][], x: number, y: number) {
  return polygons.some((polygon) => {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
      const [x1, y1] = polygon[index],
        [x2, y2] = polygon[previous];
      if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) inside = !inside;
    }
    return inside;
  });
}
