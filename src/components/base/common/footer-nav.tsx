import { Link } from '@tanstack/react-router';

interface FooterNavProps {
  title: string;
  links: {
    label: string;
    to: string;
  }[];
}

export default function FooterNav({ title, links }: FooterNavProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground text-lg">{title}</h4>
      <nav className="flex flex-wrap items-center gap-3">
        {links.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <Link
              to={item.to}
              className="@4xl:text-base @7xl:text-xl text-sm transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
            {index < links.length - 1 && (
              <span className="text-body-70">•</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
