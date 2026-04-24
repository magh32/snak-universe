import { LevelConfig, Point, Difficulty } from "./types";

const generateBox = (x1: number, y1: number, x2: number, y2: number): Point[] => {
  const points: Point[] = [];
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      points.push({ x, y });
    }
  }
  return points;
};

export const generateLevels = (difficulty: Difficulty): LevelConfig[] => {
  const speedMultiplier = difficulty === "EASY" ? 1.2 : difficulty === "HARD" ? 0.8 : 1.0; // Higher is slower for speed (ms)
  const obstacleMultiplier = difficulty === "EASY" ? 0.5 : difficulty === "HARD" ? 1.5 : 1.0;
  const scoreMultiplier = difficulty === "EASY" ? 0.8 : difficulty === "HARD" ? 1.2 : 1.0;

  return Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const baseSpeed = Math.max(80, 250 - (i * 8));
    const speed = Math.floor(baseSpeed * speedMultiplier);
    const requiredScore = Math.ceil((5 + (i * 2)) * scoreMultiplier);
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

    let baseObstacles: Point[] = [];
    
    if (id === 2) {
      baseObstacles = [{ x: 5, y: 5 }, { x: 5, y: 14 }, { x: 14, y: 5 }, { x: 14, y: 14 }];
    } else if (id === 5) {
      for (let x = 4; x <= 15; x++) { baseObstacles.push({ x, y: 7 }); baseObstacles.push({ x, y: 12 }); }
    } else if (id === 8) {
      for (let y = 4; y <= 15; y++) { baseObstacles.push({ x: 7, y }); baseObstacles.push({ x: 12, y }); }
    } else if (id === 10) {
      for (let i = 4; i <= 15; i++) { baseObstacles.push({ x: 10, y: i }); baseObstacles.push({ x: i, y: 10 }); }
    } else if (id === 12) {
      baseObstacles = [...generateBox(4, 4, 6, 6), ...generateBox(13, 4, 15, 6), ...generateBox(4, 13, 6, 15), ...generateBox(13, 13, 15, 15)];
    } else if (id === 15) {
      for (let x = 2; x <= 17; x++) {
         if (x % 4 === 0) for (let y = 0; y < 14; y++) baseObstacles.push({ x, y });
         if (x % 4 === 2) for (let y = 6; y < 20; y++) baseObstacles.push({ x, y });
      }
    } else if (id === 18) {
      for (let x = 5; x <= 14; x++) { baseObstacles.push({ x, y: 5 }); baseObstacles.push({ x, y: 14 }); }
      for (let y = 6; y <= 13; y++) { baseObstacles.push({ x: 5, y }); baseObstacles.push({ x: 14, y }); }
    } else if (id === 20) {
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          if (x % 6 === 0 && y % 2 !== 0) baseObstacles.push({ x, y });
          if (y % 6 === 0 && x % 2 !== 0) baseObstacles.push({ x, y });
        }
      }
    } else if (id > 1) {
      const count = Math.floor(id * obstacleMultiplier);
      for (let k = 0; k < count; k++) {
        baseObstacles.push({ x: 4 + Math.floor(Math.random() * 12), y: 4 + Math.floor(Math.random() * 12) });
      }
    }

    // Apply multiplier to predefined obstacles too?
    let obstacles = baseObstacles;
    if (difficulty === "EASY") {
       obstacles = baseObstacles.filter((_, idx) => idx % 2 === 0);
    } else if (difficulty === "HARD") {
       // Add some procedural noise
       const noise: Point[] = [];
       for (let k = 0; k < 5; k++) {
         noise.push({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
       }
       obstacles = [...baseObstacles, ...noise];
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
};

export const LEVELS = generateLevels("MEDIUM");
