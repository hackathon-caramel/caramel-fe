"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { CardMeta, CreateCardMeta, StackItem } from "./utils/types";
import Link from "next/link";
import Image from "next/image";
import { getRandomSlogan } from "./utils/slogans";

const albums: CardMeta[] = [
  {
    id: "ember-odes",
    title: "Ember Echoes",
    subtitle: "Analog warmth in a twilight forest.",
    gradient: "linear-gradient(135deg,#ffb347 0%,#ff6f61 60%,#b33951 100%)",
  },
  {
    id: "aurora",
    title: "Aurora Trails",
    subtitle: "Synth waves traveling through polar skies.",
    gradient: "linear-gradient(135deg,#74ebd5 0%,#9face6 100%)",
  },
  {
    id: "embers-deep",
    title: "Midnight Ember",
    subtitle: "Deep drums and midnight embers colliding.",
    gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)",
  },
  {
    id: "campfire",
    title: "Campfire Chorus",
    subtitle: "Stories sung beneath starlit canopies.",
    gradient: "linear-gradient(135deg,#fbd3e9 0%,#bb377d 100%)",
  },
  {
    id: "horizon",
    title: "Horizon Sparks",
    subtitle: "Pulses of light cresting distant peaks.",
    gradient: "linear-gradient(135deg,#83a4d4 0%,#b6fbff 100%)",
  },
  {
    id: "crimson-dusk",
    title: "Crimson Dusk",
    subtitle: "Smoldering beats under red skies.",
    gradient: "linear-gradient(135deg,#ff6f61 0%,#c31432 100%)",
  },
  {
    id: "neon-river",
    title: "Neon River",
    subtitle: "Electric currents through a midnight city.",
    gradient: "linear-gradient(135deg,#00d2ff 0%,#3a7bd5 100%)",
  },
  {
    id: "saffron-skies",
    title: "Saffron Skies",
    subtitle: "Sunlit grooves over warm horizons.",
    gradient: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  },
  {
    id: "velvet-moon",
    title: "Velvet Moon",
    subtitle: "Soft echoes drifting past lunar craters.",
    gradient: "linear-gradient(135deg,#434343 0%,#000000 100%)",
  },
  {
    id: "cobalt-drift",
    title: "Cobalt Drift",
    subtitle: "Bluewave textures rolling offshore.",
    gradient: "linear-gradient(135deg,#36d1dc 0%,#5b86e5 100%)",
  },
];

const createCardMeta: CreateCardMeta = {
  kind: "create",
  // switched to a red-themed gradient for the create card
  gradient: "linear-gradient(135deg,#ff6b6b 0%,#d7263d 100%)",
};

