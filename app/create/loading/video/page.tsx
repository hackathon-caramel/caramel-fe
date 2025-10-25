'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const RECORDING_STORAGE_KEY = "create-recording";

export default function CreateVideoUploadLoadingPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("영상 데이터를 준비하고 있어요...");

  useEffect(() => {
    const mockUpload = async () => {
      const stored = sessionStorage.getItem(RECORDING_STORAGE_KEY);
      if (!stored) {
        // If no recording found, redirect back
        router.replace("/create");
        return;
      }

      // Mock delay for preparing
      await new Promise(resolve => setTimeout(resolve, 1200));
      setStatusMessage("영상 파일을 만들고 있어요...");

      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatusMessage("영상을 업로드하고 있어요...");

      await new Promise(resolve => setTimeout(resolve, 1800));
      setStatusMessage("업로드가 완료되었어요. 다음 단계로 이동합니다...");

      await new Promise(resolve => setTimeout(resolve, 800));

      sessionStorage.removeItem(RECORDING_STORAGE_KEY);
      router.replace("/create/select");
    };

    mockUpload();
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#1a090d,#0d0307_55%,#050203)] text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_16%,rgba(255,173,94,0.35),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(255,84,62,0.22),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(99,102,241,0.18),transparent_70%)] blur-[6px]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
        <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
          영상을 분석하고 있어요
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
