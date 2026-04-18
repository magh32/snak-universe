import { LevelConfig, Point } from "./types";

const generateBox = (x1: number, y1: number, x2: number, y2: number): Point[] => {
  const points: Point[] = [];
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      points.push({ x, y });
    }
  }
  return points;
};

export const LEVELS: LevelConfig[] = Array.from({ length: 20 }, (_, i) => {
  const id = i + 1;
  const speed = Math.max(80, 250 - (i * 8)); // Slower start (250ms), becomes challenging later
  const requiredScore = 5 + (i * 2);
  const gridSize = { width: 20, height: 20 };
  
  // Educational Modes for a 4-year-old
  // Levels 1-5: Classic (Intro)
  // Levels 6-12: Numbers (Learning to count)
  // Levels 13-20: Colors (Learning colors)
  let educationalType: "CLASSIC" | "NUMBERS" | "COLORS" = "CLASSIC";
  if (id > 5 && id <= 12) educationalType = "NUMBERS";
  if (id > 12) educationalType = "COLORS";

  // Visual Progression - Different palettes for different sets of levels
  const palettes = [
    { snakeHead: "#22c55e", snakeBody: "#86efac", background: "#0f172a", accent: "#4ade80" }, // Forest
    { snakeHead: "#0ea5e9", snakeBody: "#7dd3fc", background: "#082f49", accent: "#38bdf8" }, // Ocean
    { snakeHead: "#eab308", snakeBody: "#fde047", background: "#422006", accent: "#fbbf24" }, // Desert
    { snakeHead: "#d946ef", snakeBody: "#f5d0fe", background: "#4a044e", accent: "#e879f9" }, // Candy
    { snakeHead: "#f43f5e", snakeBody: "#fda4af", background: "#450a0a", accent: "#fb7185" }, // Volcano
  ];
  const paletteIndex = Math.floor(i / 4) % palettes.length;
  const colors = palettes[paletteIndex];

  let obstacles: Point[] = [];
  
  if (id === 2) {
    obstacles = [{ x: 5, y: 5 }, { x: 5, y: 14 }, { x: 14, y: 5 }, { x: 14, y: 14 }];
  } else if (id === 5) {
    for (let x = 4; x <= 15; x++) { obstacles.push({ x, y: 7 }); obstacles.push({ x, y: 12 }); }
  } else if (id === 8) {
    for (let y = 4; y <= 15; y++) { obstacles.push({ x: 7, y }); obstacles.push({ x: 12, y }); }
  } else if (id === 10) {
    for (let i = 4; i <= 15; i++) { obstacles.push({ x: 10, y: i }); obstacles.push({ x: i, y: 10 }); }
  } else if (id === 12) {
    obstacles = [...generateBox(4, 4, 6, 6), ...generateBox(13, 4, 15, 6), ...generateBox(4, 13, 6, 15), ...generateBox(13, 13, 15, 15)];
  } else if (id === 15) {
    for (let x = 2; x <= 17; x++) {
       if (x % 4 === 0) for (let y = 0; y < 14; y++) obstacles.push({ x, y });
       if (x % 4 === 2) for (let y = 6; y < 20; y++) obstacles.push({ x, y });
    }
  } else if (id === 18) {
    for (let x = 5; x <= 14; x++) { obstacles.push({ x, y: 5 }); obstacles.push({ x, y: 14 }); }
    for (let y = 6; y <= 13; y++) { obstacles.push({ x: 5, y }); obstacles.push({ x: 14, y }); }
  } else if (id === 20) {
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        if (x % 6 === 0 && y % 2 !== 0) obstacles.push({ x, y });
        if (y % 6 === 0 && x % 2 !== 0) obstacles.push({ x, y });
      }
    }
  } else if (id > 1) {
    for (let k = 0; k < id; k++) {
      obstacles.push({ x: 4 + Math.floor(Math.random() * 12), y: 4 + Math.floor(Math.random() * 12) });
    }
  }

  return {
    id,
    name: `Sector ${id}`,
    speed,
    requiredScore,
    obstacles,
    gridSize,
    theme: `world-${paletteIndex}`,
    worldType: "ODYSSEY" as const,
    educationalType,
    colors
  };
});
