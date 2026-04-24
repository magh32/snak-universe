import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { Point, LevelConfig } from "../types";
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
      className="flex flex-col items-center justify-center min-h-screen w-full px-4 pt-4 md:pt-0"
    >
      <div className="relative group p-2 md:p-6 bg-white/5 backdrop-blur-xl rounded-[40px] border-4 md:border-8 border-white/5 shadow-2xl">
        <canvas 
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-[90vw] h-[90vw] max-w-[480px] max-h-[480px] rounded-[32px] bg-black/40 shadow-inner"
        />
        
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-game-bg/60 backdrop-blur-md rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center z-10 p-6"
            >
              <div className="glass p-8 md:p-12 rounded-[32px] md:rounded-[40px] text-center shadow-2xl w-full max-w-[280px]">
                 <h2 className="text-3xl md:text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">Paused</h2>
                 <div className="flex flex-col gap-3">
                   <button onClick={onResume} className="w-full py-4 bg-accent text-slate-900 rounded-2xl text-xl font-bold shadow-xl shadow-accent/20 active:scale-95 transition-transform">
                      RESUME
                   </button>
                   <button onClick={onExit} className="w-full py-4 bg-white/5 text-white/50 rounded-2xl hover:bg-white/10 transition-colors font-bold tracking-widest text-xs">
                      EXIT MISSION
                   </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Mobile Controls (Recalibrated for touch) */}
      <div className="mt-8 grid grid-cols-3 gap-3 md:hidden w-full max-w-[260px]">
         <div />
         <ControlKey onClick={() => onMove({ x: 0, y: -1 })} icon={<ChevronUp className="w-8 h-8" />} />
         <div />
         
         <ControlKey onClick={() => onMove({ x: -1, y: 0 })} icon={<ChevronLeft className="w-8 h-8" />} />
         <ControlKey onClick={() => onMove({ x: 0, y: 1 })} icon={<ChevronDown className="w-8 h-8" />} />
         <ControlKey onClick={() => onMove({ x: 1, y: 0 })} icon={<ChevronRight className="w-8 h-8" />} />
      </div>

      {/* Desktop Hints */}
      <div className="hidden md:flex items-center gap-8 mt-12 text-white/20 font-bold uppercase text-[9px] tracking-[0.4em]">
         <div className="flex items-center gap-2">
           <span className="px-2 py-1 glass rounded-md border border-white/5 text-white/50">ARROWS</span>
           <span>NAVIGATE</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-white/10" />
         <div className="flex items-center gap-2">
           <span className="px-2 py-1 glass rounded-md border border-white/5 text-white/50">P</span>
           <span>PAUSE</span>
         </div>
      </div>
    </motion.div>
  );
};

const ControlKey = ({ onClick, icon }: { onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onPointerDown={(e) => { e.preventDefault(); onClick(); }} 
    className="aspect-square flex items-center justify-center glass rounded-3xl shadow-xl active:scale-90 active:bg-white/10 transition-all text-accent border border-white/10"
  >
    {icon}
  </button>
);
