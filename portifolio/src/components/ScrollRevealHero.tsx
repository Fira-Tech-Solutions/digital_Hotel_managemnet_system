import { useRef, useEffect, useState, useCallback, useMemo, type CSSProperties } from 'react';

interface OverlayMessage {
  text: string;
  range: [number, number];
  position: 'upper-third' | 'center' | 'lower-third' | 'lower-headline' | 'lower-subline' | 'lower-button';
  style?: 'eyebrow' | 'headline' | 'subline' | 'button';
  align?: 'left' | 'center' | 'right';
}

interface ScrollRevealHeroProps {
  framePath: string;
  framePrefix: string;
  frameCount: number;
  framePadding?: number;
  frameExt?: string;
  overlays: OverlayMessage[];
  scrollHeight?: number;
  className?: string;
}

const positionStyles: Record<string, CSSProperties> = {
  'upper-third': { top: '25%', left: 0, right: 0, textAlign: 'center' },
  'center': { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center' },
  'lower-third': { bottom: '18%', left: 0, right: 0, textAlign: 'center' },
  'lower-headline': { bottom: '28%', left: 0, right: 0, textAlign: 'center' },
  'lower-subline': { bottom: '20%', left: 0, right: 0, textAlign: 'center' },
  'lower-button': { bottom: '12%', left: 0, right: 0, textAlign: 'center' },
};

const styleClasses: Record<string, string> = {
  eyebrow:
    'text-gold text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase',
  headline:
    'font-display text-5xl sm:text-6xl md:text-8xl text-ivory tracking-[0.05em]',
  subline:
    'text-ivory/70 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto italic',
  button:
    'inline-block border border-gold text-gold px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold hover:bg-gold hover:text-black transition-colors duration-300 cursor-pointer',
};

function padNumber(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ScrollRevealHero({
  framePath,
  framePrefix,
  frameCount,
  framePadding = 3,
  frameExt = 'jpg',
  overlays,
  scrollHeight = 450,
  className = '',
}: ScrollRevealHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const loadedCountRef = useRef(0);
  const lastFrameRef = useRef(-1);
  const mountedRef = useRef(true);

  const frameStep = useMemo(() => {
    if (typeof window === 'undefined') return 2;
    return window.innerWidth < 768 ? 3 : 2;
  }, []);

  const sampledFrameCount = useMemo(
    () => Math.ceil(frameCount / frameStep),
    [frameCount, frameStep],
  );

  const sampledIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = 0; i < frameCount; i += frameStep) {
      indices.push(i);
    }
    return indices;
  }, [frameCount, frameStep]);

  // Preload all sampled frames
  useEffect(() => {
    // Reset on mount (handles StrictMode double-mount)
    loadedCountRef.current = 0;
    lastFrameRef.current = -1;
    mountedRef.current = true;
    setIsLoaded(false);
    setLoadProgress(0);

    const images: HTMLImageElement[] = [];

    const checkAllLoaded = () => {
      if (!mountedRef.current) return;
      loadedCountRef.current++;
      setLoadProgress(loadedCountRef.current / sampledFrameCount);
      if (loadedCountRef.current >= sampledFrameCount) {
        setIsLoaded(true);
      }
    };

    sampledIndices.forEach((idx) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // count errors too so we don't block forever
      img.src = `${framePath}/${framePrefix}${padNumber(idx + 1, framePadding)}.${frameExt}`;
      images.push(img);
    });

    imagesRef.current = images;

    return () => {
      mountedRef.current = false;
    };
  }, [framePath, framePrefix, framePadding, frameExt, sampledFrameCount, sampledIndices]);

  // Draw frame to canvas
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const img = imagesRef.current[frameIndex];
      if (!canvas || !img || !img.complete || !img.naturalWidth) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Always ensure canvas matches viewport
      const needsResize = canvas.width !== Math.floor(vw * dpr) || canvas.height !== Math.floor(vh * dpr);
      if (needsResize) {
        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;
        // Don't scale here — we scale per draw call below
      }

      // Reset transform then scale for DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = vw / vh;

      let sx = 0,
        sy = 0,
        sw = img.naturalWidth,
        sh = img.naturalHeight;

      // Object-fit: cover — crop to fill viewport
      if (imgRatio > canvasRatio) {
        sw = sh * canvasRatio;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = sw / canvasRatio;
        sy = (img.naturalHeight - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, vw, vh);
    },
    [],
  );

  // Scroll-driven animation loop
  useEffect(() => {
    if (!isLoaded) return;

    const stage = stageRef.current;
    if (!stage) return;

    let ticking = false;

    const updateOverlays = (progress: number) => {
      overlayRefs.current.forEach((el) => {
        if (!el) return;
        const rangeStart = parseFloat(el.dataset.rangeStart || '0');
        const rangeEnd = parseFloat(el.dataset.rangeEnd || '1');
        const style = el.dataset.style || 'headline';

        let opacity = 0;
        let translateY = 0;

        if (progress >= rangeStart && progress <= rangeEnd) {
          const localProgress = (progress - rangeStart) / (rangeEnd - rangeStart);

          if (style === 'button') {
            opacity = localProgress > 0.7 ? easeOutCubic((localProgress - 0.7) / 0.3) : 0;
          } else {
            if (localProgress < 0.3) {
              opacity = easeOutCubic(localProgress / 0.3);
            } else if (localProgress > 0.7) {
              opacity = easeOutCubic((1 - localProgress) / 0.3);
            } else {
              opacity = 1;
            }
          }

          if (style === 'headline' || style === 'subline') {
            translateY = lerp(15, 0, easeInOutCubic(clamp(localProgress * 2, 0, 1)));
          }
        }

        el.style.opacity = String(clamp(opacity, 0, 1));
        el.style.transform = `translateY(${translateY}px)`;
        el.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      rafRef.current = requestAnimationFrame(() => {
        ticking = false;

        const rect = stage.getBoundingClientRect();
        const stageHeight = stage.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollableDistance = stageHeight - viewportHeight;

        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        const progress = clamp(scrolled / scrollableDistance, 0, 1);

        // Hide scroll hint
        if (progress > 0.02 && showScrollHint) {
          setShowScrollHint(false);
        }

        // Map progress to sampled frame index
        const targetIndex = Math.round(progress * (sampledFrameCount - 1));
        const clampedIndex = clamp(targetIndex, 0, sampledFrameCount - 1);

        if (clampedIndex !== lastFrameRef.current) {
          lastFrameRef.current = clampedIndex;
          drawFrame(clampedIndex);
        }

        // Canvas scale (subtle push-in)
        if (canvasWrapRef.current) {
          canvasWrapRef.current.style.transform = `scale(${lerp(1, 1.03, progress)})`;
        }

        // Update all overlays
        updateOverlays(progress);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Force initial draw after a tick so layout is settled
    requestAnimationFrame(() => {
      onScroll();
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, drawFrame, sampledFrameCount, showScrollHint]);

  return (
    <div
      ref={stageRef}
      className={`relative ${className}`}
      style={{ height: `${scrollHeight}vh` }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Canvas container with scale effect */}
        <div ref={canvasWrapRef} className="absolute inset-0 will-change-transform">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.5) 80%, rgba(10,10,10,0.85) 100%)',
          }}
        />

        {/* Bottom gradient for text readability */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 100%)',
          }}
        />

        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="w-48 h-[1px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gold/60 transition-all duration-300"
                style={{ width: `${loadProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Overlay messages */}
        {overlays.map((overlay, i) => (
          <div
            key={i}
            ref={(el) => { overlayRefs.current[i] = el; }}
            data-range-start={overlay.range[0]}
            data-range-end={overlay.range[1]}
            data-style={overlay.style || 'headline'}
            className="absolute z-20 px-6 sm:px-12"
            style={{
              ...positionStyles[overlay.position],
              opacity: 0,
              transform: 'translateY(0px)',
            }}
          >
            <span className={styleClasses[overlay.style || 'headline']}>
              {overlay.text}
            </span>
          </div>
        ))}

        {/* Scroll hint */}
        <div
          className={`absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3 transition-opacity duration-700 ${
            showScrollHint && isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="text-gold text-[10px] tracking-[0.25em] uppercase font-semibold">
            Scroll
          </span>
          <div className="w-[1px] h-10 bg-gold/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full bg-gold animate-scrollLine" />
          </div>
        </div>
      </div>
    </div>
  );
}