const CARD_GAP = 160;
const TRANSITION_MS = 480;
const DRAG_LIMIT = CARD_GAP * 1.1;

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slogan, setSlogan] = useState("이 순간에 필요한 음악 생성");

  const stack = useMemo<StackItem[]>(() => [createCardMeta, ...albums], []);
  const totalCards = stack.length;

  const timersRef = useRef<number[]>([]);
  const isAnimatingRef = useRef(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);

  useEffect(() => {
    const preventScroll = (event: WheelEvent | TouchEvent) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Pick a random slogan after mount to avoid hydration mismatch
  useEffect(() => {
    setSlogan(getRandomSlogan());
  }, []);

  const scheduleUnlock = useCallback(() => {
    const timer = window.setTimeout(() => {
      isAnimatingRef.current = false;
      timersRef.current = timersRef.current.filter((id) => id !== timer);
    }, TRANSITION_MS + 30);
    timersRef.current.push(timer);
  }, []);

  const shiftBy = useCallback(
    (step: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setCurrentIndex((prev) => {
        const next = (prev + step + totalCards) % totalCards;
        return next;
      });
      setDragOffset(0);
      scheduleUnlock();
    },
    [scheduleUnlock, totalCards]
  );

  const goNext = useCallback(() => shiftBy(1), [shiftBy]);
  const goPrev = useCallback(() => shiftBy(-1), [shiftBy]);

  const handleAddAlbum = useCallback(() => {
    console.log("TODO: open create-album flow");
  }, []);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (isAnimatingRef.current || draggingRef.current) return;

      const deltaY = event.deltaY;
      const adjusted = Math.abs(deltaY) < 40 ? deltaY * 1.3 : deltaY;
      wheelAccumulatorRef.current += adjusted;

      if (Math.abs(wheelAccumulatorRef.current) > 120) {
        if (wheelAccumulatorRef.current > 0) {
          goNext();
        } else {
          goPrev();
        }
        wheelAccumulatorRef.current = 0;
      }
    },
    [goNext, goPrev]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isAnimatingRef.current) return;
      draggingRef.current = true;
      setIsDragging(true);
      startYRef.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const deltaY = event.clientY - startYRef.current;
      const clamped = Math.max(Math.min(deltaY, DRAG_LIMIT), -DRAG_LIMIT);
      setDragOffset(clamped);
    },
    []
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, shouldSnap: boolean) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }

      const deltaY = event.clientY - startYRef.current;
      setDragOffset(0);

      if (!shouldSnap || isAnimatingRef.current) {
        return;
      }

      const threshold = CARD_GAP * 0.4;
      if (Math.abs(deltaY) < threshold) {
        return;
      }

      if (deltaY > 0) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      endDrag(event, true);
    },
    [endDrag]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      endDrag(event, false);
    },
    [endDrag]
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      endDrag(event, false);
    },
    [endDrag]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[radial-gradient(circle_at_top,#1a090d,#0d0307_55%,#050203)] px-6 py-10 text-amber-50"
      style={{ overscrollBehavior: "none" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_16%,rgba(255,173,94,0.35),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(255,84,62,0.22),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(99,102,241,0.18),transparent_70%)] blur-[6px]" />

      <header className="relative z-30 flex flex-col items-center gap-4 text-center">
        <Image
          src="/logo2.png"
          alt="Campfire Vertical Stack Logo"
          width={40}
          height={40}
        />
        <Image
          src="/title.png"
          alt="Campfire Title"
          width={220}
          height={48}
          className="h-auto w-[min(220px,40vw)]"
        />
        <h1 className="text-[clamp(1.75rem,3vw+1rem,2.65rem)] font-semibold tracking-tight text-amber-100">
          {slogan}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-amber-200/80 md:text-base">
          
        </p>
      </header>

      <main className="relative z-20 flex w-full flex-1 flex-col items-center justify-center">
        <section className="relative flex w-full max-w-[380px] items-center justify-center">
          <div
            className="relative h-[72vh] w-full max-h-[660px] cursor-grab touch-none focus:outline-none active:cursor-grabbing"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Campfire album stack"
          >
            <div className="pointer-events-none absolute -inset-16 rounded-[60px] bg-amber-500/10 blur-3xl" />
            <div className="relative h-full w-full [perspective:1200px]">
              {stack.map((item, index) => {
                // Wrap-around so the list behaves like an infinite circular stack
                let delta = index - currentIndex;
                if (delta > totalCards / 2) delta -= totalCards;
                if (delta < -totalCards / 2) delta += totalCards;
                const relativePosition = delta + dragOffset / CARD_GAP;
                const offsetForCard = relativePosition * CARD_GAP;
                const distance = Math.abs(relativePosition);
                const isCreate = "kind" in item;
                const scale = Math.max(0.85, 1 - distance * 0.08);
                const gradient = item.gradient;

                const elevate = distance < 1 ? distance * 18 : 24;
                const defaultShadow = `0 ${18 + elevate}px ${
                  60 + elevate * 1.2
                }px rgba(12, 7, 3, ${Math.max(0, 0.45 - distance * 0.18)})`;
                const createShadow = `0 ${24 + elevate}px ${
                  80 + elevate * 1.4
                }px rgba(255, 149, 64, 0.45)`;

                const depthShift = (() => {
                  const base = Math.min(distance * 180, 420);
                  if (relativePosition < 0) {
                    return -120 - base;
                  }
                  if (relativePosition > 0) {
                    return -base * 0.4;
                  }
                  return 0;
                })();

                const isThirdOrBeyond = distance >= 2;
                const isFourthOrBeyond = distance >= 3;

                const style: CSSProperties = {
                  backgroundImage: gradient,
                  transform: `translate3d(-50%, calc(-50% + ${offsetForCard - 90}px), ${depthShift}px) scale(${scale})`,
                  boxShadow: isCreate ? createShadow : defaultShadow,
                  zIndex: totalCards - Math.round(distance * 10),
                  opacity: isFourthOrBeyond ? 0 : 1,
                  filter: isThirdOrBeyond && !isFourthOrBeyond ? 'blur(6px)' : 'none',
                  transition: isDragging
                    ? "none"
                    : `transform ${TRANSITION_MS}ms ease-in-out, opacity ${TRANSITION_MS}ms ease-in-out, box-shadow ${TRANSITION_MS}ms ease-in-out, filter ${TRANSITION_MS}ms ease-in-out`,
                  pointerEvents: isFourthOrBeyond ? 'none' : 'auto',
                  willChange: 'transform, opacity, filter',
                };

                const key = isCreate ? "create-card" : (item as CardMeta).id;

                return (
                  <article
                    key={key}
                    className={`absolute left-1/2 top-1/2 flex w-full max-w-sm flex-col justify-between rounded-[28px] px-8 py-10 text-[#110502] backdrop-blur-[2px] ${
                      isCreate ? "create-card" : ""
                    }`}
                    style={style}
                    aria-hidden={isFourthOrBeyond}
                  >
                    {isCreate ? (
                      <Link
                        href={"/create"}
                        className="flex flex-col flex-1 justify-between"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onPointerMove={(e) => {
                          e.stopPropagation();
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <header className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.28em] text-[#110502]/60">
                          <span className="font-semibold text-[#110502]">00</span>
                          <span className="rounded-full border border-[#110502]/30 px-3 py-1">
                            New
                          </span>
                        </header>
                        <div className="flex flex-1 gap-4 items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-[#1a0702] bg-white/40">
                            +
                          </div>
                          <div className="flex flex-col justify-center">
                            <h2 className="text-[clamp(1.55rem,3.5vw,2.15rem)] font-semibold tracking-tight text-[#110502]">
                              새 앨범 만들기
                            </h2>
                            <p className="text-sm leading-relaxed text-[#110502]/80">
                              오늘의 새로운 트랙을 시작하세요.
                            </p>
                          </div>
                        </div>
                        {/* Start 버튼 제거: 카드 전체가 링크로 동작합니다. */}
                      </Link>
                    ) : (
                      <Link
                        href="/player"
                        className="flex flex-col flex-1 justify-between"
                        onPointerDown={(e) => { e.stopPropagation(); }}
                        onPointerMove={(e) => { e.stopPropagation(); }}
                        onPointerUp={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <header className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.28em] text-[#110502]/60">
                          <span className="font-semibold">
                            {String(index).padStart(2, "0")}
                          </span>
                          <span className="rounded-full border border-[#110502]/30 px-3 py-1">
                            Album
                          </span>
                        </header>
                        <div className="space-y-4">
                          <h2 className="text-[clamp(1.55rem,3.5vw,2.15rem)] font-semibold tracking-tight text-[#110502]">
                            {(item as CardMeta).title}
                          </h2>
                          <p className="text-sm leading-relaxed text-[#110502]/80">
                            {(item as CardMeta).subtitle}
                          </p>
                        </div>
                        <footer className="pt-6">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full bg-white/40 px-5 py-2 text-sm font-semibold text-[#110502] shadow-[0_15px_30px_rgba(255,255,255,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-white/55 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60"
                          >
                            Play Preview
                          </button>
                        </footer>
                      </Link>
                    )}
                    <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/35 via-white/0 to-transparent mix-blend-screen" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
