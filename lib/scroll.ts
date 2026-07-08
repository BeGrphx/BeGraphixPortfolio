import type Lenis from "lenis";

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
