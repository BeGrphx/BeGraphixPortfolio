import type Lenis from "lenis";

export function getScrollY(lenis: Lenis | null | undefined): number {
  return lenis?.scroll ?? window.scrollY;
}

export function getMaxScrollY(): number {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

export function restoreScrollPosition(
  lenis: Lenis | null | undefined,
  targetY: number,
) {
  const y = Math.min(Math.max(0, targetY), getMaxScrollY());

  lenis?.resize?.();

  if (lenis) {
    lenis.scrollTo(y, { immediate: true, force: true });
    return;
  }

  window.scrollTo({ top: y, behavior: "instant" });
}

export function scrollToTop(lenis: Lenis | null | undefined) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function lockPageScroll(lenis: Lenis | null | undefined) {
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

export function unlockPageScroll(lenis: Lenis | null | undefined) {
  lenis?.start();
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

export function shouldSkipScrollToTop(pathname: string): boolean {
  if (pathname !== "/") return false;

  const { hash, search } = window.location;
  if (hash === "#projects") return true;

  const filter = new URLSearchParams(search).get("filter");
  return filter === "personal" || filter === "professional" || filter === "showreel";
}
