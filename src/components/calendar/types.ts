/**
 * Tipos compartilhados para componentes do calendário
 */

export interface UnifiedCalendarEvent {
  id: string;
  type: string;
  title: string;
  petId: number;
  petName: string;
  tutorName: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  color: string;
  status?: string;
  notes?: string;
}

export interface CalendarFilters {
  types: string[];
  petId?: number;
  tutorId?: number;
}

export interface CalendarAlert {
  petId: number;
  petName: string;
  type: "Vacina" | "Preventivo";
  itemName: string;
  dueDate: string;
  daysRemaining: number;
  urgency: "green" | "yellow" | "red";
}

export type CalendarView = "day" | "week" | "month";
