'use client';

type TonearmProps = {
  isPlaying: boolean;
  angle: number; // degrees around pivot
};

export default function Tonearm({ isPlaying, angle }: TonearmProps) {

  return (
    <div className="pointer-events-none absolute -top-3 right-2 z-30 select-none">
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
        {/* Base pivot */}
        <circle cx="130" cy="12" r="10" fill="rgba(0,0,0,0.6)" />
        <circle cx="130" cy="12" r="6" fill="rgba(255,255,255,0.8)" />

        {/* Arm + head (rotates around pivot) */}
        <g
          transform={`rotate(${angle}, 130, 12)`}
          className={isPlaying ? 'tonearm-sway' : undefined}
          style={{ transformOrigin: '130px 12px' }}
        >
          {/* Arm */}
          <rect x="128.5" y="12" width="3" height="118" rx="1.5" fill="url(#metal)" />
          {/* Small joint */}
          <circle cx="130" cy="60" r="2.6" fill="rgba(255,255,255,0.7)" />
          {/* Cartridge/needle head */}
          <rect x="120" y="128" width="20" height="9" rx="2" fill="rgba(20,20,22,0.9)" />
          <rect x="127" y="131" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.85)" />
        </g>

        <defs>
          <linearGradient id="metal" x1="130" y1="12" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(230,230,235,0.95)" />
            <stop offset="0.5" stopColor="rgba(180,180,190,0.9)" />
            <stop offset="1" stopColor="rgba(120,120,130,0.95)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
