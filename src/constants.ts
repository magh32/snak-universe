import { Point } from "./types";

export const GRID_SIZE = 20;
export const CANVAS_SIZE = 800;

export const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];

export const INITIAL_DIR: Point = { x: 0, y: -1 };

export const STARS_PER_REWARD = 5;
export const SCORE_PER_STAR = 3;

export const COLORS = {
  SNAKE_HEAD: "#22c55e",
  SNAKE_BODY: "#86efac",
  SNAKE_SHIELD_GLOW: "#fbbf24",
  FOOD: "#f87171",
  ICE_BERRY: "#38bdf8",
  OBSTACLE: "rgba(255,255,255,0.2)",
  CANVAS_BG: "#0f172a",
  ACCENT: "#4ade80",
  GOLD: "#fbbf24",
};

export const POWER_UPS = {
  SLOW_TIME_DURATION: 10, // 10 seconds
  SLOW_TIME_FACTOR: 1.5, // 1.5x slower
};
