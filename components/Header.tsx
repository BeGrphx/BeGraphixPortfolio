import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-60"
        >
          BeGraphix
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-white/80 transition-opacity hover:opacity-100"
          >
            Work
          </Link>
          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] text-white/80 transition-opacity hover:opacity-100"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
