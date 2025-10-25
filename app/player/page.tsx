'use client';

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AlbumCover from "./components/AlbumCover";

type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  colors: [string, string, string];
};

const mockTrack: Track = {
  id: "ghost-01",
  title: "봄노래",
  artist: "Ghost Bookstore",
  duration: 234,
  colors: ["#a8e6cf", "#dcedc1", "#ffd3b6"],
};

const mockTags = ['인디', '어쿠스틱', '봄', '새벽 감성', '산책'];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const progress = (currentTime / mockTrack.duration) * 100;

  // 비디오 재생 속도 설정
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, []);

  // 음악 재생 타이머
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= mockTrack.duration) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // 재생/일시정지 토글 함수
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * mockTrack.duration;
    setCurrentTime(newTime);
  }, []);

  // 다음 곡 (기능은 현재 목업)
  const handleNextTrack = () => {
    console.log("다음 곡으로 넘어갑니다.");
    setCurrentTime(0);
  };

  const openVideoModal = useCallback(() => {
    setShowVideoModal(true);
  }, []);

  const closeVideoModal = useCallback(() => {
    setShowVideoModal(false);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMore = useCallback(() => {
    console.log("더보기 메뉴 열기");
  }, []);

  const handleViewSavedVideo = useCallback(() => {
    setShowVideoModal(true);
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      {/* 메인 플레이어 섹션 */}
      <section
        className="relative h-screen w-full flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${mockTrack.colors[0]} 0%, ${mockTrack.colors[1]} 50%, ${mockTrack.colors[2]} 100%)`,
        }}
      >
        {/* 밝은 오버레이로 부드럽게 */}
        <div className="absolute inset-0 bg-white/10" />

        {/* 상단에서 하단으로 미묘한 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

        {/* 상단 버튼들 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
          {/* 좌측: 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition hover:bg-black/30 shadow-lg text-white"
            aria-label="뒤로가기"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 우측: 더보기 버튼 */}
          <button
            onClick={handleMore}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition hover:bg-black/30 shadow-lg text-white"
            aria-label="더보기"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 pt-20 text-white">

          {/* 중앙: 앨범 아트 카드 (클릭 가능) */}
          <div className="flex-1 flex items-center justify-center max-w-md w-full px-4 min-h-0">
            <div className="relative w-full max-w-[min(85vw,380px)] max-h-[40vh]">
              {/* Glow effect - 더 강하게 */}
              <div
                className="absolute inset-0 -m-8 rounded-[48px] opacity-40 blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${mockTrack.colors[1]} 0%, ${mockTrack.colors[0]} 100%)`,
                }}
              />

              {/* Album Cover Component */}
              <AlbumCover
                colors={mockTrack.colors}
                isPlaying={isPlaying}
                onClick={openVideoModal}
              />
            </div>
          </div>

          {/* 하단: 곡 정보 및 컨트롤 */}
          <div className="w-full max-w-md space-y-4 pb-8 flex-shrink-0">
            {/* 곡 정보 */}
            <div className="text-center px-4">
              <h1 className="text-[clamp(1.25rem,4vw,2.25rem)] font-bold tracking-tight truncate">
                {mockTrack.title}
              </h1>
              <p className="text-sm md:text-base text-white/70 truncate mt-1">
                {mockTrack.artist}
              </p>
            </div>

            {/* 프로그레스 바 */}
            <div className="px-6">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg"
              />
              <div className="mt-2 flex justify-between text-xs font-medium text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(mockTrack.duration)}</span>
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-6 md:gap-8">
              <button
                className="text-white transition hover:scale-110"
                aria-label="이전 곡"
              >
                <svg className="h-8 w-8 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105"
                aria-label={isPlaying ? "일시정지" : "재생"}
              >
                {isPlaying ? (
                  <svg className="h-8 w-8 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 md:h-9 md:w-9 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="text-white transition hover:scale-110"
                aria-label="다음 곡"
              >
                <svg className="h-8 w-8 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

          </div>

          {/* 저장된 영상 꺼내보기 버튼 */}
          <div className="w-full max-w-md px-4 pb-6">
            <button
              onClick={handleViewSavedVideo}
              className="w-full rounded-full bg-black/25 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/35 shadow-xl"
            >
              저장된 영상 꺼내보기
            </button>
          </div>
        </div>
      </section>

      {/* 비디오 모달 */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeVideoModal}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeVideoModal}
            className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
            aria-label="닫기"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 비디오 컨테이너 */}
          <div
            className="relative w-full max-w-md aspect-[9/16] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src="/video.mov"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* 상단 그라데이션 오버레이 */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

            {/* 태그 표시 */}
            <div className="absolute top-6 left-6 right-6">
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}