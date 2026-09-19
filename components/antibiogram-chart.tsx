'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AntibiogramRow } from '@/data/demo-antibiogram';
import { cn } from '@/lib/utils';

const services = ['UCI', 'Hospitalizacion', 'Urgencias'] as const;
const serviceLabels: Record<(typeof services)[number], string> = {
  UCI: 'UCI',
  Hospitalizacion: 'Hospitalización',
  Urgencias: 'Urgencias',
};

export function AntibiogramChart({ data }: { data: AntibiogramRow[] }) {
  const [active, setActive] = useState<(typeof services)[number]>('UCI');

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {services.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              active === s ? 'border-primary-500 bg-primary-500 text-white' : 'border-border-strong bg-white text-ink-soft'
            )}
          >
            {serviceLabels[s]}
          </button>
        ))}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E6E4DF" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#6B7684' }} />
            <YAxis type="category" dataKey="antimicrobiano" width={160} tick={{ fontSize: 12, fill: '#0B1220' }} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Sensibilidad']} />
            <Bar dataKey={active} fill="#0F5C5C" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        Datos simulados con fines demostrativos. No representan un antibiograma real.
      </p>
    </div>
  );
}
