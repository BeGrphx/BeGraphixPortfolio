interface KeywordGridProps {
  columns: string[][];
  className?: string;
}

export function KeywordGrid({ columns, className = "" }: KeywordGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-6 gap-y-4 border-t border-neutral-800 pt-8 md:grid-cols-4 md:gap-x-8 ${className}`}
    >
      {columns.map((items, colIndex) => (
        <ul key={colIndex} className="space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="font-mono text-[11px] leading-relaxed text-muted sm:text-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
