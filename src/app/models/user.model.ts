export interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  password: string; // En el frontend, este campo no debería ser accesible o mostrar su valor
  email: string;
  phone: string;
  role: string;
  active: boolean;
}
