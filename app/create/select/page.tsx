'use client';

import { useCallback, useMemo, useState } from "react";
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

export default function SelectPage() {
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
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[radial-gradient(circle_at_top,#0a0816,#07040f_55%,#04020b)] px-6 py-12 text-violet-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_16%,rgba(139,92,246,0.4),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(236,72,153,0.25),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(244,114,182,0.2),transparent_70%)] blur-[8px]" />

      <header className="relative z-10 flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-violet-300/40 bg-violet-500/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-violet-200/80">
          Select Keyword
        </span>
        <h1 className="text-[clamp(1.8rem,3vw+1rem,2.8rem)] font-semibold tracking-tight text-white">
          어떤 분위기의 앨범을 만들까요?
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-violet-100/75 md:text-base">
          아래 키워드 중 하나를 골라 시작해 주세요. 선택한 키워드에 따라 앨범 커버와 분위기가 달라집니다.
        </p>
      </header>

      <main className="relative z-10 flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 py-10">
        <div className="grid w-full gap-6 md:grid-cols-3">
          {KEYWORD_OPTIONS.map((option) => {
            const isActive = option.id === selectedKeyword;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`group relative flex h-full flex-col rounded-3xl border px-6 py-8 text-left transition duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/60 ${
                  isActive
                    ? "border-violet-200 bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-fuchsia-500/20 shadow-[0_25px_70px_rgba(139,92,246,0.35)]"
                    : "border-white/10 bg-white/5 hover:border-violet-300/40 hover:bg-violet-500/10"
                }`}
              >
                <span
                  className={`absolute inset-x-4 bottom-4 h-16 rounded-full blur-3xl transition-opacity duration-300 ${
                    isActive ? "opacity-70 bg-violet-500/60" : "opacity-0 bg-violet-500/40 group-hover:opacity-30"
                  }`}
                />
                <div className="relative flex flex-col gap-4">
                  <span className="inline-flex w-min items-center justify-center rounded-full border border-violet-300/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-violet-100/80">
                    {isActive ? "Selected" : "Keyword"}
                  </span>
                  <h2
                    className={`text-[clamp(1.35rem,3vw,1.8rem)] font-semibold tracking-tight ${
                      isActive ? "text-white" : "text-violet-50"
                    }`}
                  >
                    {option.label}
                  </h2>
                  <p className="text-sm leading-relaxed text-violet-100/75">{option.description}</p>
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

      <footer className="relative z-10 flex w-full max-w-4xl items-center justify-between gap-4 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-white/40 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-[0_20px_40px_rgba(139,92,246,0.45)] transition hover:from-violet-400 hover:to-fuchsia-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/60"
        >
          Continue
        </button>
      </footer>
    </div>
  );
}
