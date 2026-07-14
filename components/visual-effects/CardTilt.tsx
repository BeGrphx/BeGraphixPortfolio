"use client";

import { type ReactNode, useRef, useState } from "react";
import { useVisualEffect } from "@/hooks/useVisualEffectsCapabilities";

interface CardTiltProps {
  children: ReactNode;
  className?: string;
}

export function CardTilt({ children, className = "" }: CardTiltProps) {
  const enabled = useVisualEffect("cardTilt");
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(900px)");

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
    );
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={ref}
      className={`${className} transition-transform duration-300 ease-out will-change-transform`}
      style={{ transform }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
