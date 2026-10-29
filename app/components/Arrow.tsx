/* The site's one arrow: Google's Material icon arrow_forward (rounded), in
   place of the "→" character, sized to the text around it. The path is the
   one in @mui/icons-material's ArrowForwardRounded, drawn as plain SVG: the
   MUI component styles itself through emotion at render time, which the
   server and the browser write differently, so pages with it failed to
   hydrate. Plain SVG renders the same on both. */

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={`inline-block size-[1em] align-[-0.125em] ${className}`}
    >
      <path d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1" />
    </svg>
  );
}
