export default function enableCursorGlow(overlay: HTMLElement) {
  const glow = overlay.querySelector<HTMLElement>(".cursor-glow");
  if (!glow) return;

  const move = (e: MouseEvent) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  };

  overlay.addEventListener("mousemove", move);

  // Return cleanup function
  return () => overlay.removeEventListener("mousemove", move);
}