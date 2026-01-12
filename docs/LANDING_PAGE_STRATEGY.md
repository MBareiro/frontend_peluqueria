# 🏠 Sistema de Páginas de Inicio Multi-Nivel

## 📋 Resumen

Tu sistema ahora tiene **3 páginas de inicio diferentes** que se muestran según el contexto:

1. **Landing Page Genérica** → Dominio raíz en producción (www.turnos.com)
2. **Selector de Tenant** → Localhost sin subdomain (desarrollo)
3. **Home del Tenant** → Con subdomain específico (goku.turnos.com)

---

## 🌐 ¿Cuándo se Muestra Cada Página?

### **1. Landing Page Genérica** 

**URL:** `https://www.turnos.com` (o tu dominio base sin subdomain)

**Se muestra cuando:**
- ✅ Usuario accede al dominio raíz en PRODUCCIÓN
- ✅ No hay subdomain
- ✅ Usuario es visitante general, no un cliente específico

**Contenido:**
```
┌────────────────────────────────────────┐
│   📅 TurnosApp                         │
│   [Características] [Precios] [Login]  │
├────────────────────────────────────────┤
│                                        │
│   Gestiona tu Negocio de Servicios    │
│   Sin Complicaciones                   │
│                                        │
│   Sistema completo de gestión de       │
│   turnos para barberías, salones...    │
│                                        │
│   [Empezar Gratis] [Ver Demo]         │
│                                        │
│   ✓ 10,000+ Turnos  ✓ 500+ Negocios   │
│                                        │
├────────────────────────────────────────┤
│   Perfecto para:                       │
│   💈 Barberías  💅 Salones             │
│   💆 Spas       🎨 Tatuajes           │
│                                        │
├────────────────────────────────────────┤
│   [Planes y Precios]                   │
│   [Testimonios]                        │
│   [Comenzar Ahora]                     │
└────────────────────────────────────────┘
```

**Propósito:**
- Marketing del sistema
- Captar nuevos clientes
- Explicar características
- Mostrar precios
- Link a registro

---

### **2. Selector de Tenant** 

**URL:** `http://localhost:4200` (sin subdomain en desarrollo)

**Se muestra cuando:**
- ✅ Usuario accede a localhost sin subdomain
- ✅ Entorno de DESARROLLO
- ✅ tenant = "default"

**Contenido:**
```
┌────────────────────────────────────────┐
│   🏢 Sistema de Gestión de Turnos      │
│   Selecciona un negocio para continuar │
├────────────────────────────────────────┤
│                                        │
│   💈 Barbería Goku                     │
│   goku.turnos.com                      │
│   [Entrar] ─────────────────────►     │
│                                        │
│   💈 Barbería Vegeta                   │
│   vegeta.turnos.com                    │
│   [Entrar] ─────────────────────►     │
│                                        │
│   💅 Salón Bulma                       │
│   bulma.turnos.com                     │
│   [Entrar] ─────────────────────►     │
│                                        │
│   🔧 Panel de Administración           │
│                                        │
└────────────────────────────────────────┘
```

**Propósito:**
- Facilitar desarrollo
- Cambiar entre tenants rápidamente
- No requiere configurar hosts file
- Solo visible en localhost

---

### **3. Home del Tenant** 

**URL:** `https://goku.turnos.com` (con subdomain específico)

**Se muestra cuando:**
- ✅ Usuario accede con subdomain válido
- ✅ Tanto en desarrollo como producción
- ✅ tenant ≠ "default"

**Contenido:**
```
┌────────────────────────────────────────┐
│   [Logo de Barbería Goku]  [Login]     │
├────────────────────────────────────────┤
│                                        │
│   🎨 Carousel personalizado            │
│   (Imágenes del negocio)               │
│                                        │
├────────────────────────────────────────┤
│                                        │
│   [Reservar Turno] ───────────────►   │
│                                        │
│   📍 Mapa con ubicación del negocio    │
│                                        │
│   📞 Contacto                          │
│   ⏰ Horarios de atención              │
│                                        │
└────────────────────────────────────────┘
```

**Propósito:**
- Página del cliente final
- Mostrar información del negocio
- Permitir reservar turnos
- Branding personalizado

---

## 🔄 Flujo de Redirección Automática

### **Diagrama de Decisión:**

