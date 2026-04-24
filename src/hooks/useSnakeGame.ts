import { useState, useCallback, useEffect } from "react";
import { Point, GameStatus, LevelConfig } from "../types";
import { 
  GRID_SIZE, 
  INITIAL_SNAKE, 
  INITIAL_DIR, 
  STARS_PER_REWARD,
  SCORE_PER_STAR
} from "../constants";
import { LEVELS } from "../levels";
import { useInterval } from "../lib/utils";
import { SoundService } from "../services/soundService";

export const useSnakeGame = () => {
  const [status, setStatus] = useState<GameStatus>("START");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [dir, setDir] = useState<Point>(INITIAL_DIR);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const [slowTimeTimeLeft, setSlowTimeTimeLeft] = useState(0);
  const [showShieldBreak, setShowShieldBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const level = LEVELS[currentLevelIndex];

  // Slow time countdown
  useEffect(() => {
    let timer: number;
    if (isSlowed && slowTimeTimeLeft > 0 && !isPaused) {
      timer = window.setInterval(() => {
        setSlowTimeTimeLeft(prev => {
          if (prev <= 1) {
            setIsSlowed(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSlowed, slowTimeTimeLeft, isPaused]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("snake-progress");
    if (saved) setUnlockedLevel(parseInt(saved, 10));
    const savedHS = localStorage.getItem("snake-highscore");
    if (savedHS) setHighScore(parseInt(savedHS, 10));
  }, []);

  const saveProgress = useCallback((lv: number) => {
    setUnlockedLevel(prev => {
      const next = Math.max(prev, lv);
      localStorage.setItem("snake-progress", next.toString());
      return next;
    });
  }, []);

  const spawnFood = useCallback((currentSnake: Point[], obstacles: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
      const onObstacle = obstacles.some(o => o.x === newFood.x && o.y === newFood.y);
      if (!onSnake && !onObstacle) break;
    }
    setFood(newFood);
  }, []);

  const startGame = useCallback((index: number) => {
    SoundService.resumeContext();
    setCurrentLevelIndex(index);
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIR);
    setScore(0);
    setStars(0);
    setHasShield(false);
    setIsSlowed(false);
    setSlowTimeTimeLeft(0);
    setIsPaused(false);
    spawnFood(INITIAL_SNAKE, LEVELS[index].obstacles);
    setStatus("PLAYING");
  }, [spawnFood]);

  const handleLevelComplete = useCallback(() => {
    SoundService.playLevelComplete();
    setStatus("LEVEL_COMPLETE");
    saveProgress(currentLevelIndex + 2);
  }, [currentLevelIndex, saveProgress]);

  const handleGameOver = useCallback(() => {
    SoundService.playGameOver();
    setStatus("GAME_OVER");
    setHighScore(prev => {
      const next = Math.max(prev, score);
      localStorage.setItem("snake-highscore", next.toString());
      return next;
    });
  }, [score]);

  const useShield = useCallback(() => {
    SoundService.playShieldBreak();
    setHasShield(false);
    setShowShieldBreak(true);
    setTimeout(() => setShowShieldBreak(false), 500);
  }, []);

  const moveSnake = useCallback(() => {
    if (isPaused || status !== "PLAYING") return;

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      if (hasShield) {
        useShield();
        return;
      }
      handleGameOver();
      return;
    }

    // Obstacle collision
    if (level.obstacles.some(o => o.x === head.x && o.y === head.y)) {
      if (hasShield) {
        useShield();
        return;
      }
      handleGameOver();
      return;
    }

    // Body collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      handleGameOver();
      return;
    }

    const newSnake = [head, ...snake];

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      SoundService.playEat();
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore % SCORE_PER_STAR === 0) {
        SoundService.playCollectStar();
        // Reward: Every 6 points (2nd star) give Slow Motion
        if (newScore % 6 === 0) {
          setIsSlowed(true);
          setSlowTimeTimeLeft(10);
        }

        const nextStars = stars + 1;
        if (nextStars >= STARS_PER_REWARD) {
          SoundService.playShield();
          setStars(0);
          setHasShield(true);
        } else {
          setStars(nextStars);
        }
      }

      if (newScore >= level.requiredScore) {
        handleLevelComplete();
      } else {
        spawnFood(newSnake, level.obstacles);
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, dir, food, score, stars, hasShield, isPaused, status, level, spawnFood, useShield, handleGameOver, handleLevelComplete]);

  useInterval(moveSnake, status === "PLAYING" && !isPaused 
    ? (isSlowed ? level.speed * 1.5 : level.speed) 
    : null
  );

  // Input Handling logic
  const handleDirectionChange = useCallback((newDir: Point) => {
    if (status !== "PLAYING") return;
    // Prevent 180 degree turns
    if (newDir.x !== 0 && dir.x === 0) setDir(newDir);
    if (newDir.y !== 0 && dir.y === 0) setDir(newDir);
  }, [dir, status]);

  return {
    state: {
      status, setStatus,
      currentLevelIndex, setCurrentLevelIndex,
      unlockedLevel,
      snake,
      dir,
      food,
      score,
      stars,
      hasShield,
      isSlowed,
      slowTimeTimeLeft,
      showShieldBreak,
      isPaused, setIsPaused,
      highScore,
      level
    },
    actions: {
      startGame,
      handleDirectionChange
    }
  };
};
