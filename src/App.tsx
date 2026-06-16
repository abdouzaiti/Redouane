import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { RetroSynth } from './utils/audio';
import ConfettiCanvas from './components/ConfettiCanvas';
import BirthdayGame from './components/BirthdayGame';
import DigitalCake from './components/DigitalCake';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  CheckCircle,
  Cpu,
  ArrowRight,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation story phases: 'welcome' -> 'game' -> 'blow' -> 'reveal'
  const [phase, setPhase] = useState<'welcome' | 'game' | 'blow' | 'reveal'>('welcome');
  
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [activeNoteIdx, setActiveNoteIdx] = useState(-1);
  
  // Checking image load
  const [imgLoadError, setImgLoadError] = useState(false);

  // Sound Synth Ref
  const synthRef = useRef<RetroSynth | null>(null);
  if (!synthRef.current) {
    synthRef.current = new RetroSynth();
  }

  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.setCallbacks(
      (noteName, index) => {
        setCurrentNote(noteName);
        setActiveNoteIdx(index);
      },
      () => {
        setIsPlaying(false);
        setCurrentNote('');
        setActiveNoteIdx(-1);
      }
    );

    // Auto-unlock audio and play on first interaction anywhere in the window
    const handleFirstInteraction = () => {
      if (synth && !synth.isCurrentlyPlaying()) {
        synth.unlock();
        synth.play(130);
        setIsPlaying(true);
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      synth.stop();
      cleanup();
    };
  }, []);

  const triggerConfetti = () => {
    setBurstTrigger((prev) => prev + 1);
  };

  const handlePlayMusic = () => {
    const synth = synthRef.current;
    if (!synth) return;

    if (isPlaying) {
      synth.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      synth.play(130);
      triggerConfetti();
    }
  };

  const handlePlaySingleTone = (note: string) => {
    synthRef.current?.playSingleNote(note);
    triggerConfetti();
  };

  const handleLevelCleared = () => {
    triggerConfetti();
    triggerConfetti();
    setTimeout(() => {
      setPhase('blow');
    }, 2000);
  };

  const handleAllCandlesExtinguished = () => {
    triggerConfetti();
    triggerConfetti();
    triggerConfetti();
    
    setTimeout(() => {
      setPhase('reveal');
    }, 1500);
  };

  useEffect(() => {
    if (phase === 'reveal') {
      const synth = synthRef.current;
      if (synth && !synth.isCurrentlyPlaying()) {
        synth.unlock();
        setIsPlaying(true);
        synth.play(130);
        triggerConfetti();
      }
    }
  }, [phase]);

  const synthMelody = synthRef.current?.getNotes() || [];

  return (
    <div className="min-h-screen bg-black font-sans text-slate-100 flex flex-col relative select-text selection:bg-cyan-500/30 overflow-hidden pb-10">
      
      {/* Background decoration canvas particles */}
      <ConfettiCanvas burstTriggerValue={burstTrigger} />

      {/* Cyber/Terminal scanline overlay for atmospheric coding theme */}
      <div className="absolute inset-0 pointer-events-none scanline z-0 opacity-15 w-full h-full" />

      {/* Futuristic Deep Accent Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-indigo-950/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60vw] h-[65vw] rounded-full bg-emerald-950/20 blur-[140px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="relative w-full max-w-7xl mx-auto px-4 pt-6 z-10 border-b border-slate-900/60 pb-4 flex justify-end items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayMusic}
            id="sound-toggle-btn"
            className={`py-1 px-3 rounded-full font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer select-none border ${
              isPlaying
                ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'bg-slate-950 hover:bg-slate-900 text-slate-500 border-slate-900'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>SOUND ON (LOOP)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                <span>SOUND MUTED</span>
              </>
            )}
          </button>
          <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
            Gifted by @Abdou
          </span>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 mt-6 z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: THE WELCOME PITCH BLACK GATEWAY */}
          {phase === 'welcome' && (
            <motion.div
              key="welcome-flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-xl w-full bg-slate-950 border border-slate-900 rounded-xl p-8 shadow-2xl relative overflow-hidden font-mono text-center flex flex-col items-center gap-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111726_1px,transparent_1px),linear-gradient(to_bottom,#111726_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />
              
              <div className="z-10 flex flex-col items-center gap-3">
                <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight mt-2 font-sans">
                  Compiled Gift for <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Radouane</span>
                </h1>
                
                <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                  Hey Radouane! Your developer friend <b className="text-slate-250">Abdou</b> built a tailor-made birthday experience for you. 
                  Unlock your v19 runtime now!
                </p>
              </div>

              {/* Developer terminal visual effect */}
              <div className="w-full bg-black/80 border border-slate-900 p-4 rounded-lg text-left text-[11px] text-slate-300 space-y-1.5 z-10 select-none">
                <div className="text-slate-500">// Life compiler package initializing</div>
                <div><span className="text-sky-400 font-bold">git clone</span> repository://radouane/memories</div>
                <div><span className="text-yellow-400 font-bold">npm install</span> wisdom happiness coffee --save</div>
                <div><span className="text-emerald-400 font-bold">Successfully compiled</span> lifespan_refactor.ts</div>
                <div className="text-pink-400 animate-pulse font-bold">Status: [Ready to launch age-up game]</div>
              </div>

              <button
                onClick={() => {
                  synthRef.current?.unlock();
                  setPhase('game');
                  triggerConfetti();
                  setTimeout(() => {
                    const synth = synthRef.current;
                    if (synth && !synth.isCurrentlyPlaying()) {
                      synth.play(130);
                      setIsPlaying(true);
                    }
                  }, 100);
                }}
                className="z-10 w-full py-3 px-6 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transform active:scale-98 transition duration-150 cursor-pointer"
              >
                <span>Boot Gift Protocol v19.0.0</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* PHASE 2: THE INTERACTIVE ARCADE GAME */}
          {phase === 'game' && (
            <motion.div
              key="game-flow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-4 font-mono">
                <span className="text-[10px] text-cyan-400 tracking-widest uppercase font-bold">Step 1 of 3: Refactoring Memory Bank</span>
                <h2 className="text-xl font-bold text-white mt-1">Play the 19 Age-Up collector game!</h2>
              </div>
              <BirthdayGame 
                onGameComplete={handleLevelCleared} 
                playTone={handlePlaySingleTone} 
              />
            </motion.div>
          )}

          {/* PHASE 3: THE BIRTHDAY CAKE EXTINCTION SYSTEM */}
          {phase === 'blow' && (
            <motion.div
              key="blow-flow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full"
            >
              <div className="text-center mb-4 font-mono">
                <span className="text-[10px] text-orange-400 tracking-widest uppercase font-bold">Step 2 of 3: The Candles Chamber</span>
                <h2 className="text-xl font-bold text-white mt-1">Make a wish & blow out the candles!</h2>
              </div>
              <DigitalCake
                onCandleBlow={triggerConfetti}
                onAllCandlesExtinguished={handleAllCandlesExtinguished}
                playTone={handlePlaySingleTone}
              />
            </motion.div>
          )}

          {/* PHASE 4: THE ULTIMATE PHOTO REVIEW AND CELEBRATION SHOWCASE */}
          {phase === 'reveal' && (
            <motion.div
              key="reveal-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-6"
            >
              {/* TOP SPOTLIGHT */}
              <div className="text-center space-y-1 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-550/30 rounded-full text-emerald-400 font-mono text-[10px] tracking-wider animate-pulse">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>TRANSACTION FULLY COMPILED AND STABLE!</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text tracking-tight uppercase">
                  🎉 happy birthday radouane! 🎉
                </h1>
                <p className="text-sm font-mono text-slate-400 max-w-lg mx-auto">
                  You successfully reached <span className="text-cyan-400 font-bold">Age 19</span>! May your compilation remain warning-free and full of outstanding logic.
                </p>
              </div>

              {/* CORE DASHBOARD OF REVELATION */}
              <div className="flex justify-center w-full max-w-md mx-auto items-center">
                
                {/* 1. PHOTO RENDER FRAME */}
                <div className="w-full flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#111726_1px,transparent_1px),linear-gradient(to_bottom,#111726_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-25 pointer-events-none" />
                  
                  {/* Hologram Light rays */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  
                  <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between z-10">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <User className="w-3.5 h-3.5" />
                      <span>radouane_photo_viewer.dll</span>
                    </span>
                    <span>19.0.0 stable</span>
                  </div>

                  {/* Picture container (fallback logic if error) */}
                  <div className="relative w-full aspect-[4/5] rounded-lg bg-black border border-slate-850 flex flex-col items-center justify-center p-3 z-10 overflow-hidden shadow-inner group">
                    
                    {!imgLoadError ? (
                      <img
                        src="/pic.png"
                        alt="Radouane"
                        referrerPolicy="no-referrer"
                        onError={() => setImgLoadError(true)}
                        className="w-full h-full object-cover rounded-md shadow-2xl transition duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-4 font-mono text-slate-400 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-amber-500 block font-bold">Image load fallback triggered!</span>
                          <p className="text-[10px] max-w-xs text-slate-550 leading-relaxed text-center">
                            Abdou, simply place Radouane's photo as <b className="text-slate-300 font-mono">"pic.png"</b> directly inside the root <b className="text-slate-300 font-mono">public/</b> folder of your file manager to display him inside this glowing frame!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Laser scanning visual line decor */}
                    <div className="absolute inset-x-0 h-0.5 bg-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.5)] top-[10%] animate-bounce pointer-events-none" style={{ animationDuration: '4.5s' }} />
                  </div>

                  {/* Decorative Frame Stamp */}
                  <div className="mt-4 p-2.5 rounded bg-slate-950 border border-slate-850/80 text-[10px] font-mono text-slate-440 text-center leading-relaxed">
                    🌟 <b>Memory Registered Successfully:</b> Radouane pictured compiling 19 stable cycles of awesome logic.
                  </div>

                  {/* Integrated Informational Message daemon note */}
                  <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-400 leading-relaxed">
                    <span className="text-emerald-400 font-bold">INFO [system-daemon]:</span> Radouane's life loop is running smoothly on standard thread. Garbage collection of youth regrets completed. Happiness factor at stable state. Celebrating index 19 continues.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-4 mt-16 border-t border-slate-900/60 pt-6 text-center text-slate-600 text-xs font-mono select-none z-10 pb-4">
        <div>
          RADOUANE_BIRTHDAY_STACK: React 19 + Tailwind v4 + Framer Motion (Optimized with Caffeine loops).
        </div>
        <div className="mt-1 text-[9px] text-slate-700">
          Created in 2026. Handcrafted with care of 0 compilation warnings. 🎉
        </div>
      </footer>

    </div>
  );
}
