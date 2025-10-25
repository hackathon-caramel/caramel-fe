'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const keywordToPlayerId: Record<string, string> = {
  "campfire-story": "4",
  "dawn-chorus": "5",
  "city-echo": "4",
};

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("영상을 분석하고 있어요...");

  useEffect(() => {
    const mockGeneration = async () => {
      const keyword = searchParams.get("keyword") ?? "campfire-story";

      // Mock delays for generation process
      await new Promise(resolve => setTimeout(resolve, 11000));
      setStatusMessage("음악을 생성하고 있어요...");

      await new Promise(resolve => setTimeout(resolve, 5000));
      setStatusMessage("앨범 커버를 만들고 있어요...");

      await new Promise(resolve => setTimeout(resolve, 4800));
      setStatusMessage("거의 다 됐어요...");

      await new Promise(resolve => setTimeout(resolve, 3500));

      // Route to the corresponding player based on keyword
      const playerId = keywordToPlayerId[keyword] || "4";
      router.replace(`/player/${playerId}`);
    };

    mockGeneration();
  }, [router, searchParams]);

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
      <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
        앨범을 만들고 있어요
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
        {statusMessage}
      </p>
    </div>
  );
}

export default function CreateGenerateLoadingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#1a090d,#0d0307_55%,#050203)] text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_16%,rgba(255,173,94,0.35),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(255,84,62,0.22),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(99,102,241,0.18),transparent_70%)] blur-[6px]" />

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
          <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
            준비하고 있어요...
          </h1>
        </div>
      }>
        <GenerateContent />
      </Suspense>
    </div>
  );
}
