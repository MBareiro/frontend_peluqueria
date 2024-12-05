// models/horario.model.ts

export interface Horario {
  active_morning: boolean;
  active_afternoon: boolean;
  afternoon_end: string;
  afternoon_start: string;
  morning_end: string;
  morning_start: string;
  day: number;
  id: number;
  user_id: number;
  // ... otras propiedades
}
  