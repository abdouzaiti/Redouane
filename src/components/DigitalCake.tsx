import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Flame, Check, RefreshCw, Wind, Mic, MicOff, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DigitalCakeProps {
  onCandleBlow: () => void;
  onAllCandlesExtinguished: () => void;
  playTone: (noteName: string) => void;
}

export default function DigitalCake({
  onCandleBlow,
  onAllCandlesExtinguished,
  playTone,
}: DigitalCakeProps) {
  const [candles, setCandles] = useState<boolean[]>(Array(19).fill(true));
  const [celebrated, setCelebrated] = useState(false);
  
  // Microphone blowing features
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // scale 0-100

  const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'];

  const litCount = candles.filter(Boolean).length;

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const blowCooldownRef = useRef<boolean>(false);

  // Clean values on unmount
  useEffect(() => {
    return () => {
      stopMicListening();
    };
  }, []);

  // Handle manual/click blow out
  const handleCandleClick = (idx: number) => {
    if (!candles[idx]) return;

    setCandles((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });

    const cycNote = NOTES[idx % NOTES.length] || 'C4';
    playTone(cycNote);
    onCandleBlow();
  };

  // Blow out sequentially (The full magic wind sweep)
  const handleBlowAll = () => {
    let delay = 0;
    candles.forEach((isLit, i) => {
      if (isLit) {
        setTimeout(() => {
          setCandles((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          const note = NOTES[i % NOTES.length] || 'C4';
          playTone(note);
          onCandleBlow();
        }, delay);
        delay += 110;
      }
    });
  };

  // Start Mic Listening process
  const startMicListening = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsMicEnabled(true);

      const detectBlow = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate average volume frequency representation
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        
        // Convert to percentage
        const percentage = Math.min(100, Math.floor((average / 128) * 100));
        setAudioLevel(percentage);

        // If decibels/volume goes high (e.g. puff of wind > 55 limit), trigger stagger-extinguishing candles
        if (percentage > 55 && !blowCooldownRef.current) {
          blowCooldownRef.current = true;
          extinguishIncrementalOnMic();
          
          // Re-enable blow action shortly
          setTimeout(() => {
            blowCooldownRef.current = false;
          }, 350);
        }

        animationFrameRef.current = requestAnimationFrame(detectBlow);
      };

      animationFrameRef.current = requestAnimationFrame(detectBlow);

    } catch (err: any) {
      console.error(err);
      setMicError('Mic blocked or unavailable. Press the fallback "Breathe/Puff" button instead!');
      setIsMicEnabled(false);
    }
  };

  // Extinguish random or sequential lit candles when user blows on the mic
  const extinguishIncrementalOnMic = () => {
    setCandles((prev) => {
      const litIndices: number[] = [];
      prev.forEach((isLit, idx) => {
        if (isLit) litIndices.push(idx);
      });

      if (litIndices.length === 0) return prev;

      // Blow out 2-4 candles per blow flow
      const amountToBlow = Math.min(litIndices.length, 3 + Math.floor(Math.random() * 3));
      const next = [...prev];

      for (let i = 0; i < amountToBlow; i++) {
        const itemIdx = litIndices[Math.floor(Math.random() * litIndices.length)];
        next[itemIdx] = false;
        
        // Trigger visual effect and play audio tone
        const cycNote = NOTES[itemIdx % NOTES.length] || 'C4';
        setTimeout(() => {
          playTone(cycNote);
          onCandleBlow();
        }, i * 75);
      }

      return next;
    });
  };

  const stopMicListening = () => {
    setIsMicEnabled(false);
    setAudioLevel(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const toggleMic = () => {
    if (isMicEnabled) {
      stopMicListening();
    } else {
      startMicListening();
    }
  };

  const handleResetCandles = () => {
    setCandles(Array(19).fill(true));
    setCelebrated(false);
  };

  // Auto-alert state parent when fully completed
  useEffect(() => {
    if (litCount === 0 && !celebrated) {
      setCelebrated(true);
      onAllCandlesExtinguished();
    }
  }, [litCount, celebrated]);

  const getCandleCoords = (index: number) => {
    const isRow1 = index < 10;
    const countInRow = isRow1 ? 10 : 9;
    const localIdx = isRow1 ? index : index - 10;

    const startX = isRow1 ? 30 : 38;
    const endX = isRow1 ? 170 : 162;
    const y = isRow1 ? 62 : 72;

    const interval = (endX - startX) / (countInRow - 1 || 1);
    const x = startX + localIdx * interval;

    return { x, y };
  };

  return (
    <div className="flex flex-col items-center justify-between h-full bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4 z-10 font-mono">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>sys_candle_blower.sh</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Breathe into mic or click on flames!</p>
        </div>
        <span className="text-[11px] bg-slate-800 text-sky-450 px-2.5 py-0.5 rounded-full border border-slate-700/80 font-bold">
          🔥 Lit: {litCount} / 19
        </span>
      </div>

      {/* Mic sensor controller */}
      <div className="w-full bg-slate-950 p-2.5 rounded border border-slate-800/80 z-10 mb-2 flex items-center justify-between font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`p-1.5 rounded transition ${
              isMicEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            } cursor-pointer`}
            title={isMicEnabled ? "Disable Microphone blowing" : "Enable Microphone blowing!"}
          >
            {isMicEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
          
          <div className="flex flex-col">
            <span className={isMicEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {isMicEnabled ? '🎤 Microphone Blow Link: Active' : '🎤 Microphone Link: Offline'}
            </span>
            {isMicEnabled && (
              <span className="text-[9px] text-slate-500">Decibel average: {audioLevel}%</span>
            )}
          </div>
        </div>

        {/* Realtime voice/vol scale indicator */}
        {isMicEnabled && (
          <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden flex items-center">
            <div 
              className={`h-full transition-all duration-75 ${audioLevel > 55 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-400'}`}
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        )}
      </div>

      {micError && (
        <div className="w-full text-center text-[10px] text-amber-500 bg-amber-950/20 border border-amber-900/30 p-1.5 rounded z-10 mb-2 font-mono">
          {micError}
        </div>
      )}

      {/* SVG Interactive Multi-tier Birthday Cake container */}
      <div className="relative w-full max-w-[280px] h-[220px] flex items-center justify-center z-10 select-none">
        <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
          {/* Floor Shadow */}
          <ellipse cx="100" cy="155" rx="80" ry="10" fill="#020617" opacity="0.8" />
          
          {/* Plate / Stand */}
          <path d="M 25 150 Q 100 162 175 150 L 165 155 Q 100 165 35 155 Z" fill="#475569" />
          <ellipse cx="100" cy="150" rx="75" ry="8" fill="#64748B" />

          {/* LAYER 3: Large Bottom Chocolate Tier */}
          <path d="M 33 118 L 33 144 Q 100 156 167 144 L 167 118 Q 100 128 33 118" fill="#45271d" /> 
          <ellipse cx="100" cy="118" rx="67" ry="8" fill="#5c382b" />
          
          {/* Mint Icing drippings (Bottom Tier) */}
          <path d="M 33 118 Q 45 128 55 120 T 75 122 T 95 120 T 115 123 T 135 119 T 155 124 T 167 118 Q 100 126 33 118 Z" fill="#10B981" opacity="0.85" />

          {/* LAYER 2: Middle Vanilla Cream Tier */}
          <path d="M 42 88 L 42 113 Q 100 123 158 113 L 158 88 Q 100 98 42 88" fill="#F8FAFC" />
          <ellipse cx="100" cy="88" rx="58" ry="7" fill="#E2E8F0" />
          
          {/* Strawberry Swirl / sprinkles (Middle Tier) */}
          <circle cx="65" cy="100" r="1.5" fill="#EF4444" />
          <circle cx="85" cy="104" r="1.5" fill="#3B82F6" />
          <circle cx="110" cy="102" r="1.5" fill="#F59E0B" />
          <circle cx="130" cy="105" r="1.5" fill="#10B981" />
          <circle cx="145" cy="98" r="1.5" fill="#EC4899" />

          {/* LAYER 1: Top Custom Strawberry Frosting Tier */}
          <path d="M 50 58 L 50 82 Q 100 92 150 82 L 150 58 Q 100 68 50 58" fill="#FDA4AF" />
          <ellipse cx="100" cy="58" rx="50" ry="6" fill="#F43F5E" />

          {/* Holographic Glowing "19" Emblem (placed centrally on layer 3) */}
          <g transform="translate(85, 122) scale(0.65)" className="opacity-90">
            <rect x="0" y="0" width="46" height="30" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="23" y="21" fill="#22d3ee" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="antialiased font-bold">19</text>
          </g>

          {/* RENDER CANDLES (exactly 19) */}
          {Array(19).fill(null).map((_, i) => {
            const { x, y } = getCandleCoords(i);
            const isLit = candles[i];
            const candleHeight = 16;
            const w = 3.5;

            const candleColors = ['#38bdf8', '#fb7185', '#fbbf24', '#c084fc', '#4ade80'];
            const cColor = candleColors[i % candleColors.length];

            return (
              <g 
                key={i} 
                className="cursor-pointer group select-none"
                onClick={() => handleCandleClick(i)}
              >
                {/* Candle body shadow */}
                <rect 
                  x={x - w/2} 
                  y={y - candleHeight} 
                  width={w} 
                  height={candleHeight} 
                  fill={cColor} 
                  rx="1"
                />
                
                {/* Candle stripes decoration */}
                <line x1={x - w/2} y1={y - candleHeight + 3} x2={x + w/2} y2={y - candleHeight + 5} stroke="#ffffff" strokeWidth="0.8" />
                <line x1={x - w/2} y1={y - candleHeight + 8} x2={x + w/2} y2={y - candleHeight + 10} stroke="#ffffff" strokeWidth="0.8" />

                {/* Flame indicator */}
                {isLit ? (
                  <g>
                    <circle 
                      cx={x} 
                      cy={y - candleHeight - 4} 
                      r="5" 
                      fill="#F59E0B" 
                      opacity="0.32" 
                      className="animate-ping"
                    />
                    
                    <path 
                      d={`M ${x} ${y - candleHeight} Q ${x - 2.5} ${y - candleHeight - 4} ${x} ${y - candleHeight - 9} Q ${x + 2.5} ${y - candleHeight - 4} ${x} ${y - candleHeight}`}
                      fill="url(#flameGrad)"
                    />
                  </g>
                ) : (
                  <line 
                    x1={x} 
                    y1={y - candleHeight - 1} 
                    x2={x + (i % 2 === 0 ? 1.5 : -1.5)} 
                    y2={y - candleHeight - 5} 
                    stroke="#cbd5e1" 
                    strokeWidth="0.8"
                    strokeDasharray="1.5,1.5"
                    className="opacity-40"
                  />
                )}
              </g>
            );
          })}

          <defs>
            <radialGradient id="flameGrad" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EF4444" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Control buttons & success alerts */}
      <div className="w-full mt-3 z-10">
        <AnimatePresence mode="wait">
          {litCount > 0 ? (
            <motion.div
              key="blow-section"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-2"
            >
              <button
                onClick={handleBlowAll}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-slate-100 font-mono text-xs font-semibold rounded-md shadow-md focus:outline-none transition duration-150 active:scale-95 text-center cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-sky-200 fill-current" />
                <span>Extinguish All Gust of Wind</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="congrats-section"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex flex-col gap-2 w-full text-center font-mono"
            >
              <div className="text-emerald-400 text-xs font-bold bg-slate-950 border border-emerald-500/30 p-2 rounded flex items-center justify-center gap-1.5 shadow-lg">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>LOOPS COMPILED: v19.0.0-PROD IS LIVE! 🎂</span>
              </div>
              <button
                onClick={handleResetCandles}
                className="w-full py-1.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-700/60 text-[10px] rounded flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-ignite Candles</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
