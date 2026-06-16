import * as React from 'react';
import { useState } from 'react';
import { Play, FileCode, CheckCircle, Flame, Milestone, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodeWorkspaceProps {
  onCompileSuccess: () => void;
}

const TS_CODE = `/**
 * @name BirthdayScheduler
 * @version 19.0.0
 * @author life-compiler
 */

import { Happiness, Wisdom, Cake, Music } from 'life-experiences';
import { Developer } from 'community';

class Radouane extends Developer {
  public age: number = 18;
  public caffeineLevelPercent: number = 95;
  public energy: string = "MAXIMUM";

  constructor() {
    super("Radouane");
  }

  /**
   * Refactor youth properties to upgrade to production.
   */
  public upgradeToNineteen(cake: Cake): void {
    console.log("Starting lifespan refactor flow...");
    
    // Core version upgrade
    this.age += 1; 
    
    // Package updates
    Wisdom.level += 19;
    Happiness.factor *= 1.19;

    // Remove obsolete minor warnings
    this.cleanUpMinors();

    // Spawn massive matrix particles
    cake.eatSlice();
    Music.play8BitMelody();

    console.log(\`Refactor successful. Radouane is now \${this.age}!\`);
  }

  private cleanUpMinors(): void {
    console.log("Purging teen drama modules...");
    console.log("Pruning obsolete childhood.lock... Success.");
  }
}

// Instantiate and execute birthday transaction
const radouane = new Radouane();
radouane.upgradeToNineteen(new Cake({ flavor: 'TripleChocolate' }));
`;

const JSON_CODE = `{
  "name": "radouane",
  "version": "19.0.0",
  "description": "Awesome developer turning 19 years old today",
  "main": "index.ts",
  "scripts": {
    "dev": "life-scheduler --watch",
    "build": "compile-happiness --prod",
    "celebrate": "play-synth --loop && eat-cake --slice --unlimited",
    "sleep": "noop --force"
  },
  "dependencies": {
    "caffeine-consumption": "^10.0.0",
    "react-coding-loops": "latest",
    "late-night-debugging": "unstable",
    "awesome-jokes": "^19.0.0"
  },
  "bugs": {
    "url": "https://github.com/radouane-dev/birthday/issues"
  }
}`;

export default function CodeWorkspace({ onCompileSuccess }: CodeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'ts' | 'json'>('ts');
  const [isCompiling, setIsCompiling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentBuildProgress, setCurrentBuildProgress] = useState(0);

  const codeToShow = activeTab === 'ts' ? TS_CODE : JSON_CODE;

  const handleRunCode = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setLogs([]);
    setCurrentBuildProgress(0);

    const stages = [
      { text: '⚡ Initializing V19 life compiler...', delay: 200, progress: 10 },
      { text: '📦 Importing "life-experiences/wisdom@v19"...', delay: 600, progress: 30 },
      { text: '⚠️ Resolving dependency warning: "lack_of_sleep" matches standard range.', delay: 1100, progress: 50 },
      { text: '🔧 Injecting 365 new adventure tokens...', delay: 1600, progress: 75 },
      { text: '🎂 Eating chocolate slices to bypass strict cake constraints...', delay: 2000, progress: 90 },
      { text: '🚀 Building bundle: radouane@19.0.0-PROD... SUCCESS!', delay: 2400, progress: 100 },
    ];

    stages.forEach((stage) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, stage.text]);
        setCurrentBuildProgress(stage.progress);

        if (stage.progress === 100) {
          setTimeout(() => {
            setIsCompiling(false);
            onCompileSuccess(); // triggers full dynamic canvas explosions
          }, 350);
        }
      }, stage.delay);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl font-mono text-xs">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between px-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center">
          <button
            onClick={() => { if (!isCompiling) setActiveTab('ts'); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-r border-slate-800 transition duration-150 ${
              activeTab === 'ts' 
                ? 'bg-slate-900 text-sky-400 border-t-2 border-t-sky-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-500" />
            <span>Radouane.ts</span>
          </button>
          <button
            onClick={() => { if (!isCompiling) setActiveTab('json'); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-r border-slate-800 transition duration-150 ${
              activeTab === 'json' 
                ? 'bg-slate-900 text-amber-400 border-t-2 border-t-amber-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            <span>package.json</span>
          </button>
        </div>

        {/* Run Button */}
        <button
          onClick={handleRunCode}
          disabled={isCompiling}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition duration-150 ${
            isCompiling
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 active:scale-95'
          }`}
        >
          <Play className={`w-3 h-3 ${isCompiling ? 'animate-spin' : 'fill-current'}`} />
          <span>{isCompiling ? 'Compiling...' : 'Run Code'}</span>
        </button>
      </div>

      {/* Editor Space */}
      <div className="relative flex-1 bg-slate-900/95 overflow-auto p-4 leading-relaxed max-h-[350px]">
        <div className="flex select-none">
          {/* Static Line Numbers */}
          <div className="text-right text-slate-600 pr-4 select-none border-r border-slate-800 text-[11px] w-9 font-bold">
            {codeToShow.split('\n').map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>

          {/* Syntax Highlighted Code Output */}
          <pre className="pl-4 text-slate-300 font-medium overflow-x-auto text-[11px] flex-1">
            <code>
              {activeTab === 'ts' ? (
                codeToShow.split('\n').map((line, idx) => {
                  // VERY simple custom developer colors for realistic rendering
                  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                    return <span key={idx} className="text-slate-500 block">{line}</span>;
                  }
                  
                  let element = line;
                  // Replace words with colored spans
                  const keywords = ['import', 'from', 'class', 'extends', 'public', 'private', 'super', 'new', 'const', 'return', 'void'];
                  const types = ['number', 'string', 'void', 'Cake', 'Music', 'Wisdom', 'Happiness', 'Developer'];
                  
                  // Simple replacement hacks to make the JSX look real and vibrant
                  let elements: React.ReactNode[] = [line];

                  // Return colored rows
                  return (
                    <span key={idx} className="block whitespace-pre">
                      {line.split(/(\s+|,|\{|\}|\(|\)|\.|:|=|;)/).map((word, wIdx) => {
                        let color = 'text-slate-300';
                        if (keywords.includes(word)) color = 'text-pink-400 font-semibold';
                        else if (types.includes(word)) color = 'text-emerald-400';
                        else if (word.startsWith('"') || word.startsWith("'") || word.startsWith('`')) color = 'text-amber-300';
                        else if (word.match(/^\d+$/)) color = 'text-purple-400';
                        else if (word === 'constructor' || word === 'upgradeToNineteen' || word === 'cleanUpMinors') color = 'text-sky-400';
                        else if (word.startsWith('console')) color = 'text-yellow-400';
                        return <span key={wIdx} className={color}>{word}</span>;
                      })}
                    </span>
                   );
                })
              ) : (
                codeToShow.split('\n').map((line, idx) => {
                  return (
                    <span key={idx} className="block whitespace-pre">
                      {line.split(/(\s+|,|\{|\}|\[|\]|:)/).map((word, wIdx) => {
                        let color = 'text-slate-300';
                        if (word.startsWith('"') && word.endsWith('"') && line.includes(':')) {
                          const isKey = line.indexOf(word) < line.indexOf(':');
                          color = isKey ? 'text-sky-400' : 'text-amber-300';
                        } else if (word.match(/^\d+$/) || word === 'true' || word === 'false') {
                          color = 'text-purple-400';
                        }
                        return <span key={wIdx} className={color}>{word}</span>;
                      })}
                    </span>
                  );
                })
              )}
            </code>
          </pre>
        </div>
      </div>

      {/* Compiler Console Interface */}
      <AnimatePresence>
        {(isCompiling || logs.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800 bg-slate-950 p-4"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Compiler Terminal Logs</span>
              </span>
              <span>{currentBuildProgress}% Done</span>
            </div>

            {/* Build Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full"
                animate={{ width: `${currentBuildProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Logs streams */}
            <div className="space-y-1 select-all font-mono text-[10px] text-slate-400 max-h-[110px] overflow-y-auto">
              {logs.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.includes('SUCCESS')) colorClass = 'text-emerald-400 font-semibold';
                if (log.includes('warning')) colorClass = 'text-yellow-500';
                return (
                  <div key={idx} className={colorClass}>
                    {log}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
