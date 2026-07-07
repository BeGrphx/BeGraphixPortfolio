export function HeroDivider() {
  return (
    <div className="pointer-events-none relative z-20 w-full">
      <div className="mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      <div className="absolute left-1/2 top-0 h-6 w-1/2 max-w-xl -translate-x-1/2 -translate-y-1/2 bg-foreground/5 blur-xl" />
      <div className="h-20 bg-background md:h-28" />
    </div>
  );
}
