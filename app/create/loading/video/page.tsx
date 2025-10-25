'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const UPLOAD_ENDPOINT = "http://172.31.252.156:8000/upload-video";
const RECORDING_STORAGE_KEY = "create-recording";

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const mimeType = blob.type || "video/webm";

  return new File([blob], filename, { type: mimeType });
}

export default function CreateVideoUploadLoadingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("영상 데이터를 준비하고 있어요...");

  useEffect(() => {
    const controller = new AbortController();

    const uploadRecording = async () => {
      try {
        const stored = sessionStorage.getItem(RECORDING_STORAGE_KEY);
        if (!stored) {
          setError("녹화된 영상 데이터를 찾을 수 없어요. 다시 촬영해 주세요.");
          return;
        }

        setStatusMessage("영상 파일을 만들고 있어요...");
        const file = await dataUrlToFile(stored, `capture-${Date.now()}.webm`);

        setStatusMessage("영상을 업로드하고 있어요...");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(UPLOAD_ENDPOINT, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await response.text().catch(() => "");
          throw new Error(message || "영상 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
        }

        const contentType = response.headers.get("content-type") ?? "";
        let payload = "";
        if (contentType.includes("application/json")) {
          try {
            payload = JSON.stringify(await response.json());
          } catch {
            payload = "";
          }
        } else {
          payload = await response.text().catch(() => "");
        }

        sessionStorage.removeItem(RECORDING_STORAGE_KEY);
        if (payload) {
          sessionStorage.setItem("create-upload-response", payload);
        }

        setStatusMessage("업로드가 완료되었어요. 다음 단계로 이동합니다...");
        router.replace("/create/select");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : "영상 업로드에 실패했어요. 다시 시도해 주세요.");
      }
    };

    uploadRecording();

    return () => {
      controller.abort();
    };
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_16%,rgba(139,92,246,0.35),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(236,72,153,0.25),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(244,114,182,0.2),transparent_70%)] blur-[8px]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {error ? (
          <>
            <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
              영상 업로드에 실패했어요
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">{error}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(RECORDING_STORAGE_KEY);
                  router.replace("/create");
                }}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/80 transition hover:border-white/50 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/60"
              >
                다시 촬영하기
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
            <h1 className="text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-semibold text-white">
              영상을 업로드하고 있어요
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
              {statusMessage}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
