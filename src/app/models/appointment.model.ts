export interface ListAppointmentItem {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    peluquero: number;
    date: string; // O podrías usar un tipo Date si es más adecuado
    schedule: string;
  }
  