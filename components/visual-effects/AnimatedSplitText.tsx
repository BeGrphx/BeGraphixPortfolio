"use client";

import { motion } from "framer-motion";
import { useVisualEffect } from "@/hooks/useVisualEffectsCapabilities";

interface AnimatedSplitTextProps {
  text: string;
  className?: string;
  as?: "span" | "p" | "h1" | "h2";
  delay?: number;
}

export function AnimatedSplitText({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
}: AnimatedSplitTextProps) {
  const enabled = useVisualEffect("splitHeadlines");
  const MotionTag = motion.create(Tag);

  if (!enabled) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <MotionTag className={className} aria-label={text}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: delay + index * 0.028,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionTag>
  );
}
