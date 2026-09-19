import Link from 'next/link';
import { Resource } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { StatusBadge, DemoBadge, Badge } from '@/components/ui/badge';
import { typeLabels } from '@/lib/utils';
import { getTypeIcon } from '@/lib/icons';
import { termLabel } from '@/data/taxonomy';

export function ResourceCard({ resource, basePath = '' }: { resource: Resource; basePath?: string }) {
  const Icon = getTypeIcon(resource.type);
  return (
    <Link href={`${basePath}/${resource.typePath}/${resource.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-3 p-5 hover:shadow-float hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <Icon size={18} strokeWidth={1.75} />
          </span>
          {resource.isDemo && <DemoBadge />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-ink leading-snug group-hover:text-primary-600 transition-colors">
            {resource.title}
          </h3>
          <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">{resource.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge>{typeLabels[resource.type]}</Badge>
          {resource.areas.slice(0, 1).map((a) => (
            <Badge key={a}>{termLabel(a)}</Badge>
          ))}
          <StatusBadge status={resource.status} className="ml-auto" />
        </div>
      </Card>
    </Link>
  );
}
