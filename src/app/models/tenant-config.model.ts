export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  favicon_url?: string;
  logo_url?: string;
  policy?: any;
}
