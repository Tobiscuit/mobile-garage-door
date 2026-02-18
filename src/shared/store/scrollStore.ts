// Simple in-memory store for scroll positions
// We use a module-level variable which persists as long as the SPA is loaded
export const scrollPositions: Record<string, number> = {};

export const saveScrollPosition = (url: string, pos: number) => {
  scrollPositions[url] = pos;
};

export const getScrollPosition = (url: string) => {
  return scrollPositions[url] || 0;
};
