"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FlappyBirdGameProps {
  token: string;
  eventId: string;
  playerName: string;
  onScoreSubmit?: (score: number) => void;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const GRAVITY = 0.45;
const FLAP = -7.5;
const PIPE_SPEED = 2.8;
const PIPE_GAP = 130;
const PIPE_WIDTH = 52;
const BIRD_SIZE = 28;

export function FlappyBirdGame({
  token,
  eventId,
  playerName,
  onScoreSubmit,
}: FlappyBirdGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const stateRef = useRef({
    birdY: 200,
    birdVy: 0,
    pipes: [] as Pipe[],
    score: 0,
    frame: 0,
    animId: 0,
  });

  const submitScore = useCallback(
    async (finalScore: number) => {
      onScoreSubmit?.(finalScore);
      try {
        await fetch("/api/game/flappy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, eventId, score: finalScore, playerName }),
        });
      } catch {
        // offline — bỏ qua
      }
    },
    [token, eventId, playerName, onScoreSubmit]
  );

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const h = canvas.height;
    stateRef.current = {
      birdY: h / 2,
      birdVy: 0,
      pipes: [{ x: canvas.width + 80, gapY: h * 0.4 + Math.random() * 80, passed: false }],
      score: 0,
      frame: 0,
      animId: 0,
    };
    setScore(0);
    setGameState("playing");
  }, []);

  const flap = useCallback(() => {
    if (gameState === "idle") {
      startGame();
      stateRef.current.birdVy = FLAP;
      return;
    }
    if (gameState === "playing") {
      stateRef.current.birdVy = FLAP;
    }
    if (gameState === "over") {
      startGame();
      stateRef.current.birdVy = FLAP;
    }
  }, [gameState, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const drawBackground = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#B8E8F5");
      grad.addColorStop(1, "#E8F8E8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Mây nhẹ
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(80, 60, 40, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(110, 55, 30, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBird = (y: number, frame: number) => {
      const x = W * 0.25;
      const bob = Math.sin(frame * 0.15) * 3;

      // Thân lá (chim = chiếc lá bay)
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(Math.min(Math.max(stateRef.current.birdVy * 0.04, -0.5), 0.5));

      ctx.font = `${BIRD_SIZE}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🍃", 0, 0);

      ctx.restore();
    };

    const drawPipe = (pipe: Pipe) => {
      const gapHalf = PIPE_GAP / 2;
      const topH = pipe.gapY - gapHalf;
      const botY = pipe.gapY + gapHalf;
      const botH = H - botY;

      // Thân cây xanh
      const drawTrunk = (x: number, y: number, h: number) => {
        const grad = ctx.createLinearGradient(x, y, x + PIPE_WIDTH, y);
        grad.addColorStop(0, "#2D8B57");
        grad.addColorStop(1, "#3DBE8B");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, PIPE_WIDTH, h);

        // Tán nhỏ
        ctx.fillStyle = "#FF6FA5";
        ctx.beginPath();
        ctx.ellipse(x + PIPE_WIDTH / 2, y, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      };

      drawTrunk(pipe.x, 0, topH);
      drawTrunk(pipe.x, botY, botH);
    };

    const loop = () => {
      const s = stateRef.current;
      drawBackground();

      if (gameState === "playing") {
        s.frame++;
        s.birdVy += GRAVITY;
        s.birdY += s.birdVy;

        // Spawn pipes
        const lastPipe = s.pipes[s.pipes.length - 1];
        if (!lastPipe || lastPipe.x < W - 200) {
          s.pipes.push({
            x: W + 20,
            gapY: 120 + Math.random() * (H - 240),
            passed: false,
          });
        }

        // Update pipes
        s.pipes = s.pipes.filter((p) => p.x > -PIPE_WIDTH - 10);
        for (const pipe of s.pipes) {
          pipe.x -= PIPE_SPEED;

          if (!pipe.passed && pipe.x + PIPE_WIDTH < W * 0.25) {
            pipe.passed = true;
            s.score++;
            setScore(s.score);
          }
        }

        // Collision
        const bx = W * 0.25;
        const by = s.birdY;
        const hitGround = by + BIRD_SIZE / 2 > H - 10;
        const hitCeiling = by - BIRD_SIZE / 2 < 0;

        for (const pipe of s.pipes) {
          const inX = bx + BIRD_SIZE / 2 > pipe.x && bx - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH;
          const gapHalf = PIPE_GAP / 2;
          const inGap = by > pipe.gapY - gapHalf && by < pipe.gapY + gapHalf;
          if (inX && !inGap) {
            setGameState("over");
            setBest((b) => Math.max(b, s.score));
            submitScore(s.score);
          }
        }

        if (hitGround || hitCeiling) {
          setGameState("over");
          setBest((b) => Math.max(b, s.score));
          submitScore(s.score);
        }
      }

      for (const pipe of stateRef.current.pipes) drawPipe(pipe);
      drawBird(stateRef.current.birdY, stateRef.current.frame);

      // Điểm
      ctx.fillStyle = "#2A2230";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(stateRef.current.score), W / 2, 44);

      if (gameState === "idle") {
        ctx.fillStyle = "rgba(42,34,48,0.7)";
        ctx.font = "600 16px sans-serif";
        ctx.fillText("Chạm để bay 🍃", W / 2, H / 2 + 60);
      }

      if (gameState === "over") {
        ctx.fillStyle = "rgba(42,34,48,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("Game Over!", W / 2, H / 2 - 20);
        ctx.font = "16px sans-serif";
        ctx.fillText(`Điểm: ${stateRef.current.score}`, W / 2, H / 2 + 10);
        ctx.fillText("Chạm để chơi lại", W / 2, H / 2 + 44);
      }

      s.animId = requestAnimationFrame(loop);
    };

    stateRef.current.animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(stateRef.current.animId);
  }, [gameState, submitScore]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full max-w-sm overflow-hidden rounded-card shadow-soft">
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          className="w-full touch-none"
          onPointerDown={flap}
        />
      </div>
      <p className="text-center text-sm text-ink-muted">
        Nuôi cây bằng cách bay qua các cành 🌳 · Kỷ lục: {best}
      </p>
    </div>
  );
}
