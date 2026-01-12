export interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  password: string; // En el frontend, este campo no debería ser accesible o mostrar su valor
  email: string;
  phone: string;
  role_id?: number; // ID del rol
  role?: string; // Para compatibilidad (deprecated)
  role_obj?: {
    id: number;
    name: string;
  }; // Relación con tabla roles
  tenant_id?: number; // ID del tenant
  active: boolean;
}
