import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'confetti' | 'binary' | 'symbol' | 'balloon';
  content?: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
}

interface ConfettiCanvasProps {
  burstTriggerValue: number;
  burstType?: 'all' | 'binary' | 'confetti';
}

const COLORS = [
  '#38BDF8', // Sky Blue
  '#34D399', // Emerald
  '#F472B6', // Pink
  '#FBBF24', // Amber
  '#A78BFA', // Violet
  '#FB7185', // Rose
  '#6EE7B7', // Aqua
];

const SYMBOLS = ['{ }', '</>', '19', 'const', 'import', '++Math', 'git', '🎂', '🎈', '💻', '🚀'];

export default function ConfettiCanvas({ burstTriggerValue, burstType = 'all' }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas size state
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Update canvas sizing properties
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
  }, [dimensions]);

  // Handle bursts when burstTrigger changes
  useEffect(() => {
    if (burstTriggerValue === 0) return;
    triggerBurst();
  }, [burstTriggerValue]);

  const triggerBurst = () => {
    const pArray = particlesRef.current;
    const count = 50 + Math.floor(Math.random() * 40);
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const size = 6 + Math.random() * 12;
      const rColor = COLORS[Math.floor(Math.random() * COLORS.length)];

      let type: 'confetti' | 'binary' | 'symbol' | 'balloon' = 'confetti';
      const randValue = Math.random();

      if (burstType === 'binary') {
        type = 'binary';
      } else if (burstType === 'confetti') {
        type = 'confetti';
      } else {
        if (randValue < 0.4) {
          type = 'confetti';
        } else if (randValue < 0.7) {
          type = 'binary';
        } else if (randValue < 0.9) {
          type = 'symbol';
        } else {
          type = 'balloon';
        }
      }

      let content = '';
      if (type === 'binary') {
        content = Math.random() > 0.5 ? '1' : '0';
      } else if (type === 'symbol') {
        content = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      }

      pArray.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slightly bias upwards
        size,
        color: rColor,
        type,
        content,
        alpha: 1,
        decay: 0.005 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: type === 'balloon' ? -0.04 : 0.15, // Balloon floats up!
      });
    }
  };

  // Setup loop and ambient falling objects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ambientTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const particles = particlesRef.current;

      // Draw and update each particle
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        // Boundary rules/fades
        if (p.alpha <= 0 || p.y > dimensions.height + 50 || p.y < -50 || p.x < -50 || p.x > dimensions.width + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'confetti') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.type === 'binary') {
          ctx.font = `bold ${p.size + 4}px monospace`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.content || '1', 0, 0);
        } else if (p.type === 'symbol') {
          ctx.font = `bold ${p.size + 2}px monospace`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.content || '{}', 0, 0);
        } else if (p.type === 'balloon') {
          // Draw a real balloon!
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // String
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, p.size * 1.3);
          ctx.quadraticCurveTo(5, p.size * 2, -2, p.size * 3);
          ctx.stroke();

          // Balloon knot
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-3, p.size * 1.3);
          ctx.lineTo(3, p.size * 1.3);
          ctx.lineTo(0, p.size * 1.3 + 4);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // Add gradual ambient falling characters/confetti
      ambientTimer++;
      if (ambientTimer % 15 === 0) {
        particles.push({
          x: Math.random() * dimensions.width,
          y: -20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1 + Math.random() * 2,
          size: 6 + Math.random() * 8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type: Math.random() > 0.6 ? 'binary' : 'confetti',
          content: Math.random() > 0.5 ? '1' : '0',
          alpha: 0.8,
          decay: 0.001,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          gravity: 0.05,
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full opacity-60 md:opacity-85" />
    </div>
  );
}
