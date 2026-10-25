export type CardBounds = { left: number; right: number; top: number; bottom: number };

/** Keep both builders inside the visible carousel, even while the route tween lags. */
export function compactBuilders(
  cards: CardBounds[],
  scrollLeft: number,
  width: number,
  halfWidth: number,
  routeX: number,
) {
  const center = scrollLeft + width / 2;
  const gap = (card: CardBounds) => Math.max(card.left - center, 0, center - card.right);
  const card = cards.reduce((nearest, candidate) =>
    gap(candidate) < gap(nearest) ? candidate : nearest,
  );
  const spacing = 72;
  const left = scrollLeft + halfWidth + 12;
  const right = scrollLeft + width - halfWidth - spacing - 12;
  const x = Math.max(
    left,
    Math.min(
      right,
      Math.max(card.left + halfWidth, Math.min(card.right - halfWidth - spacing, routeX)),
    ),
  );
  return { x, y: card.top - 38, spacing };
}

/** Build the card outline and rounded connectors from layout measurements. */
export function servicesRoute(cards: CardBounds[]) {
  const agentCard = cards[0];
  if (!agentCard) throw new Error('A services route needs at least one card');
  const radius = Math.min(
    28,
    (agentCard.right - agentCard.left) / 2,
    (agentCard.bottom - agentCard.top) / 2,
  );
  const left = agentCard.left - 1,
    top = agentCard.top - 1;
  const right = agentCard.right + 1,
    bottom = agentCard.bottom + 1;
  const middle = (top + bottom) / 2;
  // A single line closes the agent card before continuing through every other card.
  let d = `M ${right} ${middle} V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom} H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius} V ${top + radius} Q ${left} ${top} ${left + radius} ${top} H ${right - radius} Q ${right} ${top} ${right} ${top + radius} V ${middle}`;
  const outlineLength = 2 * (right - left + (bottom - top)) - (8 - 2 * Math.PI) * radius;
  let previous = { x: right, y: middle };

  const routePoints = [previous];
  cards.slice(1).forEach((card, index) => {
    const x = card.left - 12;
    const cardRight = card.right + 12;
    const y = (index + 1) % 2 === 0 ? card.top - 42 : card.bottom + 42;
    const turn = (previous.x + x) / 2;
    routePoints.push({ x: turn, y: previous.y }, { x: turn, y }, { x, y }, { x: cardRight, y });
    previous = { x: cardRight, y };
  });
  for (let index = 1; index < routePoints.length - 1; index++) {
    const previousPoint = routePoints[index - 1],
      point = routePoints[index],
      next = routePoints[index + 1];
    const before = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    const after = Math.hypot(next.x - point.x, next.y - point.y);
    const corner = Math.min(22, before / 2, after / 2);
    if (!before || !after) continue;
    d += ` L ${point.x - ((point.x - previousPoint.x) / before) * corner} ${point.y - ((point.y - previousPoint.y) / before) * corner} Q ${point.x} ${point.y} ${point.x + ((next.x - point.x) / after) * corner} ${point.y + ((next.y - point.y) / after) * corner}`;
  }
  const finalPoint = routePoints[routePoints.length - 1];
  d += ` L ${finalPoint.x} ${finalPoint.y}`;

  return { d, outlineLength, left, right, top };
}
