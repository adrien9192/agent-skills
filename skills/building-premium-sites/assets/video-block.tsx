// Explainer video block (mp4 rendered offline by the remotion/ sub-project,
// self-hosted in public/videos). Pattern: muted looping autoplay, poster for the
// first paint, no runtime dependency. The motion engine (engine.ts) pauses
// [data-explainer] videos when prefers-reduced-motion is on.
export function VideoBlock({
  src,
  poster,
  label,
  className = '',
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  return (
    <figure data-wipe className={`kinetic-panel overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--paper2)] p-3 shadow-2xl shadow-slate-900/10 ${className}`}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        data-explainer
        className="h-auto w-full rounded-[calc(var(--radius)-8px)]"
      />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
