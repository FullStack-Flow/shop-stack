import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface CopyrightProps {
  brand: string;
  legalLinks: { label: string; to: string }[];
  year?: number;
  className?: string;
}

export default function Copyright({
  brand,
  legalLinks,
  year = new Date().getFullYear(),
  className,
}: CopyrightProps) {
  return (
    <div
      className={cn(
        'flex w-full @6xl:flex-row flex-col items-start justify-between gap-4',
        className
      )}
    >
      <p className="font-mono text-body-70">
        © {year} {brand}. All rights reserved.
      </p>

      {!!legalLinks.length && (
        <div className="flex flex-wrap items-center gap-3 text-body-70">
          {legalLinks.map((l, i) => (
            <div key={l.label} className="flex items-center gap-3">
              {i > 0 && <span className="text-body-70">|</span>}
              <Link to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
