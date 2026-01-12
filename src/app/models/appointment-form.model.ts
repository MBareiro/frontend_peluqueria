// Interfaces para tipar respuestas de servicios
export interface BarberServiceEntry {
  barberId: number;
  barber?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    active: boolean;
  };
}

export interface TimeSlot {
  id: string;
  value: string;
  label: string;
}

export interface ScheduleEntry {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AppointmentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  hairdresserId: number;
  date: Date;
  selectedValue: 'morning' | 'afternoon';
  timeSlot: string;
}
