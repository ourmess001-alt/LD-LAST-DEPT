export function LoadingScreen() {
  return (
    <div
      role="status"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#08090c] text-white"
    >
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-[#ff5a36] border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
        Loading 3D Showroom…
      </p>
      <p className="text-xs text-zinc-400 mt-1">Preparing models, lighting and pedestals</p>
    </div>
  );
}

