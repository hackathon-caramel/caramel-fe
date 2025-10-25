'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlbumCover from './components/AlbumCover';
import Tonearm from './components/Tonearm';
import { mockAlbums } from '../utils/mockAlbums';

type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  colors: [string, string, string];
};

type Props = {
  uuid?: string;
};

const defaultTrack: Track = {
  id: 'ghost-01',
  title: '봄노래',
  artist: 'Ghost Bookstore',
  duration: 234,
  colors: ['#a8e6cf', '#dcedc1', '#ffd3b6'],
};

const assetsByUuid: Record<string, { image: string; video: string; audio?: string; track: Track }> = {
  '1': {
    image: '/1.png',
    video: '/video1.mov',
    audio: '/1.mp3',
    track: {
      id: '1',
      title: mockAlbums[0].title,
      artist: mockAlbums[0].subtitle,
      duration: 215,
      colors: ['#ffb347', '#ff6f61', '#b33951'],
    },
  },
  '2': {
    image: '/2.png',
    video: '/video2.mov',
    audio: '/2.mp3',
    track: {
      id: '2',
      title: mockAlbums[1].title,
      artist: mockAlbums[1].subtitle,
      duration: 202,
      colors: ['#74ebd5', '#9face6', '#a1c4fd'],
    },
  },
  '3': {
    image: '/3.png',
    video: '/video3.mov',
    audio: '/3.mp3',
    track: {
      id: '3',
      title: mockAlbums[2].title,
      artist: mockAlbums[2].subtitle,
      duration: 198,
      colors: ['#ff9a9e', '#fad0c4', '#fbc2eb'],
    },
  },
  '4': {
    image: '/4.png',
    video: '/video4.mov',
    audio: '/4.mp3',
    track: {
      id: '4',
      title: mockAlbums[3].title,
      artist: mockAlbums[3].subtitle,
      duration: 210,
      colors: ['#fbd3e9', '#bb377d', '#d4a5c0'],
    },
  },
  '5': {
    image: '/5.png',
    video: '/video5.mov',
    audio: '/5.mp3',
    track: {
      id: '5',
      title: mockAlbums[4].title,
      artist: mockAlbums[4].subtitle,
      duration: 225,
      colors: ['#83a4d4', '#b6fbff', '#a0d4e8'],
    },
  },
};

