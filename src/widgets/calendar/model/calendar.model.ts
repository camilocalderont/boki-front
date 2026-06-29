export interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  date: Date;
  stateId: number;
  stateName: string;
  clientName: string;
  professionalName: string;
  data: any;
}

export type CalendarViewMode = 'week' | 'day';

export type StateColorSet = { bg: string; border: string; text: string };

const STATE_COLORS_LIGHT: Record<number, StateColorSet> = {
  1: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },  // Programada — azul
  2: { bg: '#D1FAE5', border: '#22C55E', text: '#166534' },  // Confirmada — verde
  3: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },  // Cancelada — rojo
  4: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },  // Reagendada — ámbar
  5: { bg: '#A7F3D0', border: '#10B981', text: '#065F46' },  // Completada — esmeralda
  6: { bg: '#E5E7EB', border: '#6B7280', text: '#374151' },  // No se presentó — gris
};

const STATE_COLORS_DARK: Record<number, StateColorSet> = {
  1: { bg: '#1E3A5F', border: '#3B82F6', text: '#93C5FD' },  // Programada — azul
  2: { bg: '#14532D', border: '#22C55E', text: '#86EFAC' },  // Confirmada — verde
  3: { bg: '#7F1D1D', border: '#EF4444', text: '#FCA5A5' },  // Cancelada — rojo
  4: { bg: '#78350F', border: '#F59E0B', text: '#FDE68A' },  // Reagendada — ámbar
  5: { bg: '#064E3B', border: '#10B981', text: '#6EE7B7' },  // Completada — esmeralda
  6: { bg: '#374151', border: '#6B7280', text: '#D1D5DB' },  // No se presentó — gris
};

/** @deprecated Use getStateColors() for dark mode support */
export const STATE_COLORS = STATE_COLORS_LIGHT;

export function getStateColors(stateId: number, isDark = false): StateColorSet {
  const palette = isDark ? STATE_COLORS_DARK : STATE_COLORS_LIGHT;
  return palette[stateId] ?? palette[1];
}
