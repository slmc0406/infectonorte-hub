import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { getInstitutionById } from '@/data/institutions';
import { InstitutionEditPanel } from '@/components/institution-edit-panel';
import { DemoBadge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Institución · Admin', robots: { index: false, follow: false } };

export default function InstitutionDetailPage({ params }: { params: { id: string } }) {
  const institution = getInstitutionById(params.id);
  if (!institution) notFound();

  const h = headers();
  const host = h.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-ink">{institution.name}</h1>
        {institution.isDemo && <DemoBadge />}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{institution.city}, {institution.department} · /i/{institution.slug}</p>

      <div className="mt-8">
        <InstitutionEditPanel institution={institution} siteUrl={siteUrl} />
      </div>
    </div>
  );
}
