'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const RECORDING_DURATION_MS = 3000;

const preferredMimeTypes = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function CreatePage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number>();
  const stopTimeoutRef = useRef<number>();

  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedMimeType = useMemo(() => pickSupportedMimeType(), []);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { exact: "environment" },
          },
          audio: true,
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: true,
          });
        }

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setError(null);
        setCameraReady(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .catch(() => {
              /* ignore autoplay rejection */
            });
        }
      } catch (err) {
        console.error(err);
        setError("카메라를 사용할 수 없어요. 권한을 확인해 주세요.");
        setCameraReady(false);
      }
    };

    startCamera();

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      mounted = false;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);

      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }

      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const navigateToLoading = useCallback(() => {
    router.push("/create/loading");
  }, [router]);

  const persistRecording = useCallback(
    (blob: Blob) => {
      if (!blob || blob.size === 0) {
        navigateToLoading();
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          sessionStorage.setItem(
            "create-recording",
            typeof reader.result === "string" ? reader.result : "",
          );
        } catch (storageError) {
          console.warn("Failed to save recording to sessionStorage", storageError);
        } finally {
          navigateToLoading();
        }
      };
      reader.readAsDataURL(blob);
    },
    [navigateToLoading],
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const handleRecord = useCallback(() => {
    if (!cameraReady || isRecording || !streamRef.current) {
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("이 브라우저에서는 영상을 녹화할 수 없어요.");
      return;
    }

    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: supportedMimeType,
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = undefined;
        }
        if (stopTimeoutRef.current) {
          window.clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = undefined;
        }

        setIsRecording(false);
        setRemainingMs(null);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        persistRecording(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRemainingMs(RECORDING_DURATION_MS);

      countdownIntervalRef.current = window.setInterval(() => {
        setRemainingMs((prev) => {
          if (prev === null) return null;
          const next = Math.max(prev - 100, 0);
          return next;
        });
      }, 100);

      stopTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION_MS);
    } catch (err) {
      console.error(err);
      setError("녹화를 시작할 수 없어요. 잠시 후 다시 시도해 주세요.");
      setIsRecording(false);
      setRemainingMs(null);
    }
  }, [cameraReady, isRecording, persistRecording, stopRecording, supportedMimeType]);

  const countdownSeconds = useMemo(() => {
    if (remainingMs === null) return null;
    return (remainingMs / 1000).toFixed(1);
  }, [remainingMs]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        autoPlay
        muted
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 pointer-events-none" />

      <header className="relative z-20 flex w-full max-w-5xl flex-col items-center gap-3 px-6 pt-12 text-center md:pt-16">
        <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-white/80">
          Fireside Capture
        </span>
        <h1 className="text-[clamp(1.9rem,3vw+1rem,2.8rem)] font-semibold tracking-tight text-white">
          새로운 앨범을 불러올 시간이에요
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
          후면 카메라로 3초 영상을 찍어 보세요. <br />녹화가 끝나면 자동으로 다음 단계로 넘어갈 거예요.
        </p>
      </header>

      <main className="relative z-20 flex w-full flex-1 flex-col items-center justify-end pb-16">
        <div className="mb-6 text-sm uppercase tracking-[0.4em] text-white/70">
          {cameraReady ? (
            isRecording ? `Recording ${countdownSeconds ?? ""}s` : "Ready to record"
          ) : (
            <span>{error ? "" : "Setting up camera..."}</span>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm text-red-100 backdrop-blur-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleRecord}
          disabled={!cameraReady || isRecording || !!error}
          className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 transition duration-300 ease-out hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
              isRecording ? "bg-red-500/90 scale-90" : "bg-white/90 text-black"
            }`}
          >
            {isRecording ? (
              <span className="h-7 w-7 rounded-lg bg-red-700/90" />
            ) : (
              <span className="h-8 w-8 rounded-full border-4 border-black/70" />
            )}
          </span>
        </button>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-white/60">
          Tap to record 3s
        </p>
      </main>
    </div>
  );
}
