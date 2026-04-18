import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  RotateCcw, 
  Gamepad2, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Pause,
} from "lucide-react";
import { cn } from "./lib/utils";
import { LEVELS } from "./levels";
import { useSnakeGame } from "./hooks/useSnakeGame";
import { GameCanvas } from "./components/GameCanvas";

export default function App() {
  const { state, actions } = useSnakeGame();
  const { 
    status, setStatus,
    currentLevelIndex, 
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
  } = state;

  const { startGame, handleDirectionChange } = actions;

  // Keyboard & TV Remote controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const keyCode = e.keyCode;
      const code = e.code;
      
      // LOGGING FOR DEBUG (Visible in console during dev)
      console.log(`Key: ${key}, Code: ${code}, KeyCode: ${keyCode}`);

      // Expanded Android TV / Echolink Key Codes
      const isUp = key === "ArrowUp" || key === "Up" || keyCode === 38 || keyCode === 19;
      const isDown = key === "ArrowDown" || key === "Down" || keyCode === 40 || keyCode === 20;
      const isLeft = key === "ArrowLeft" || key === "Left" || keyCode === 37 || keyCode === 21;
      const isRight = key === "ArrowRight" || key === "Right" || keyCode === 39 || keyCode === 22;
      
      // OK / Confirm button on Echolink can be 13 (Enter), 23 (DPAD_CENTER), or 66 (ENTER on some Androids)
      const isConfirm = key === "Enter" || key === "OK" || key === "Select" || 
                        keyCode === 13 || keyCode === 23 || keyCode === 66 || keyCode === 160;
      
      const isPause = key === "p" || key === "P" || keyCode === 179 || keyCode === 80;

      if (status === "PLAYING") {
        // Force prevent default for ALL navigation keys to stop TV from moving focus
        if (isUp || isDown || isLeft || isRight || isConfirm) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (isUp) handleDirectionChange({ x: 0, y: -1 });
        else if (isDown) handleDirectionChange({ x: 0, y: 1 });
        else if (isLeft) handleDirectionChange({ x: -1, y: 0 });
        else if (isRight) handleDirectionChange({ x: 1, y: 0 });
        else if (isPause) setIsPaused(prev => !prev);
      } else {
          // In menus, OK/Confirm starts the game
          if (isConfirm) {
            e.preventDefault();
            e.stopPropagation();
            if (status === "START") setStatus("LEVEL_SELECT");
            else if (status === "GAME_OVER") startGame(currentLevelIndex);
            else if (status === "LEVEL_COMPLETE") {
               if (currentLevelIndex < LEVELS.length - 1) {
                  startGame(currentLevelIndex + 1);
                } else {
                  setStatus("ALL_COMPLETE");
                }
            }
          }
      }
    };

    // TV TRAP: Ensure the app captures focus
    const focusInterval = setInterval(() => {
      if (document.activeElement?.tagName !== "INPUT") {
         window.focus();
      }
    }, 1000);
    
    window.addEventListener("keydown", handleKeyDown, { capture: true, passive: false });
    return () => {
      clearInterval(focusInterval);
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleDirectionChange, status, setIsPaused, currentLevelIndex, startGame, setStatus]);

  return (
    <div 
      className="min-h-screen bg-game-bg font-sans text-white overflow-hidden select-none outline-none"
      tabIndex={0} // Makes the whole app focusable for TV browsers
    >
      
      {/* Floating Info Elements (Replacing the obstructive HUD bar) */}
      {status === "PLAYING" && (
        <>
          <div className="fixed top-8 left-8 z-50 flex flex-col gap-2">
            <button onClick={() => setStatus("START")} className="p-3 glass rounded-2xl text-accent hover:scale-110 transition-transform w-fit border border-white/10 shadow-xl">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block -mb-1">Sector</span>
              <span className="text-xl font-black text-accent font-mono tracking-tighter">{level.id}</span>
            </div>
          </div>

          <div className="fixed top-8 right-8 z-50 flex flex-col items-end gap-2">
            <button onClick={() => setIsPaused(!isPaused)} className="p-4 glass rounded-2xl text-accent hover:scale-110 transition-transform shadow-xl border border-white/10">
              {isPaused ? <Play className="w-8 h-8 fill-accent" /> : <Pause className="w-8 h-8" />}
            </button>
            <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-xl text-right">
              <span className="text-[10px] font-bold uppercase text-white/50 block -mb-1">Score</span>
              <span className="text-2xl font-black text-accent font-mono italic">{score.toString().padStart(5, '0')}</span>
            </div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-4 h-4 transition-all duration-300", 
                    i < stars ? "fill-accent text-accent" : "text-white/10"
                  )} 
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Global Overlays (Flash Effects) */}
      <AnimatePresence>
        {showShieldBreak && (
          <motion.div 
            key="shield-break-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[60] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Screens */}
      <AnimatePresence mode="wait">
        
        {/* START SCREEN */}
        {status === "START" && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center h-screen px-6 text-center"
          >
            <div className="relative mb-8">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="absolute -inset-12 bg-accent/20 rounded-full blur-3xl"
               />
               <Gamepad2 className="w-32 h-32 text-accent relative drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
            </div>
            <h1 className="text-[10vw] lg:text-9xl font-black mb-4 leading-none tracking-tighter italic">SNAKE<br/><span className="text-accent underline underline-offset-8">ODYSSEY</span></h1>
            <p className="text-white/40 mb-12 max-w-md mx-auto text-lg font-medium tracking-wide uppercase">Mission: Navigate 20 levels of digital danger</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button 
                onClick={() => setStatus("LEVEL_SELECT")}
                className="flex-1 px-12 py-8 bg-accent text-slate-900 rounded-[32px] text-3xl font-black shadow-2xl shadow-accent/40 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-4"
              >
                START <Play className="fill-slate-900 w-8 h-8" />
              </button>
            </div>
            <div className="mt-12 p-6 glass rounded-2xl flex items-center gap-4">
              <Star className="text-accent w-8 h-8 fill-accent" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-white/30 uppercase block">Personal Record</span>
                <span className="text-2xl font-black text-white italic">{highScore.toString().padStart(5, '0')}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* LEVEL SELECT */}
        {status === "LEVEL_SELECT" && (
          <motion.div 
            key="level_select"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-screen flex flex-col p-12 bg-game-bg"
          >
            <div className="flex justify-between items-end mb-16 px-4">
              <div>
                <h2 className="text-7xl font-black italic tracking-tighter mb-2 text-white">SELECT<br/><span className="text-accent">SECTOR</span></h2>
                <p className="text-white/30 font-bold uppercase tracking-[0.3em]">Choose your flight path</p>
              </div>
              <button 
                onClick={() => setStatus("START")}
                className="p-8 glass rounded-[32px] hover:bg-white/10 transition-colors text-white"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 lg:grid-cols-4 gap-6 pb-20 max-w-7xl mx-auto w-full">
              {LEVELS.map((lv, i) => {
                const isLocked = lv.id > unlockedLevel;
                return (
                  <button
                    key={i}
                    disabled={isLocked}
                    onClick={() => startGame(i)}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-[40px] transition-all group overflow-hidden
                      ${isLocked ? 'bg-white/5 opacity-50 cursor-not-allowed border border-dashed border-white/20' : 'glass hover:bg-white/10 hover:border-accent/40'}
                    `}
                  >
                    {!isLocked && (
                      <div className="absolute top-4 right-4 flex gap-0.5">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                      </div>
                    )}
                    <span className={`text-6xl font-black mb-2 ${isLocked ? 'text-white/20' : 'text-accent group-hover:scale-125 transition-transform italic'}`}>
                      {lv.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 text-white">
                      {isLocked ? 'Encrypted' : 'Ready'}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* PLAYING SCREEN */}
        {status === "PLAYING" && (
          <GameCanvas 
            key="playing-canvas"
            snake={snake}
            food={food}
            level={level}
            dir={dir}
            hasShield={hasShield}
            isSlowed={isSlowed}
            slowTimeTimeLeft={slowTimeTimeLeft}
            isPaused={isPaused}
            onHome={() => setStatus("START")}
            onExit={() => setStatus("LEVEL_SELECT")}
            onResume={() => setIsPaused(false)}
            onMove={handleDirectionChange}
          />
        )}

        {/* LEVEL COMPLETE */}
        {status === "LEVEL_COMPLETE" && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-game-bg/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center"
          >
             <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative inline-block mb-12"
                >
                  <Trophy className="w-32 h-32 text-accent drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10 }}
                    className="absolute -inset-8 border-2 border-dashed border-accent/20 rounded-full"
                  />
                </motion.div>
                <h1 className="text-8xl font-black text-white mb-4 tracking-tighter italic leading-none">SECTOR<br/><span className="text-accent underline">SECURED</span></h1>
                <p className="text-lg text-white/40 mb-12 font-bold tracking-widest uppercase">Score: {score} // Sector {level.id}</p>
                <div className="flex gap-4 max-w-md mx-auto">
                   <button 
                    onClick={() => setStatus("LEVEL_SELECT")}
                    className="flex-1 p-8 glass rounded-[32px] text-white/50 font-bold hover:bg-white/10"
                   >
                     EXIT
                  </button>
                  <button 
                    onClick={() => {
                      if (currentLevelIndex < LEVELS.length - 1) {
                        startGame(currentLevelIndex + 1);
                      } else {
                        setStatus("ALL_COMPLETE");
                      }
                    }}
                    className="flex-[2] py-8 bg-accent text-slate-900 rounded-[32px] text-2xl font-black shadow-2xl shadow-accent/40 active:scale-95 flex items-center justify-center gap-4"
                  >
                    NEXT SECTOR <ChevronRight className="w-8 h-8" />
                  </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* GAME OVER */}
        {status === "GAME_OVER" && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/10 backdrop-blur-3xl z-50 flex flex-col items-center justify-center"
          >
             <div className="text-center p-12 glass rounded-[60px] border-4 border-red-500/20 max-w-xl">
                <h1 className="text-8xl font-black text-white mb-4 tracking-tighter italic leading-none">SYSTEM<br/><span className="text-red-500">FAILED</span></h1>
                <p className="text-lg text-white/40 mb-12 font-bold tracking-widest uppercase">Sector {level.id} // Connection Lost</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStatus("LEVEL_SELECT")}
                    className="flex-1 p-8 glass rounded-[32px] text-white/50 font-bold hover:bg-white/10"
                  >
                    DISCONNECT
                  </button>
                  <button 
                    onClick={() => startGame(currentLevelIndex)}
                    className="flex-[2] py-8 bg-accent text-slate-900 rounded-[32px] text-2xl font-black shadow-2xl shadow-accent/40 active:scale-95 flex items-center justify-center gap-4"
                  >
                    RETRY <RotateCcw className="w-8 h-8" />
                  </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* ALL COMPLETE */}
        {status === "ALL_COMPLETE" && (
           <motion.div 
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-accent/20 backdrop-blur-[100px] z-50 flex flex-col items-center justify-center overflow-hidden"
          >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-accent/10 to-transparent" />
              <div className="relative text-center px-4">
                <div className="mb-20">
                  <div className="relative inline-block">
                    <Trophy className="w-48 h-48 text-accent drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]" />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} 
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute -top-6 -right-6 bg-white text-slate-900 p-6 rounded-full shadow-2xl"
                    >
                      <Star className="w-12 h-12 fill-slate-900" />
                    </motion.div>
                  </div>
                </div>
                <h1 className="text-8xl font-black text-white mb-8 leading-none tracking-tighter italic">ODYSSEY<br/><span className="text-accent underline underline-offset-[20px] decoration-white/10">MASTERED</span></h1>
                <p className="text-2xl text-white/60 mb-16 max-w-md mx-auto leading-relaxed font-medium">
                  Elite status achieved. You have navigated every digital landscape in the Odyssey.
                </p>
                <button 
                  onClick={() => setStatus("START")}
                  className="px-24 py-10 bg-accent text-slate-900 rounded-[40px] text-4xl font-black shadow-2xl shadow-accent/40 hover:scale-105 transition-transform active:scale-95"
                >
                  FINISH
                </button>
              </div>
           </motion.div>
        )}

      </AnimatePresence>

      {/* Sleek Design Accent */}
      <div className="fixed top-12 left-12 pointer-events-none hidden lg:block">
         <div className="flex flex-col gap-1 items-start">
            <div className="w-12 h-1 bg-accent" />
            <div className="w-8 h-1 bg-white/20" />
            <div className="w-4 h-1 bg-white/10" />
         </div>
      </div>

      <div className="fixed bottom-12 right-12 pointer-events-none opacity-40 hidden lg:block text-right">
        <div className="text-[10px] font-black text-white tracking-[0.5em] uppercase mb-1">ODYSSEY_OS v4.0</div>
        <div className="text-[8px] font-bold text-accent tracking-[0.3em] uppercase">SYSTEM_STABLE // PREPARED</div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-game-bg { background-color: #1a2a3a; }
        .text-accent { color: #4ade80; }
        .bg-accent { background-color: #4ade80; }
        .bg-food { background-color: #f87171; }
        .text-food { color: #f87171; }
        .bg-canvas-bg { background-color: #0f172a; }
        .decoration-accent { text-decoration-color: #4ade80; }
      `}</style>

    </div>
  );
}
