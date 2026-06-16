import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { TerminalLine } from '../types';
import { Terminal, Copy, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface InteractiveTerminalProps {
  onTriggerBurst: () => void;
  onPlaySong: () => void;
  onEatCake: () => void;
}

const BOOT_LOGS: TerminalLine[] = [
  { text: 'Initializing radouane-birthday-os v19.0.0...', type: 'output' },
  { text: 'Loading core_module: happiness... [OK]', type: 'success' },
  { text: 'Loading dependency: caffeinated_code_loops... [OK]', type: 'success' },
  { text: 'Detecting physical user... target: Radouane, Age: 19', type: 'output' },
  { text: 'SYSTEM CHECK: Sleep hours = 4.2; Joy quotient = 100%; Cake capacity = MAXIMUM', type: 'warning' },
  { text: 'Type "help" to list available commands.', type: 'success' },
];

export default function InteractiveTerminal({
  onTriggerBurst,
  onPlaySong,
  onEatCake,
}: InteractiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Command list for documentation/clicking
  const AVAILABLE_SCRIPTS = [
    { cmd: 'help', desc: 'Display all available commands' },
    { cmd: 'cat card.md', desc: 'Read the developer birthday message card' },
    { cmd: 'git status', desc: 'Check current life status on branch age/19' },
    { cmd: 'radouane --inspect', desc: 'Dump Radouane JSON systems information' },
    { cmd: 'npm install wisdom', desc: 'Package upgrade for Radouane version 19.0.0' },
    { cmd: 'music --play', desc: 'Trigger the Web Audio 8-bit chip music' },
    { cmd: 'cake --eat', desc: 'Cut/devour a layer of virtual digital cake' },
    { cmd: 'matrix', desc: 'Run Matrix Rain generator burst' },
  ];

  // Auto boot logs typing effect
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < BOOT_LOGS.length) {
        const nextLine = BOOT_LOGS[currentIdx];
        if (nextLine) {
          setLines((prev) => [...prev, nextLine]);
        }
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom whenever lines change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleExecuteCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add user output line
    const userLine: TerminalLine = { text: `radouane@19-years-old:~$ ${cmd}`, type: 'input' };
    const newLines = [...lines, userLine];

    const cleanCmd = cmd.toLowerCase();
    let replyLines: TerminalLine[] = [];

    // Match exact logic
    if (cleanCmd === 'help') {
      replyLines = [
        { text: 'Available commands in this shell:', type: 'output' },
        ...AVAILABLE_SCRIPTS.map(s => ({
          text: `  ${s.cmd.padEnd(20)} - ${s.desc}`,
          type: 'output' as const
        })),
        { text: 'Pro Tip: Click on any of the quick-run chip buttons below to fire commands!', type: 'success' }
      ];
    } else if (cleanCmd === 'cat card.md') {
      replyLines = [
        { text: '==============================================', type: 'output' },
        { text: '🎉 HAPPY 19th BIRTHDAY RADOUANE! 🎉', type: 'success' },
        { text: '==============================================', type: 'output' },
        { text: 'Dear Friend,', type: 'output' },
        { text: 'Congratulations on successfully completing 19 orbits around the sun!', type: 'output' },
        { text: 'You have compiled another year with 0 critical crashes.', type: 'output' },
        { text: 'May your production build be bug-free, your caffeine levels high,', type: 'output' },
        { text: 'and may your life loop be optimized for laughs, friendships, and logic.', type: 'output' },
        { text: 'Keep converting code into awesome digital items!', type: 'success' },
        { text: '----------------------------------------------', type: 'output' },
        { text: 'From: Your developer friend (Build System Optimizer)', type: 'output' },
        { text: 'Built in React, compiled in pure happiness.', type: 'warning' },
      ];
      onTriggerBurst();
    } else if (cleanCmd === 'git status') {
      replyLines = [
        { text: 'On branch age/19-stable', type: 'output' },
        { text: 'Your branch is ahead of "minor-years" by 1,314,000 commits.', type: 'output' },
        { text: 'Changes to be committed:', type: 'success' },
        { text: '  (use "git push" to deploy happiness level)', type: 'success' },
        { text: '    modified:   experience_pool/wisdom.json', type: 'success' },
        { text: '    modified:   capabilities/adult_mode.bin', type: 'success' },
        { text: '    new file:   milestones/launch_year_20.ts', type: 'success' },
        { text: 'Untracked files of age 18 pruned successfully.', type: 'warning' },
        { text: 'nothing to commit, working tree optimized for celebrating.', type: 'output' }
      ];
    } else if (cleanCmd === 'radouane --inspect') {
      replyLines = [
        { text: '{', type: 'output' },
        { text: '  "name": "Radouane",', type: 'output' },
        { text: '  "id": "radouane-dev",', type: 'output' },
        { text: '  "age": 19,', type: 'success' },
        { text: '  "epoch_status": "adult_initial_preview",', type: 'output' },
        { text: '  "hobbies": ["Clean Coding", "Solving Bugs", "Late Night Coffee", "AI Engineering"],', type: 'output' },
        { text: '  "dependencies": { "wifi": "^6G", "caffeine": "100.0.0", "curiosity": "latest" },', type: 'output' },
        { text: '  "quirks": ["Over-abstracts everything", "Refuses to use light theme (wise choice)", "Infinite loop of ideas"]', type: 'warning' },
        { text: '}', type: 'output' }
      ];
    } else if (cleanCmd === 'npm install wisdom') {
      replyLines = [
        { text: 'npm fetch https://registry.life/radouane/wisdom@v19.0.0', type: 'output' },
        { text: '###################################### 100% [DONE]', type: 'success' },
        { text: 'Refining social communication skills...', type: 'output' },
        { text: 'Adding 365 days of logic & debugging experience...', type: 'output' },
        { text: 'Warning: Deprecated dependencies "adolescence-drama" removed.', type: 'warning' },
        { text: 'Added 1 major package + upgraded 19 dependencies.', type: 'success' },
        { text: 'Status: RADOUANE is now wiser, cooler, and fully updated.', type: 'success' }
      ];
      onTriggerBurst();
    } else if (cleanCmd === 'music --play') {
      replyLines = [
        { text: '📻 Initializing synthesiser hardware clock...', type: 'output' },
        { text: 'Playing retro, 8-bit happy birthday chiptune melody! enjoy', type: 'success' }
      ];
      onPlaySong();
    } else if (cleanCmd === 'cake --eat') {
      replyLines = [
        { text: '🍴 Slicing digital matrix cake layers...', type: 'output' },
        { text: 'Cake consumed: State.cakeRemaining has decreased.', type: 'warning' },
        { text: 'Caffeine, serotonin, and glucose levels pumped +35%!', type: 'success' }
      ];
      onEatCake();
    } else if (cleanCmd === 'matrix') {
      replyLines = [
        { text: 'System breach simulation initialized! Deploying digital rain confetti...', type: 'success' }
      ];
      onTriggerBurst();
      onTriggerBurst();
    } else if (cleanCmd === 'clear') {
      setLines([{ text: 'Console buffer cleared.', type: 'success' }]);
      setInputVal('');
      return;
    } else {
      replyLines = [
        { text: `Error: Command Not Found: "${cmd}"`, type: 'error' },
        { text: 'The terminal system is confused. Type "help" to find actual hacks.', type: 'warning' }
      ];
    }

    setLines([...newLines, ...replyLines]);
    setHistory([cmd, ...history]);
    setHistoryIndex(-1);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecuteCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 opacity-80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 ml-3 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>bash | radouane@19-years-old</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          PORT: 1919
        </div>
      </div>

      {/* Terminal Lines Content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1.5 min-h-[220px] max-h-[380px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent selection:bg-sky-500/30"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, idx) => {
          if (!line) return null;
          let styleClass = 'text-slate-300';
          if (line.type === 'input') styleClass = 'text-sky-400 font-medium';
          if (line.type === 'error') styleClass = 'text-rose-400 font-bold';
          if (line.type === 'success') styleClass = 'text-emerald-400';
          if (line.type === 'warning') styleClass = 'text-amber-400';

          return (
            <div key={idx} className={`whitespace-pre-wrap leading-relaxed ${styleClass}`}>
              {line.text}
            </div>
          );
        })}

        {/* Input Line */}
        <div className="flex items-center gap-1 text-sky-400">
          <span className="shrink-0">radouane@19-years-old:~$</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-200 caret-sky-400"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      {/* Quick Access Clickable Commands */}
      <div className="bg-slate-900/60 p-3 border-t border-slate-800">
        <div className="text-[10px] text-slate-500 font-semibold mb-2 uppercase tracking-wide flex items-center gap-1">
          <span>🎯 Quick-Run Developer Scripts</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_SCRIPTS.map((script, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteCommand(script.cmd)}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-sky-500/40 text-[10px] text-slate-300 hover:text-white transition duration-150 flex items-center gap-1"
            >
              <ArrowRight className="w-2.5 h-2.5 text-sky-400" />
              <span>{script.cmd}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
