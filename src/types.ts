export type Point = { x: number; y: number };

export type PowerUpType = "SHIELD" | "SLOW_TIME" | "DOUBLE_POINTS";

export interface PowerUp {
  type: PowerUpType;
  duration: number; // in seconds
  active: boolean;
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface LevelConfig {
  id: number;
  name: string;
  speed: number;
  requiredScore: number;
  obstacles: Point[];
  gridSize: { width: number; height: number };
  theme: string;
  worldType: "CLASSIC" | "ODYSSEY" | "INFINITE";
  educationalType: "CLASSIC" | "NUMBERS" | "COLORS";
  colors: {
    snakeHead: string;
    snakeBody: string;
    background: string;
    accent: string;
  };
}

export type GameStatus = 
  | "START" 
  | "LEVEL_SELECT" 
  | "PLAYING" 
  | "PAUSED" 
  | "LEVEL_COMPLETE" 
  | "GAME_OVER" 
  | "ALL_COMPLETE"
  | "SHOP"; // Future shop screen

export interface GameState {
  snake: Point[];
  dir: Point;
  food: Point;
  score: number;
  stars: number;
  hasShield: boolean;
  status: GameStatus;
  currentLevelIndex: number;
}
