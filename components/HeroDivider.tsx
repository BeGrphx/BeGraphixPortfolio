export function HeroDivider() {
  return (
    <div className="pointer-events-none relative z-20 -mb-px w-full">
      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-foreground/25 to-transparent dark:via-white/30" />
      <div className="absolute left-1/2 top-0 h-8 w-2/3 max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-foreground/10 blur-2xl dark:bg-white/15" />
      <div className="h-16 bg-gradient-to-b from-transparent to-background md:h-24" />
    </div>
  );
}
