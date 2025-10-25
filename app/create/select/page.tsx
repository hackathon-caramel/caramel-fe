'use client';

import { Suspense, useCallback, useMemo, useState } from "react";
// removed gradient borders from keyword cards
import { useRouter, useSearchParams } from "next/navigation";

type KeywordOption = {
  id: string;
  label: string;
  description: string;
};

const KEYWORD_OPTIONS: KeywordOption[] = [
  {
    id: "campfire-story",
    label: "Campfire Story",
    description: "밤공기를 가르는 목소리와 장작 타는 소리를 담아요.",
  },
  {
    id: "dawn-chorus",
    label: "Dawn Chorus",
    description: "새벽녘 새소리와 함께 시작되는 첫 트랙.",
  },
  {
    id: "city-echo",
    label: "City Echo",
    description: "도시의 반짝이는 하루를 감싸는 리듬.",
  },
];

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialKeyword = useMemo(() => searchParams.get("keyword") ?? "", [searchParams]);

  const [selectedKeyword, setSelectedKeyword] = useState(initialKeyword);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback((keywordId: string) => {
    setSelectedKeyword(keywordId);
    setError(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedKeyword) {
      setError("키워드를 선택해 주세요.");
      return;
    }
    router.push(`/create/loading/generate?keyword=${encodeURIComponent(selectedKeyword)}`);
  }, [router, selectedKeyword]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-10 text-amber-50"
      style={{ background: 'radial-gradient(circle at top, #1a090d, #0d0307 55%, #050203)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 blur-[6px]"
        style={{
          background:
            'radial-gradient(70% 40% at 50% 16%, rgba(255,173,94,0.35), transparent 70%), radial-gradient(55% 45% at 18% 88%, rgba(255,84,62,0.22), transparent 75%), radial-gradient(50% 35% at 80% 78%, rgba(99,102,241,0.18), transparent 70%)',
        }}
      />

      <header className="relative z-10 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-amber-300/40 bg-amber-500/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-amber-200/80">
          Select Keyword
        </span>
        <h1 className="text-[clamp(1.7rem,3vw+1rem,2.5rem)] font-semibold tracking-tight text-amber-100">
          어떤 분위기의 앨범을 만들까요?
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-amber-100/80 md:text-base">
          아래 키워드 중 하나를 골라 시작해 주세요. <br />선택한 키워드에 따라 앨범 커버와 분위기가 달라집니다.
        </p>
      </header>

      <main className="relative z-10 flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 py-8">
        <div className="grid w-full gap-4 md:grid-cols-3">
          {KEYWORD_OPTIONS.map((option) => {
            const isActive = option.id === selectedKeyword;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`group relative flex h-full flex-col rounded-2xl border px-5 py-6 text-left transition duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 ${
                  isActive
                    ? "border-amber-200 bg-white/10 shadow-[0_25px_70px_rgba(255,173,94,0.25)]"
                    : "border-white/10 bg-white/5 hover:border-amber-300/40 hover:bg-amber-500/10"
                }`}
              >
                <span
                  className={`absolute inset-x-4 bottom-4 h-12 rounded-full blur-3xl transition-opacity duration-300 ${
                    isActive ? "opacity-70 bg-amber-500/60" : "opacity-0 bg-amber-500/40 group-hover:opacity-30"
                  }`}
                />
                <div className="relative flex flex-col gap-3">
                  <span className="inline-flex w-min items-center justify-center rounded-full border border-amber-300/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.33em] text-amber-100/80">
                    {isActive ? "Selected" : "Keyword"}
                  </span>
                  <h2
                    className={`text-[clamp(1.25rem,2.6vw,1.6rem)] font-semibold tracking-tight ${
                      isActive ? "text-white" : "text-amber-50"
                    }`}
                  >
                    {option.label}
                  </h2>
                  <p className="text-[0.9rem] leading-relaxed text-amber-100/80">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100 backdrop-blur-sm">
            {error}
          </div>
        )}
      </main>

      <footer className="relative z-10 flex w-full max-w-3xl items-center justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-[0_20px_40px_rgba(255,173,94,0.45)] transition hover:from-amber-400 hover:to-orange-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60"
        >
          Continue
        </button>
      </footer>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10 text-amber-50"
        style={{ background: 'radial-gradient(circle at top, #1a090d, #0d0307 55%, #050203)' }}
      >
        <div className="pointer-events-none absolute inset-0 blur-[6px]" style={{ background: 'radial-gradient(70% 40% at 50% 16%, rgba(255,173,94,0.35), transparent 70%), radial-gradient(55% 45% at 18% 88%, rgba(255,84,62,0.22), transparent 75%), radial-gradient(50% 35% at 80% 78%, rgba(99,102,241,0.18), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
          <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
            준비하고 있어요...
          </h1>
        </div>
      </div>
    }>
      <SelectContent />
    </Suspense>
  );
}
