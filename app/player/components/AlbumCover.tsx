type AlbumCoverProps = {
  colors: [string, string, string];
  isPlaying?: boolean;
  onClick?: () => void;
};

export default function AlbumCover({ colors, isPlaying = false, onClick }: AlbumCoverProps) {
  const [color1, color2, color3] = colors;

  return (
    <button
      onClick={onClick}
      className="relative aspect-square w-full rounded-[32px] shadow-2xl cursor-pointer transition-transform hover:scale-105 overflow-hidden"
      style={{
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 세로 3색 배경 */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" style={{ backgroundColor: color1 }} />
        <div className="flex-1" style={{ backgroundColor: color2 }} />
        <div className="flex-1" style={{ backgroundColor: color3 }} />
      </div>

      {/* 우측 상단 둥근 모서리 장식 */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30"
        style={{ backgroundColor: color2 }}
      />
      <div
        className="absolute top-8 right-4 w-20 h-20 rounded-full opacity-20"
        style={{ backgroundColor: color3 }}
      />

      {/* 좌측 하단 둥근 모서리 장식 */}
      <div
        className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-25"
        style={{ backgroundColor: color1 }}
      />
      <div
        className="absolute bottom-6 left-6 w-24 h-24 rounded-full opacity-15"
        style={{ backgroundColor: color2 }}
      />

      {/* 중앙 작은 원들 (깊이감) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: color3 }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full opacity-10"
        style={{ backgroundColor: color1 }}
      />

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/0 to-transparent" />

      {/* Playing animation pulse */}
      {isPlaying && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}

      {/* 클릭 힌트 아이콘 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
      </div>
    </button>
  );
}