```
Usuario accede a la app
    ↓
¿Hay subdomain?
    ├─ SÍ → HomeComponent (página del tenant)
    │         └─ Carga configuración del negocio
    │         └─ Muestra carousel, mapa, servicios
    │
    └─ NO (tenant = "default")
        ↓
    ¿Es localhost/desarrollo?
        ├─ SÍ → TenantSelectorPage
        │         └─ Lista de tenants disponibles
        │         └─ Usuario selecciona uno
        │         └─ Recarga con tenant guardado
        │
        └─ NO (producción)
            └─ LandingPageComponent
                └─ Página de marketing
                └─ Call-to-action para registro
                └─ Información del sistema
```

---

## 🛠️ Implementación Técnica

### **HomeComponent (home.component.ts)**

```typescript
ngOnInit(): void {
  const tenant = this.tenantService.getTenant();
  
  if (tenant === 'default') {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      // Desarrollo: Selector de tenant
      this.router.navigate(['/select-tenant']);
    } else {
      // Producción: Landing page
      this.router.navigate(['/landing']);
    }
    return;
  }
  
  // Tiene tenant: cargar configuración del negocio
  this.loadBusinessConfig();
}
```

### **Routing (app-routing.module.ts)**

```typescript
const routes: Routes = [
  // Página principal (redirige según contexto)
  { path: '', component: HomeComponent },
  
  // Landing page genérica (producción)
  { path: 'landing', component: LandingPageComponent },
  
  // Selector de tenant (desarrollo)
  { path: 'select-tenant', component: TenantSelectorPageComponent },
  
  // Login, dashboard, etc.
  { path: 'login', component: LoginComponent },
  // ...
];
```

---

## 📊 Tabla Comparativa

| Escenario | URL | Componente | Público Objetivo |
|-----------|-----|------------|------------------|
| Producción sin subdomain | `www.turnos.com` | LandingPageComponent | Marketing, nuevos clientes |
| Desarrollo sin subdomain | `localhost:4200` | TenantSelectorPageComponent | Desarrolladores |
| Con subdomain | `goku.turnos.com` | HomeComponent | Clientes finales del negocio |

---

## 🎨 Características de Cada Página

### **Landing Page (Genérica)**

**Secciones:**
- ✅ Hero con CTA principal
- ✅ Tipos de negocios soportados
- ✅ Características del sistema
- ✅ Cómo funciona (3 pasos)
- ✅ Testimonios
- ✅ Planes y precios
- ✅ CTA final
- ✅ Footer con links legales

**Estilo:**
- Gradientes modernos
- Animaciones suaves
- Responsive completo
- Optimizado para conversión

**CTAs:**
- "Empezar Gratis"
- "Ver Demo"
- Links a registro y login

---

### **Selector de Tenant (Desarrollo)**

**Características:**
- ✅ Lista de todos los tenants activos
- ✅ Búsqueda por nombre
- ✅ Información de cada negocio (nombre, subdomain, tipo)
- ✅ Un clic para seleccionar
- ✅ Guarda en localStorage
- ✅ Recarga automática
- ✅ Link a panel de super admin

**Estilo:**
- Cards con hover effects
- Iconos por tipo de negocio
- Gradiente de fondo
- Nota de "modo desarrollo"

---

### **Home del Tenant (Específica)**

**Características:**
- ✅ Personalización completa
- ✅ Logo del negocio
- ✅ Colores del negocio
- ✅ Carousel con imágenes personalizadas
- ✅ Mapa con ubicación real
- ✅ Información de contacto
- ✅ Botón para reservar turno

**Estilo:**
- Adaptado a business_config del tenant
- Primary y secondary colors dinámicos
- Imágenes del carousel configurables

---

## 🚀 Configuración de Producción

### **DNS Setup**

```
# Dominio base (landing page)
A     turnos.com           → IP_SERVIDOR

# Wildcard para tenants
A     *.turnos.com         → IP_SERVIDOR
```

**Resultado:**
- `www.turnos.com` → Landing Page Genérica
- `turnos.com` → Redirige a www.turnos.com
- `goku.turnos.com` → Home de Barbería Goku
- `vegeta.turnos.com` → Home de Barbería Vegeta
- `cualquier-nombre.turnos.com` → Si existe tenant, su home; si no, error 404

---

### **Nginx Configuration**

```nginx
# Landing page (dominio raíz)
server {
    server_name turnos.com www.turnos.com;
    root /var/www/frontend;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}

# Tenants (subdominios)
server {
    server_name *.turnos.com;
    root /var/www/frontend;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 🎯 Casos de Uso Reales

### **Caso 1: Visitante Nuevo**

```
Usuario busca "sistema turnos barberías" en Google
    ↓
