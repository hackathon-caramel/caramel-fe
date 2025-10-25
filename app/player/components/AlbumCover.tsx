type AlbumCoverProps = {
  colors: [string, string, string];
  isPlaying?: boolean;
  onClick?: () => void;
  title?: string;
  artist?: string;
};

export default function AlbumCover({ colors, isPlaying = false, onClick, title, artist }: AlbumCoverProps) {
  const [color1, color2, color3] = colors;

  return (
    <button
      onClick={onClick}
      aria-label={title ? `${title} - ${artist ?? ''}` : '앨범 커버 열기'}
      className="relative aspect-square w-full rounded-[28px] cursor-pointer overflow-hidden transform transition-all hover:scale-[1.03]"
      style={{
        // Match main page card shadow
        boxShadow: '0 18px 60px rgba(12, 7, 3, 0.45)',
        backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 55%, ${color3} 100%)`,
      }}
    >
      {/* Subtle glass ring like main cards */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-white/8 backdrop-blur-[2px]" />

      {/* Vinyl/Art placeholder */}
      <div className="relative z-10 m-6 h-[calc(100%-48px)] rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
        <div
          className={`relative aspect-square w-[78%] rounded-xl overflow-hidden flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}
          style={{
            boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.35), 0 18px 40px rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.06)',
            backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color3} 100%)`,
          }}
        >
          {/* Center highlight */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full bg-white/20" />
          </div>

          {/* Play hint overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Title / Artist caption at bottom to mirror main design spacing */}
      {(title || artist) && (
        <div className="absolute left-4 right-4 bottom-4 z-20 text-white/90">
          {title && <div className="text-sm font-semibold truncate">{title}</div>}
          {artist && <div className="text-xs text-white/70 truncate mt-0.5">{artist}</div>}
        </div>
      )}

      {/* Mix-blend highlight overlay similar to main cards */}
      <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/35 via-white/0 to-transparent mix-blend-screen" />
    </button>
  );
}
