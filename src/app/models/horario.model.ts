// models/horario.model.ts

export interface Horario {
    dia: string;
    manana: boolean;
    tarde: boolean;
    horariosManana: string[];
    horariosTarde: string[];
  }
  