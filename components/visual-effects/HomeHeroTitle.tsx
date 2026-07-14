"use client";

import { AnimatedSplitText } from "./AnimatedSplitText";

interface HomeHeroTitleProps {
  line1: string;
  line2: string;
  className?: string;
}

export function HomeHeroTitle({ line1, line2, className = "" }: HomeHeroTitleProps) {
  return (
    <h1 className={className}>
      <AnimatedSplitText text={line1} delay={0.1} />
      <br />
      <AnimatedSplitText text={line2} delay={0.35} />
    </h1>
  );
}