const mockTags = ['인디', '어쿠스틱', '봄', '새벽 감성', '산책'];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerClient({ uuid }: Props) {
  const router = useRouter();

  const { image: imageSrc, video: videoSrc, audio: audioSrc, track } = useMemo(() => {
    if (!uuid) return { image: '/image.png', video: '/video.mov', audio: undefined, track: defaultTrack };
    return assetsByUuid[uuid] ?? { image: '/image.png', video: '/video.mov', audio: undefined, track: defaultTrack };
  }, [uuid]);

  // Start paused by default to avoid autoplay restrictions
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(defaultTrack.duration);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rotationDegRef = useRef(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const progress = (currentTime / (duration || 1)) * 100;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, []);

  // Simulated timer only when no audio source is available
  useEffect(() => {
    if (audioSrc) return; // audio present: real-time comes from audio events
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            if (repeat) {
              return 0;
            }
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, repeat, duration, audioSrc]);

  // When uuid or audioSrc changes, reset timers and load new audio (no autoplay)
  useEffect(() => {
    setCurrentTime(0);
    setDuration(track.duration);
    const audio = audioRef.current;
    if (audio && audioSrc) {
      audio.load();
      // Do not autoplay; wait for explicit user interaction
    }
  }, [audioSrc, track.duration]);

  // Wire audio element events when audioSrc is present
  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioSrc, repeat]);

  // Keep audio element in sync with isPlaying state
  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, audioSrc]);

  // Removed global first-interact autoplay to avoid conflicts with the play button

  useEffect(() => {
    const periodMs = 10000;
    const degPerMs = 360 / periodMs;

    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      rotationDegRef.current = (rotationDegRef.current + dt * degPerMs) % 360;
      setRotationDeg(rotationDegRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (audioSrc && audioRef.current) {
      const audio = audioRef.current;
      if (audio.paused) {
        audio.muted = false;
        audio.volume = 1;
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [audioSrc]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (parseFloat(e.target.value) / 100) * (duration || 1);
      if (audioSrc && audioRef.current) {
        const audio = audioRef.current;
        audio.currentTime = Math.min(Math.max(newTime, 0), duration || newTime);
        setCurrentTime(audio.currentTime);
        return;
      }
      if (!repeat && newTime >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(newTime);
    },
    [repeat, duration, audioSrc]
  );

  const tonearmAngle = useMemo(() => {
    const p = Math.min(Math.max(currentTime / (duration || 1), 0), 1);
    const min = -6;
    const max = 28;
    const base = min + (max - min) * p;
    const bias = -3;
    return base + bias;
  }, [currentTime, duration]);

  const handleNextTrack = () => {
    if (shuffle) {
      const t = Math.floor(Math.random() * track.duration);
      setCurrentTime(t);
      setIsPlaying(true);
      return;
    }
    setCurrentTime(0);
  };

  const openVideoModal = useCallback(() => setShowVideoModal(true), []);
  // If audio exists, clicking the cover should play/pause audio instead of opening video modal
  const handleCoverClick = useCallback(() => {
    if (audioSrc && audioRef.current) {
      const audio = audioRef.current;
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      setShowVideoModal(true);
    }
  }, [audioSrc]);
  const closeVideoModal = useCallback(() => setShowVideoModal(false), []);
  const handleBack = useCallback(() => router.back(), [router]);
  const handleMore = useCallback(() => console.log('더보기 메뉴 열기'), []);
  const handleViewSavedVideo = useCallback(() => setShowVideoModal(true), []);

  return (
    <div className="relative h-screen overflow-hidden text-white bg-[radial-gradient(circle_at_top,#1a090d,#0d0307_55%,#050203)]">
      {/* Hidden audio element for actual playback when available */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          controls={false}
          // Ensure not muted and full volume by default
          onLoadedMetadata={() => {
            const a = audioRef.current; if (a) { a.muted = false; a.volume = 1; }
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_16%,rgba(255,173,94,0.35),transparent_70%),radial-gradient(55%_45%_at_18%_88%,rgba(255,84,62,0.22),transparent_75%),radial-gradient(50%_35%_at_80%_78%,rgba(99,102,241,0.18),transparent_70%)] blur-[6px]" />
      <section className="relative h-screen w-full flex-shrink-0">
        <div
          className="absolute inset-0 opacity-25 blur-3xl"
          style={{ background: `linear-gradient(135deg, ${track.colors[0]} 0%, ${track.colors[1]} 50%, ${track.colors[2]} 100%)` }}
        />

        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
          <button onClick={handleBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition hover:bg-white/30 shadow-lg" aria-label="뒤로가기">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={handleMore} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition hover:bg-white/30 shadow-lg" aria-label="더보기">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 pt-20">
          <div className="flex-1 flex items-center justify-center max-w-md w-full px-4 min-h-0">
            <div className="relative w-full max-w-[min(85vw,380px)] max-h-[40vh]">
              <div
                className="absolute inset-0 -m-6 rounded-[48px] opacity-50 blur-3xl"
                style={{ background: `linear-gradient(135deg, ${track.colors[0]} 0%, ${track.colors[1]} 50%, ${track.colors[2]} 100%)` }}
              />
              <AlbumCover colors={track.colors} isPlaying={isPlaying} onClick={handleCoverClick} title={track.title} artist={track.artist} rotationDeg={rotationDeg} imageSrc={imageSrc} />
              <Tonearm isPlaying={isPlaying} angle={tonearmAngle} />
            </div>
          </div>

          <div className="w-full max-w-md space-y-4 pb-8 flex-shrink-0">
            <div className="text-center px-4">
              <h1 className="text-[clamp(1.25rem,4vw,2.25rem)] font-bold tracking-tight truncate">{track.title}</h1>
              <p className="text-sm md:text-base text-white/70 truncate mt-1">{track.artist}</p>
            </div>

            <div className="px-6">
              <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg" />
              <div className="mt-2 flex justify-between text-xs font-medium text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-8">
              <button onClick={() => setShuffle((prev) => !prev)} className={`flex h-10 w-10 items-center justify-center rounded-full border transition hover:scale-110 ${shuffle ? 'bg-white text-black border-white/0 shadow-xl' : 'text-white border-white/30 bg-white/10 hover:bg-white/20'}`} aria-label={`랜덤 재생 ${shuffle ? '끄기' : '켜기'}`} title={shuffle ? '랜덤 재생: 켜짐' : '랜덤 재생: 꺼짐'}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4 7h3.5c1.2 0 2.3.54 3.08 1.46l2.35 2.77A5 5 0 0 0 15.5 13H20l-2.5 2.5 1.4 1.4L23 12l-4.1-4.9-1.4 1.4L20 11h-4.5c-.92 0-1.8-.4-2.4-1.1L10.8 7.1A6.5 6.5 0 0 0 7.5 5H4v2zM4 17h3.5c1.2 0 2.3-.54 3.08-1.46l.42-.5-1.53-1.29-.42.5c-.6.7-1.48 1.1-2.35 1.1H4v2z" />
                </svg>
              </button>
              <button className="text-white transition hover:scale-110" aria-label="이전 곡">
                <svg className="h-8 w-8 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button onClick={togglePlay} className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105" aria-label={isPlaying ? '일시정지' : '재생'}>
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
              <button onClick={handleNextTrack} className="text-white transition hover:scale-110" aria-label="다음 곡">
                <svg className="h-8 w-8 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
              <button onClick={() => setRepeat((prev) => !prev)} className={`flex h-10 w-10 items-center justify-center rounded-full border transition hover:scale-110 ${repeat ? 'bg-white text-black border-white/0 shadow-xl' : 'text-white border-white/30 bg-white/10 hover:bg-white/20'}`} aria-label={`반복 재생 ${repeat ? '끄기' : '켜기'}`} title={repeat ? '반복 재생: 켜짐' : '반복 재생: 꺼짐'}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17 2l4 4-4 4V7H9a4 4 0 0 0-4 4v1H3V11a6 6 0 0 1 6-6h8V2zM7 22l-4-4 4-4v3h8a4 4 0 0 0 4-4v-1h2v1a6 6 0 0 1-6 6H7v3z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full max-w-md px-4 pb-6">
            <button onClick={handleViewSavedVideo} className="w-full rounded-full bg-white/25 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/35 shadow-xl">저장된 영상 꺼내보기</button>
          </div>
        </div>
      </section>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeVideoModal}>
          <button onClick={closeVideoModal} className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90" aria-label="닫기">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-md aspect-[9/16] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <video ref={videoRef} src={videoSrc} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="absolute top-6 left-6 right-6">
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
                  <span key={tag} className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
