import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type BreadcrumbSegment = {
  title: string;
  href: string;
};

type BreadcrumbsProps = {
  segments: BreadcrumbSegment[];
  className?: string;
};

export function Breadcrumbs({ segments, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex items-center space-x-1.5">
        {segments.map((segment, index) => (
          <li key={`${segment.href}-${index}`} className="flex items-center space-x-1.5">
            <Link
              href={segment.href}
              className={cn(
                'hover:text-foreground transition-colors',
                index === segments.length - 1 ? 'font-medium text-foreground' : ''
              )}
            >
              {segment.title}
            </Link>
            {index < segments.length - 1 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
