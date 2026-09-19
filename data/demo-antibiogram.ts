// Datos completamente simulados para ilustrar la gráfica interactiva de
// sensibilidad antimicrobiana (ver docs sección 17). NUNCA usar como
// referencia clínica real.
export interface AntibiogramRow {
  antimicrobiano: string;
  UCI: number;
  Hospitalizacion: number;
  Urgencias: number;
}

export const antibiogramData: Record<string, AntibiogramRow[]> = {
  'sensibilidad-antimicrobiana-2026': [
    { antimicrobiano: 'Ampicilina', UCI: 32, Hospitalizacion: 41, Urgencias: 48 },
    { antimicrobiano: 'Ceftriaxona', UCI: 68, Hospitalizacion: 74, Urgencias: 81 },
    { antimicrobiano: 'Ciprofloxacina', UCI: 55, Hospitalizacion: 61, Urgencias: 70 },
    { antimicrobiano: 'Piperacilina-tazobactam', UCI: 82, Hospitalizacion: 87, Urgencias: 90 },
    { antimicrobiano: 'Meropenem', UCI: 96, Hospitalizacion: 97, Urgencias: 98 },
  ],
  'antibiograma-institucional-2026-demo-norte': [
    { antimicrobiano: 'Ampicilina', UCI: 28, Hospitalizacion: 38, Urgencias: 44 },
    { antimicrobiano: 'Ceftriaxona', UCI: 61, Hospitalizacion: 70, Urgencias: 77 },
    { antimicrobiano: 'Ciprofloxacina', UCI: 49, Hospitalizacion: 58, Urgencias: 66 },
    { antimicrobiano: 'Piperacilina-tazobactam', UCI: 79, Hospitalizacion: 84, Urgencias: 88 },
    { antimicrobiano: 'Meropenem', UCI: 94, Hospitalizacion: 96, Urgencias: 97 },
  ],
};
