
"use client";

import { useEffect, useRef } from "react";

export type ParticleVariant = "positive" | "negative";

export interface ParticleImpactAnimationProps {
  variant?: ParticleVariant;
  duration?: number;
  loop?: boolean;
  particleCount?: number;
  ringCount?: number;
  className?: string;
  backgroundColor?: string;
  onComplete?: () => void;
}

type Particle = {
  angle: number;
  radius: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
  offset: number;
  ring: number;
  color: string;
};

const TAU = Math.PI * 2;

const COLORS = {
  white: "#fffde9",
  yellow: "#ffe69a",
  orange: "#ff8c40",
  pink: "#f044a3",
  purple: "#7623c5",
  violet: "#441080",
  blue: "#3989ef",
  cyan: "#8cdfff",
};

const clamp = (value: number) =>
  Math.max(0, Math.min(1, value));

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const random = (min: number, max: number) =>
  min + Math.random() * (max - min);

export default function ParticleImpactAnimation({
  variant = "positive",
  duration = 30,
  loop = false,
  particleCount = 8500,
  ringCount = 10,
  className,
  backgroundColor = "#030107",
  onComplete,
}: ParticleImpactAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
    });
    if (!ctx) return;

    const totalMs = Math.max(0.1, duration) * 1000;
    const count = Math.max(0, Math.floor(particleCount));
    const rings = Math.max(0, Math.floor(ringCount));
    const negative = variant === "negative";

    let width = 0;
    let height = 0;
    let frameId = 0;
    let completionTimer: ReturnType<typeof setTimeout>;
    let startTime = performance.now();
    let completed = false;
    let disposed = false;

    const particles: Particle[] = Array.from(
      { length: negative ? count : rings > 0 ? count : 0 },
      (_, index) => {
        const ring = negative ? -1 : index % rings;

        return {
          angle: random(0, TAU),
          radius: random(0.15, 1),
          size: random(0.45, 1.65),
          alpha: random(0.2, 0.85),
          phase: random(0, TAU),
          speed: random(0.3, 1.1),
          offset: random(-1, 1),
          ring,
          color: negative
            ? Math.random() > 0.65
              ? COLORS.blue
              : COLORS.purple
            : [
                COLORS.orange,
                COLORS.pink,
                COLORS.yellow,
                COLORS.purple,
              ][Math.floor(Math.random() * 4)],
        };
      }
    );

    function glow(
      x: number,
      y: number,
      radius: number,
      intensity: number,
      calm: boolean
    ) {
      if (radius <= 0 || intensity <= 0) return;

      const gradient = ctx!.createRadialGradient(
        x, y, 0, x, y, radius
      );

      if (calm) {
        gradient.addColorStop(0, "#e7f8ff");
        gradient.addColorStop(0.12, COLORS.cyan);
        gradient.addColorStop(0.35, "#427dc8");
        gradient.addColorStop(0.65, "#462477");
        gradient.addColorStop(1, "rgba(32,10,80,0)");
      } else {
        gradient.addColorStop(0, COLORS.white);
        gradient.addColorStop(0.12, COLORS.yellow);
        gradient.addColorStop(0.35, COLORS.orange);
        gradient.addColorStop(0.65, COLORS.pink);
        gradient.addColorStop(1, "rgba(90,10,170,0)");
      }

      ctx!.globalAlpha = clamp(intensity);
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(x, y, radius, 0, TAU);
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    function renderPositive(
      progress: number,
      cx: number,
      cy: number,
      scale: number
    ) {
      // Sudden energy release from the center.
      const flash = Math.exp(-progress * 50);
      const coreFade =
        1 - smooth((progress - 0.76) / 0.24);

      glow(
        cx, cy,
        scale * 0.23,
        Math.min(1, flash + 0.55 * coreFade),
        false
      );

      // Shockwave rings emerge sequentially.
      for (let ring = 0; ring < rings; ring++) {
        const spawn = 0.055 + ring * (0.3 / rings);

        if (progress < spawn) continue;

        const age = clamp(
          (progress - spawn) / (0.94 - spawn)
        );

        const radius =
          scale * (0.035 + 0.88 * age);

        const brightness =
          smooth(age / 0.045) *
          (1 - smooth((age - 0.7) / 0.3));

        if (brightness <= 0) continue;

        // Soft shockwave halo.
        ctx!.strokeStyle = COLORS.pink;
        ctx!.globalAlpha = brightness * 0.2;
        ctx!.lineWidth = scale * 0.035;
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, 0, TAU);
        ctx!.stroke();

        ctx!.strokeStyle = COLORS.orange;
        ctx!.globalAlpha = brightness * 0.38;
        ctx!.lineWidth = scale * 0.008;
        ctx!.stroke();
      }

      // Particles follow the expanding shockwave.
      for (const p of particles) {
        const spawn =
          0.055 + p.ring * (0.3 / rings);

        if (progress < spawn) continue;

        const age = clamp(
          (progress - spawn) / (0.94 - spawn)
        );

        const fade =
          1 - smooth((age - 0.68) / 0.32);

        const alpha =
          p.alpha *
          smooth(age / 0.045) *
          fade;

        if (alpha <= 0) continue;

        const turbulence =
          p.offset * scale * (0.008 + age * 0.095);

        const radius =
          scale * (0.035 + age * 0.88) +
          turbulence;

        const angle =
          p.angle +
          Math.sin(progress * 12 + p.phase) *
            0.025 * p.speed;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(x, y, p.size, p.size);
      }

      if (coreFade > 0) {
        glow(
          cx, cy,
          scale * 0.075,
          coreFade,
          false
        );
      }
    }

    function renderNegative(
      elapsedSeconds: number,
      progress: number,
      cx: number,
      cy: number,
      scale: number,
      reducedMotion: boolean
    ) {
      // No energy impact or shockwave in this variant.
      // A calm core gradually materializes.
      const entrance = smooth(elapsedSeconds / 2);
      const exit =
        1 - smooth((progress - 0.94) / 0.06);

      const pulse = reducedMotion
        ? 0.5
        : (Math.sin(elapsedSeconds * 1.4) + 1) / 2;

      const brightness =
        (0.35 + pulse * 0.16) * entrance * exit;

      // Diffuse blue-violet halo.
      glow(
        cx, cy,
        scale * (0.16 + pulse * 0.018),
        brightness,
        true
      );

      // Small stable luminous core.
      glow(
        cx, cy,
        scale * 0.90,
        brightness * 1.85,
        true
      );

      // Sparse, slowly drifting ambient particles.
      for (const p of particles) {
        const drift = reducedMotion
          ? 0
          : elapsedSeconds * p.speed * 0.025;

        const angle = p.angle + drift;

        const wobble = reducedMotion
          ? 0
          : Math.sin(
              elapsedSeconds * 0.5 + p.phase
            ) * 0.012;

        const radius =
          scale * (0.13 + p.radius * 0.78 + wobble);

        const x =
          cx + Math.cos(angle) * radius;
        const y =
          cy + Math.sin(angle) * radius;

        const shimmer = reducedMotion
          ? 0.7
          : 0.65 +
            Math.sin(
              elapsedSeconds * 1.7 + p.phase
            ) * 0.25;

        ctx!.globalAlpha =
          p.alpha * shimmer * entrance * exit;

        ctx!.fillStyle = p.color;
        ctx!.fillRect(x, y, p.size, p.size);
      }
    }

    function render(
      elapsedMs: number,
      reducedMotion = false
    ) {
      if (!width || !height) return;

      const progress = clamp(elapsedMs / totalMs);
      const elapsedSeconds = elapsedMs / 1000;

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.45;

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = backgroundColor;
      ctx!.fillRect(0, 0, width, height);

      ctx!.globalCompositeOperation = "lighter";

      if (negative) {
        renderNegative(
          elapsedSeconds,
          progress,
          cx,
          cy,
          scale,
          reducedMotion
        );
      } else {
        renderPositive(
          progress,
          cx,
          cy,
          scale
        );
      }

      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const elapsed = Math.max(
        0,
        performance.now() - startTime
      );

      render(
        loop ? elapsed % totalMs : Math.min(elapsed, totalMs),
        motion.matches
      );
    }

    function tick(now: number) {
      if (disposed || document.hidden || motion.matches) {
        return;
      }

      const elapsed = Math.max(0, now - startTime);
      const current = loop
        ? elapsed % totalMs
        : Math.min(elapsed, totalMs);

      render(current);

      if (!loop && elapsed >= totalMs) return;

      frameId = requestAnimationFrame(tick);
    }

    function startRendering() {
      cancelAnimationFrame(frameId);

      if (
        disposed ||
        completed ||
        document.hidden ||
        motion.matches
      ) {
        return;
      }

      frameId = requestAnimationFrame(tick);
    }

    function complete() {
      if (disposed || completed) return;

      completed = true;
      cancelAnimationFrame(frameId);
      render(totalMs, motion.matches);
      onCompleteRef.current?.();
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        startRendering();
      }
    }

    function handleMotion() {
      cancelAnimationFrame(frameId);

      if (motion.matches) {
        render(
          negative ? totalMs * 0.5 : totalMs * 0.4,
          true
        );
      } else {
        startRendering();
      }
    }

    const observer = new ResizeObserver(resize);
    const motion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    observer.observe(canvas);
    resize();

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    motion.addEventListener(
      "change",
      handleMotion
    );

    if (!loop) {
      completionTimer = setTimeout(complete, totalMs);
    }

    if (motion.matches) {
      handleMotion();
    } else {
      startRendering();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(completionTimer);
      observer.disconnect();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      motion.removeEventListener(
        "change",
        handleMotion
      );
    };
  }, [
    variant,
    duration,
    loop,
    particleCount,
    ringCount,
    backgroundColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={
        variant === "positive"
          ? "Expanding energy particle rings"
          : "Calm scanner particle field"
      }
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: backgroundColor,
      }}
    />
  );
}
