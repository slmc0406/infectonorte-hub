import { Resource } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, FileWarning, FileText } from 'lucide-react';

// "Clinical Command Center" — indicadores de alto nivel del portal institucional.
// Hoy son conteos simples sobre el contenido asignado a la institución; la
// arquitectura deja espacio para incorporar indicadores PROA/PCI/IAAS reales
// más adelante sin cambiar este componente (ver docs sección 16).
export function CommandCenter({ resources }: { resources: Resource[] }) {
  const vigentes = resources.filter((r) => r.status === 'vigente').length;
  const proximosRevision = resources.filter((r) => r.status === 'proximo_revision' || r.status === 'en_revision').length;
  const vencidos = resources.filter((r) => r.status === 'vencido').length;
  const total = resources.length;

  const stats = [
    { label: 'Recursos vigentes', value: vigentes, icon: CheckCircle2, tone: 'text-state-vigente bg-state-vigente/10' },
    { label: 'Próximos a revisión', value: proximosRevision, icon: Clock, tone: 'text-state-revision bg-state-revision/10' },
    { label: 'Vencidos', value: vencidos, icon: FileWarning, tone: 'text-state-vencido bg-state-vencido/10' },
    { label: 'Total disponibles', value: total, icon: FileText, tone: 'text-primary-600 bg-primary-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${s.tone}`}>
            <s.icon size={16} strokeWidth={1.75} />
          </span>
          <p className="mt-3 text-2xl font-semibold text-ink">{s.value}</p>
          <p className="text-xs text-ink-faint">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}
