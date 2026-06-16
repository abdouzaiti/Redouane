import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Zap, Heart, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BirthdayGameProps {
  onGameComplete: () => void;
  playTone: (noteName: string) => void;
}

interface GameObject {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'cake' | 'star' | 'candy' | 'bug';
  speed: number;
  size: number;
}

export default function BirthdayGame({ onGameComplete, playTone }: BirthdayGameProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const objectIdRef = useRef<number>(0);

  // Sync references to completely avoid React state overhead in render cycles
  const paddleXRef = useRef(50); // percentage 0-100
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const objectsRef = useRef<GameObject[]>([]);
  const isPlayingRef = useRef(false);
  const hasWonRef = useRef(false);

  // Score target
  const TARGET_SCORE = 19;

  // Sound notes scale
  const GAME_NOTES = ['C4', 'E4', 'G4', 'C5'];
  const BUG_NOTES = ['F4', 'D4'];

  const startGame = () => {
    paddleXRef.current = 50;
    scoreRef.current = 0;
    livesRef.current = 3;
    objectsRef.current = [];
    isPlayingRef.current = true;
    hasWonRef.current = false;

    setScore(0);
    setLives(3);
    setHasWon(false);
    setIsPlaying(true);
    lastSpawnRef.current = Date.now();
  };

  // Paddle control with mouse and mobile touch drag
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlayingRef.current || hasWonRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Support multi-touch client coordinates cleanly
    const clientX = e.clientX;
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    
    // Clamp inside readable boundaries
    paddleXRef.current = Math.max(8, Math.min(92, relativeX));
  };

  // Touch handlers specifically optimized for small mobile targets
  const handleTouchMove = (e: TouchEvent) => {
    if (!isPlayingRef.current || hasWonRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      const relativeX = ((touch.clientX - rect.left) / rect.width) * 100;
      paddleXRef.current = Math.max(8, Math.min(92, relativeX));
    }
  };

  // Keyboard control fallback for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current || hasWonRef.current) return;
      if (e.key === 'ArrowLeft') {
        paddleXRef.current = Math.max(8, paddleXRef.current - 8);
      } else if (e.key === 'ArrowRight') {
        paddleXRef.current = Math.min(92, paddleXRef.current + 8);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main high speed canvas game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with high device pixel ratio support for screens
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = () => {
      if (!isPlayingRef.current || hasWonRef.current) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // 1. Clear Canvas of previous frame
      ctx.clearRect(0, 0, width, height);

      // Draw horizontal sleek laser guideline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.85);
      ctx.lineTo(width, height * 0.85);
      ctx.stroke();

      const now = Date.now();
      
      // 2. Spawn elements with slower interval timing for pleasant gameplay
      if (now - lastSpawnRef.current > 1100) {
        const types: GameObject['type'][] = ['star', 'candy', 'cake', 'bug'];
        // Weights: bug probability lowered to 10% for easier mobile playing, pastries at 90%
        const weights = [0.45, 0.3, 0.15, 0.10]; 
        
        let r = Math.random();
        let selectedType: GameObject['type'] = 'star';
        for (let i = 0; i < types.length; i++) {
          r -= weights[i];
          if (r <= 0) {
            selectedType = types[i];
            break;
          }
        }

        // Gentler slow speeds for a highly pleasant gaming experience!
        const slowSpeed = 0.8 + Math.random() * 0.7;

        const newObj: GameObject = {
          id: objectIdRef.current++,
          x: 8 + Math.random() * 84,
          y: -5,
          type: selectedType,
          speed: slowSpeed,
          size: selectedType === 'cake' ? 32 : 24,
        };

        objectsRef.current.push(newObj);
        lastSpawnRef.current = now;
      }

      // 3. Move and evaluate collisions
      const remaining: GameObject[] = [];
      let scoreOffset = 0;
      let livesOffset = 0;

      // Catcher platform dimension parameters
      // Catcher is located at y = 85% of height. Responsive width is 26% on mobile (broad touch target target)
      const isMobile = width < 500;
      const paddlePctWidth = isMobile ? 30 : 25; // 30% width makes it super easy to catch with thumbs!
      const paddleHalfWidth = paddlePctWidth / 2;

      objectsRef.current.forEach((obj) => {
        const nextY = obj.y + obj.speed;

        // Skip if missed and fallen past screen bottom
        if (nextY > 105) {
          return;
        }

        // Check plate collision zone (y range between 82% and 88% of vertical view)
        const isYHit = nextY >= 82 && nextY <= 88;
        const isXHit = Math.abs(obj.x - paddleXRef.current) < (paddleHalfWidth + 2);

        if (isYHit && isXHit) {
          if (obj.type === 'bug') {
            livesOffset -= 1;
            playTone(BUG_NOTES[Math.floor(Math.random() * BUG_NOTES.length)]);
          } else {
            let pts = 1;
            if (obj.type === 'cake') pts = 2; // Extra reward for pastries
            scoreOffset += pts;
            playTone(GAME_NOTES[Math.floor(Math.random() * GAME_NOTES.length)]);
          }
          return; // Item caught and consumed
        }

        remaining.push({ ...obj, y: nextY });

        // DRAW OBJECT ON CANVAS directly (highly optimized)
        let emoji = '⭐';
        if (obj.type === 'candy') emoji = '🍬';
        else if (obj.type === 'cake') emoji = '🍰';
        else if (obj.type === 'bug') emoji = '🐞';

        const rx = (obj.x / 100) * width;
        const ry = (obj.y / 100) * height;

        ctx.save();
        ctx.font = `${obj.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow effect for dangerous bugs so they are extremely obvious
        if (obj.type === 'bug') {
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 3;
        }
        
        ctx.fillText(emoji, rx, ry);
        ctx.restore();
      });

      objectsRef.current = remaining;

      // 4. Update core react states only on change to avoid frame lag spikes!
      if (scoreOffset !== 0) {
        const nextScore = Math.max(0, scoreRef.current + scoreOffset);
        scoreRef.current = nextScore;
        setScore(nextScore);

        if (nextScore >= TARGET_SCORE) {
          hasWonRef.current = true;
          isPlayingRef.current = false;
          setHasWon(true);
          setIsPlaying(false);
          setTimeout(() => {
            onGameComplete();
          }, 2000);
          return;
        }
      }

      if (livesOffset !== 0) {
        const nextLives = Math.max(0, livesRef.current + livesOffset);
        livesRef.current = nextLives;
        setLives(nextLives);

        if (nextLives <= 0) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          return;
        }
      }

      // 5. DRAW CATCHER PLATFORM
      const pX = (paddleXRef.current / 100) * width;
      const pY = height * 0.85;
      const pW = (paddlePctWidth / 100) * width;
      const pH = 12;

      ctx.save();
      // Plate base gradient
      const grad = ctx.createLinearGradient(pX - pW/2, pY, pX + pW/2, pY);
      grad.addColorStop(0, '#0ea5e9'); // cyan-500
      grad.addColorStop(0.5, '#6366f1'); // indigo-500
      grad.addColorStop(1, '#0ea5e9');
      
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = grad;
      
      // Draw smooth rounded plate
      ctx.beginPath();
      ctx.roundRect(pX - pW/2, pY, pW, pH, 6);
      ctx.fill();

      // Top plate boundary highlight line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Fun responsive text decor inside catcher plate
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText('🎂 CATCH!', pX, pY + 6);
      ctx.restore();

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    // Setup direct mobile touch interaction for quick feedback
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isPlaying, hasWon]);

  return (
    <div 
      ref={containerRef}
      className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-3xl relative overflow-hidden flex flex-col justify-between h-[420px] max-w-sm mx-auto select-none"
    >
      {/* Sleek matrix/AMOLED grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] opacity-40 pointer-events-none" />

      {/* AMOLED Top Header info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-1.5 z-10 font-mono">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>sys_game.bin</span>
          </span>
          <span className="text-[8px] text-slate-500">Reach age {TARGET_SCORE}</span>
        </div>

        {/* Live HUD */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-1 text-yellow-400 font-bold">
            <Star className="w-3 h-3 fill-current" />
            <span>Score: <b className="text-white font-mono">{score}</b>/{TARGET_SCORE}</span>
          </span>

          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-0.5">
            {Array(3).fill(null).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-3 h-3 ${i < lives ? 'fill-current text-rose-500' : 'text-slate-800'}`} 
              />
            ))}
          </span>
        </div>
      </div>

      {/* Main Game Interface Area with Canvas */}
      <div 
        onPointerMove={handlePointerMove}
        className="relative flex-1 bg-black rounded-xl overflow-hidden border border-slate-900 cursor-crosshair select-none z-10 flex flex-col justify-center items-center"
      >
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block"
        />

        <AnimatePresence mode="wait">
          {!isPlaying && !hasWon ? (
            <motion.div 
              key="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-black/95 z-20 font-mono"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-2.5">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5 uppercase tracking-wide">🕹️ Radouane Age Arcade</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mb-4 leading-relaxed px-2">
                Slide your finger left/right to catch falling treats and reach <b className="text-cyan-400 font-bold">19</b> points. Avoid the harmful red bugs (🐞)!
              </p>
              
              <button
                onClick={startGame}
                className="py-2 px-5 text-[10px] font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition rounded-full shadow-lg shadow-amber-500/10 cursor-pointer uppercase"
              >
                Launch Easy Link Play
              </button>
            </motion.div>
          ) : hasWon ? (
            <motion.div 
              key="win-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-black/95 z-20 font-mono"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mb-2 text-xl"
              >
                🎉
              </motion.div>
              <h4 className="text-sm font-bold text-emerald-400 mb-1 tracking-wider uppercase">V19 SUCCESS!</h4>
              <p className="text-[10px] text-slate-300">
                You collected all {TARGET_SCORE} memories!
              </p>
              <div className="mt-3 px-2.5 py-0.5 bg-slate-950 border border-slate-900 text-[8px] text-cyan-400 rounded animate-pulse">
                INITIALIZING THE CANDLES BLOW MODULE...
              </div>
            </motion.div>
          ) : lives <= 0 ? (
            <motion.div 
              key="gameover-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-black/95 z-20 font-mono"
            >
              <span className="text-3xl mb-2">👾</span>
              <h4 className="text-rose-500 text-xs font-bold uppercase tracking-wider">System Crash Detected</h4>
              <p className="text-[9px] text-slate-400 mt-1 max-w-xs leading-relaxed px-2">
                Too many development bugs crashed the timeline! Let's restart with zero lag performance.
              </p>
              <button
                onClick={startGame}
                className="mt-3.5 py-1.5 px-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-[9px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload Loop Session</span>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom control tutorial tip */}
      <div className="z-10 font-mono text-[9px] text-slate-600 text-center mt-1.5 flex justify-center items-center gap-2">
        <span className="p-0.5 bg-slate-900 rounded border border-slate-850">👈 Slide thumb to catch 👉</span>
      </div>
    </div>
  );
}
