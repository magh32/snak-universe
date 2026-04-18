import { Point, LevelConfig } from "../types";
import { GRID_SIZE, COLORS } from "../constants";

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  snake: Point[],
  food: Point,
  level: LevelConfig,
  dir: Point,
  hasShield: boolean,
  isSlowed: boolean,
  slowTimeTimeLeft: number
) => {
  const unit = canvasWidth / GRID_SIZE;
  const colors = level.colors;

  // Background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw Grid (Subtle)
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * unit, 0);
    ctx.lineTo(i * unit, canvasHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * unit);
    ctx.lineTo(canvasWidth, i * unit);
    ctx.stroke();
  }

  // Canvas Inner Shadow (Simulated)
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

  // Draw Obstacles
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  level.obstacles.forEach(o => {
    ctx.beginPath();
    ctx.roundRect(o.x * unit + 2, o.y * unit + 2, unit - 4, unit - 4, 4);
    ctx.fill();
  });

  // Draw Food (Target)
  if (level.educationalType === "NUMBERS") {
    ctx.fillStyle = colors.accent;
    ctx.font = `bold ${unit * 0.8}px Inter`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      (Math.floor(food.x + food.y) % 10).toString(), 
      food.x * unit + unit / 2, 
      food.y * unit + unit / 2
    );
  } else if (level.educationalType === "COLORS") {
    const rainbowProps = ["#f87171", "#38bdf8", "#4ade80", "#fbbf24", "#d946ef"];
    ctx.fillStyle = rainbowProps[Math.floor(food.x + food.y) % rainbowProps.length];
    ctx.beginPath();
    ctx.arc(food.x * unit + unit / 2, food.y * unit + unit / 2, unit / 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(food.x * unit + unit / 2, food.y * unit + unit / 2, unit / 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Food sparkle
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(food.x * unit + unit / 2.5, food.y * unit + unit / 2.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw Snake
  snake.forEach((s, i) => {
    if (i === 0) {
      ctx.fillStyle = isSlowed ? COLORS.ICE_BERRY : colors.snakeHead;
      ctx.shadowBlur = hasShield ? 25 : 15;
      ctx.shadowColor = hasShield ? COLORS.SNAKE_SHIELD_GLOW : (isSlowed ? COLORS.ICE_BERRY : colors.accent);

      if (hasShield) {
        ctx.strokeStyle = COLORS.SNAKE_SHIELD_GLOW;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x * unit + unit / 2, s.y * unit + unit / 2, unit / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = isSlowed ? "#7dd3fc" : colors.snakeBody;
      ctx.shadowBlur = 0;
    }
    
    ctx.beginPath();
    const r = i === 0 ? 8 : 4;
    const padding = i === 0 ? 1 : 2;
    ctx.roundRect(s.x * unit + padding, s.y * unit + padding, unit - (padding * 2), unit - (padding * 2), r);
    ctx.fill();

    // Body Detail (Sleek pattern)
    if (i > 0 && i % 2 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.arc(s.x * unit + unit / 2, s.y * unit + unit / 2, unit / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes on head
    if (i === 0) {
      ctx.fillStyle = "white";
      ctx.shadowBlur = 0;
      if (dir.x === 1) { // Right
        drawEye(ctx, s.x * unit + unit - 8, s.y * unit + 8);
        drawEye(ctx, s.x * unit + unit - 8, s.y * unit + unit - 8);
      } else if (dir.x === -1) { // Left
        drawEye(ctx, s.x * unit + 8, s.y * unit + 8);
        drawEye(ctx, s.x * unit + 8, s.y * unit + unit - 8);
      } else if (dir.y === -1) { // Up
        drawEye(ctx, s.x * unit + 8, s.y * unit + 8);
        drawEye(ctx, s.x * unit + unit - 8, s.y * unit + 8);
      } else { // Down
        drawEye(ctx, s.x * unit + 8, s.y * unit + unit - 8);
        drawEye(ctx, s.x * unit + unit - 8, s.y * unit + unit - 8);
      }
    }
  });

  // Draw Slow Time Countdown Overlay (Simple)
  if (isSlowed) {
    ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = COLORS.ICE_BERRY;
    ctx.font = "bold 24px Inter";
    ctx.textAlign = "center";
    ctx.fillText(`SLOW MOTION: ${slowTimeTimeLeft}s`, canvasWidth / 2, 40);
  }
};

const drawEye = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
};
