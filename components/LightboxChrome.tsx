"use client";

import type { ReactNode } from "react";

interface LightboxChromeProps {
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasMultiple: boolean;
}

export function LightboxChrome({
  onClose,
  onPrev,
  onNext,
  hasMultiple,
}: LightboxChromeProps) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[500] flex items-center justify-between gap-2 bg-gradient-to-b from-black/85 via-black/50 to-transparent px-3 pb-4 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
        {hasMultiple && onPrev ? (
          <NavButton label="Image précédente" onClick={onPrev}>
            ←
          </NavButton>
        ) : (
          <span className="w-10" />
        )}
        <CloseButton onClick={onClose} />
        {hasMultiple && onNext ? (
          <NavButton label="Image suivante" onClick={onNext}>
            →
          </NavButton>
        ) : (
          <span className="w-10" />
        )}
      </div>

      <CloseButton
        onClick={onClose}
        className="absolute right-6 top-6 z-[500] hidden md:flex"
      />

      {hasMultiple && onPrev && onNext && (
        <>
          <SideNavButton
            label="Image précédente"
            onClick={onPrev}
            side="left"
          />
          <SideNavButton
            label="Image suivante"
            onClick={onNext}
            side="right"
          />
        </>
      )}
    </>
  );
}

function CloseButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs uppercase tracking-[0.18em] text-white/80 transition-colors active:bg-white/15 ${className}`}
    >
      Fermer ✕
    </button>
  );
}

function NavButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white/85"
    >
      {children}
    </button>
  );
}

function SideNavButton({
  label,
  onClick,
  side,
}: {
  label: string;
  onClick: () => void;
  side: "left" | "right";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute ${side === "left" ? "left-0" : "right-0"} top-0 z-[480] hidden h-full w-20 items-center justify-center text-white/60 transition-colors hover:bg-white/5 hover:text-white md:flex md:w-28`}
    >
      <span className="text-4xl leading-none">{side === "left" ? "←" : "→"}</span>
    </button>
  );
}