Encuentra: https://www.turnos.com
    ↓
Ve: Landing Page con información del sistema
    ↓
Lee características, precios, testimonios
    ↓
Hace clic: "Empezar Gratis"
    ↓
Redirige: /super-admin (registro de nuevo tenant)
```

---

### **Caso 2: Cliente de Barbería Goku**

```
Cliente recibe WhatsApp: "Reserva en goku.turnos.com"
    ↓
Accede: https://goku.turnos.com
    ↓
Ve: Home personalizado de Barbería Goku
    ↓
Hace clic: "Reservar Turno"
    ↓
Selecciona: Servicio, profesional, fecha, hora
    ↓
Recibe: Confirmación por email
```

---

### **Caso 3: Desarrollador Local**

```
Desarrollador: npm start
    ↓
Accede: http://localhost:4200
    ↓
Ve: Selector de Tenant
    ↓
Selecciona: "Barbería Goku"
    ↓
Se guarda en localStorage
    ↓
Recarga: Home de Barbería Goku
    ↓
Trabaja: Con ese tenant activo
```

---

### **Caso 4: Owner de Negocio**

```
Owner de "Salón Bulma" accede a su panel
    ↓
URL: https://bulma.turnos.com/login
    ↓
Ve: Página de login con logo de su negocio
    ↓
Inicia sesión
    ↓
Accede: Dashboard personalizado
    ↓
Gestiona: Turnos, clientes, horarios
```

---

## 📝 Personalización de la Landing Page

Actualmente la landing usa "TurnosApp" como nombre temporal. Para personalizar:

### **1. Cambiar Nombre y Logo**

```typescript
// landing-page.component.html
<div class="logo">
  <span class="logo-icon">📅</span>
  <span class="logo-text">TU_NOMBRE_AQUÍ</span>
</div>
```

### **2. Actualizar Textos**

```typescript
// landing-page.component.ts
hero = {
  title: 'Tu Título Personalizado',
  subtitle: 'Tu descripción...',
};
```

### **3. Agregar Screenshots Reales**

Reemplaza el placeholder del mockup con imágenes reales:

```html
<!-- Reemplazar .mockup-placeholder con: -->
<img src="assets/img/dashboard-screenshot.png" 
     alt="Screenshot del sistema">
```

### **4. Configurar Analytics**

```typescript
ngOnInit(): void {
  // Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
  
  // Facebook Pixel
  fbq('track', 'PageView');
}
```

---

## ✅ Checklist para Producción

Antes de lanzar, verificar:

### **Landing Page:**
- [ ] Cambiar "TurnosApp" por tu nombre real
- [ ] Agregar logo real
- [ ] Screenshots/mockups del sistema
- [ ] Enlaces a términos y privacidad
- [ ] Configurar analytics
- [ ] Formulario de contacto funcional
- [ ] Links de redes sociales
- [ ] SEO: title, meta description, OpenGraph

### **DNS:**
- [ ] Dominio registrado
- [ ] Wildcard DNS configurado
- [ ] SSL/HTTPS activo
- [ ] Redirección www → non-www (o viceversa)

### **Backend:**
- [ ] Verificar CORS para dominio de producción
- [ ] SSL en API
- [ ] Rate limiting activo
- [ ] Logs de seguridad

### **Testing:**
- [ ] www.tudominio.com → Landing Page ✓
- [ ] goku.tudominio.com → Home de Goku ✓
- [ ] tenant-nuevo.tudominio.com → Error 404 apropiado ✓
- [ ] Responsive mobile ✓
- [ ] Performance (Lighthouse) ✓

---

## 🎉 Resumen

Tu sistema ahora tiene **3 niveles de páginas de inicio**:

1. **🌐 Landing Page** → Marketing para www.turnos.com
   - Atrae nuevos clientes
   - Explica el sistema
   - Call-to-action para registro

2. **🔧 Selector de Tenant** → Desarrollo en localhost
   - Facilita testing
   - Cambio rápido entre tenants
   - Solo visible en desarrollo

3. **🏠 Home del Tenant** → Página del cliente (goku.turnos.com)
   - Personalizada por negocio
   - Permite reservar turnos
   - Branding único

**Arquitectura profesional y escalable lista para producción.**
