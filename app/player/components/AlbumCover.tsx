import Image from "next/image";

type AlbumCoverProps = {
  colors: [string, string, string];
  isPlaying?: boolean;
  onClick?: () => void;
  title?: string;
  artist?: string;
  rotationDeg?: number;
};

export default function AlbumCover({ colors, isPlaying = false, onClick, title, artist, rotationDeg = 0 }: AlbumCoverProps) {
  const [color1, color2, color3] = colors;

  return (
    <button
      onClick={onClick}
      aria-label={title ? `${title} - ${artist ?? ''}` : '앨범 커버 열기'}
      className="relative aspect-square w-full rounded-full cursor-pointer overflow-hidden transform transition-all hover:scale-[1.03]"
      style={{
        // Match main page card shadow
        boxShadow: '0 18px 60px rgba(12, 7, 3, 0.45)',
        backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 55%, ${color3} 100%)`,
      }}
    >
      {/* Subtle glass ring like main cards */}
      <div className="absolute inset-0 rounded-full ring-1 ring-white/8 backdrop-blur-[2px]" />

      {/* Circular rotating image */}
      <div className="relative z-10 m-6 h-[calc(100%-48px)] rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
        <div
          className={`relative aspect-square w-[90%] rounded-full overflow-hidden`}
          style={{
            boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.35), 0 18px 40px rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.06)',
            transform: `rotate(${rotationDeg}deg)`
          }}
        >
          <Image
            src="/image.png"
            alt={title ? `${title} - ${artist ?? ''}` : '회전 이미지'}
            fill
            className="object-cover"
            priority={false}
          />
          {/* Vinyl grooves overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: 'repeating-radial-gradient(circle, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1.5px, rgba(0,0,0,0) 2.5px, rgba(0,0,0,0) 4px)'
            }}
          />
          {/* Center spindle hole */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex items-center justify-center">
              <span className="block h-5 w-5 rounded-full bg-white/70 shadow-[0_0_6px_rgba(0,0,0,0.35)]" />
              <span className="absolute h-2 w-2 rounded-full bg-black/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Title/Artist caption removed inside cover; shown externally on player page */}

      {/* Mix-blend highlight overlay similar to main cards */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/35 via-white/0 to-transparent mix-blend-screen" />
    </button>
  );
}
