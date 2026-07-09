"use client";

import { useRef, type TouchEvent } from "react";

const SWIPE_THRESHOLD = 48;

export function useLightboxSwipe(
  onPrev: () => void,
  onNext: () => void,
  enabled: boolean,
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!enabled || !touchStart.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX > 0) onPrev();
    else onNext();
  };

  return { onTouchStart, onTouchEnd };
}
