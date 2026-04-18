import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { Point, LevelConfig, GameStatus } from "../types";
import { renderGame } from "../lib/renderer";
import { CANVAS_SIZE } from "../constants";

interface GameCanvasProps {
  key?: string;
  snake: Point[];
  food: Point;
  level: LevelConfig;
  dir: Point;
  hasShield: boolean;
  isSlowed: boolean;
  slowTimeTimeLeft: number;
  isPaused: boolean;
  onHome: () => void;
  onExit: () => void;
  onResume: () => void;
  onMove: (dir: Point) => void;
}

export const GameCanvas = ({
  snake, food, level, dir, hasShield, isSlowed, slowTimeTimeLeft, isPaused, onHome, onExit, onResume, onMove
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderGame(ctx, canvas.width, canvas.height, snake, food, level, dir, hasShield, isSlowed, slowTimeTimeLeft);
  }, [snake, food, level, dir, hasShield, isSlowed, slowTimeTimeLeft]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center h-screen relative"
    >
      <div className="relative group p-6 bg-white/5 backdrop-blur-xl rounded-[48px] border-8 border-white/5 shadow-2xl">
        <canvas 
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-[80vw] h-[80vw] max-w-[550px] max-h-[550px] rounded-[24px] bg-canvas-bg shadow-inner"
        />
        
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-game-bg/60 backdrop-blur-md rounded-[48px] flex flex-col items-center justify-center z-10"
            >
              <div className="glass p-12 rounded-[40px] text-center shadow-2xl min-w-[300px]">
                 <h2 className="text-4xl font-black text-white mb-10 uppercase tracking-tighter italic">Paused</h2>
                 <div className="flex flex-col gap-4">
                   <button onClick={onResume} className="px-10 py-6 bg-accent text-slate-900 rounded-[24px] text-2xl font-bold shadow-xl shadow-accent/20 active:scale-95">
                      RESUME
                   </button>
                   <button onClick={onExit} className="p-6 bg-white/5 text-white/50 rounded-[24px] hover:bg-white/10 transition-colors font-bold tracking-widest text-sm">
                      EXIT MISSION
                   </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 glass px-8 py-3 rounded-full text-accent font-bold tracking-wide border border-accent/20 animate-pulse-custom pointer-events-none whitespace-nowrap">
          {level.educationalType === "NUMBERS" ? "MISSION: COLLECT THE NUMBERS" : 
           level.educationalType === "COLORS" ? "MISSION: COLLECT THE COLORS" : 
           "MISSION: COLLECT THE MAGIC FRUITS"}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="mt-20 grid grid-cols-3 gap-6 md:hidden">
         <div />
         <button onClick={() => onMove({ x: 0, y: -1 })} className="p-10 glass rounded-[32px] shadow-xl active:scale-95 text-accent"><ChevronLeft className="w-10 h-10 rotate-90" /></button>
         <div />
         <button onClick={() => onMove({ x: -1, y: 0 })} className="p-10 glass rounded-[32px] shadow-xl active:scale-95 text-accent"><ChevronLeft className="w-10 h-10" /></button>
         <button onClick={() => onMove({ x: 0, y: 1 })} className="p-10 glass rounded-[32px] shadow-xl active:scale-95 text-accent"><ChevronLeft className="w-10 h-10 -rotate-90" /></button>
         <button onClick={() => onMove({ x: 1, y: 0 })} className="p-10 glass rounded-[32px] shadow-xl active:scale-95 text-accent"><ChevronRight className="w-10 h-10" /></button>
      </div>

      {/* hints */}
      <div className="hidden lg:flex items-center gap-8 mt-20 text-white/30 font-bold uppercase text-[10px] tracking-[0.4em]">
         <div className="flex items-center gap-3">
           <div className="px-3 py-2 glass rounded-xl border border-white/10 text-white">ARROWS</div>
           <span>NAVIGATE</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-white/20" />
         <div className="flex items-center gap-3">
           <div className="px-3 py-2 glass rounded-xl border border-white/10 text-white">P</div>
           <span>SYSTEM PAUSE</span>
         </div>
      </div>
    </motion.div>
  );
};
