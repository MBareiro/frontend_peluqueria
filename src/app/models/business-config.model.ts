export interface BusinessConfig {
  id?: number;
  business_name: string;
  business_type: 'barbershop' | 'beauty_salon' | 'nails' | 'spa' | 'massage' | 'tattoo' | 'other';
  
  // Labels
  employee_label_singular: string;
  employee_label_plural: string;
  service_label_singular: string;
  service_label_plural: string;
  appointment_label: string;
  
  // Contact
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  
  // Branding
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  
  // Email
  email_footer_text?: string;
  email_signature?: string;
  
  // Settings
  timezone: string;
  currency: string;
  language: string;
  
  // Social Media
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  
  // Home Page Customization
  home_tagline?: string;
  home_description?: string;
  
  // Hero Section
  hero_title?: string;
  hero_subtitle?: string;
  hero_button_text?: string;
  hero_background_image?: string;
  
  // Carousel
  carousel_image_1?: string;
  carousel_image_2?: string;
  carousel_image_3?: string;
  carousel_auto_play?: boolean;
  carousel_interval?: number;
  
  // Section Visibility
  show_services_section?: boolean;
  show_team_section?: boolean;
  show_testimonials_section?: boolean;
  show_map?: boolean;
  
  // Welcome Section
  welcome_section_title?: string;
  welcome_section_text?: string;
  
  // WhatsApp
  whatsapp_number?: string;
  show_whatsapp_button?: boolean;
  
  // Business Info
  business_hours?: string;
  
  // Custom Styling
  custom_css?: string;
  
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessTypePreset {
  business_type: string;
  employee_label_singular: string;
  employee_label_plural: string;
  service_label_singular: string;
  service_label_plural: string;
  appointment_label: string;
  icon: string;
}
