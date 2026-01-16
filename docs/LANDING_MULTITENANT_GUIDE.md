# Sistema Multi-Tenant con Landing de Marketing

## 🎯 Arquitectura Implementada

### Detección de Contexto

El sistema ahora diferencia automáticamente entre:

1. **Landing de Marketing** (`localhost` o `www.turnos.com`)
   - Muestra información sobre la plataforma
   - Beneficios y características
   - Planes de precios
   - Formulario de contacto
   - **NO** carga configuración de tenant
   - **NO** muestra header/footer del negocio

2. **Home del Tenant** (`default.localhost` o `barberia.turnos.com`)
   - Muestra el home personalizado del negocio
   - Carga business-config del tenant
   - Muestra servicios, horarios, etc.
   - Header/footer personalizados

---

## 🔧 Componentes Clave

### 1. `TenantDetectionService`
**Ubicación**: `src/app/core/services/tenant-detection.service.ts`

**Funciones**:
- `isLandingPage()`: Retorna `true` si es landing de marketing
- `getTenantSubdomain()`: Obtiene el subdomain del tenant
- `hasTenant()`: Verifica si tiene un tenant válido
- `getContext()`: Info completa del contexto actual

**Lógica**:
```typescript
// Desarrollo
localhost → Landing
default.localhost → Tenant "default"
cualquier-nombre.localhost → Tenant "cualquier-nombre"

// Producción
turnos.com → Landing
www.turnos.com → Landing
barberia.turnos.com → Tenant "barberia"
spa-relax.turnos.com → Tenant "spa-relax"
```

### 2. `LandingComponent`
**Ubicación**: `src/app/components/landing/`

**Secciones**:
- ✅ Hero section con gradiente moderno
- ✅ Beneficios (3 cards con números)
- ✅ Características (6 features con iconos)
- ✅ Cómo funciona (4 pasos)
- ✅ Planes de precios (3 opciones)
- ✅ Contacto (información + formulario)
- ✅ Footer completo

**Diseño**: Totalmente responsive, colores modernos (gradiente púrpura), animaciones suaves

### 3. `AppComponent` Actualizado
**Ubicación**: `src/app/app.component.ts`

**Lógica**:
```typescript
constructor() {
  if (isLandingPage()) {
    // Redirige a /marketing
    // NO carga configuración
  } else {
    // Detecta tenant
    // Carga business-config
    // Aplica branding
  }
}
```

### 4. Routing
**Ubicación**: `src/app/app-routing.module.ts`

```typescript
{ path: '', component: HomeComponent },           // Home del tenant
{ path: 'marketing', component: LandingComponent }, // Landing marketing
{ path: 'login', component: LoginComponent },
// ... resto de rutas
```

---

## 🧪 Testing Local

### Probar Landing de Marketing
```bash
# En el navegador, ir a:
http://localhost:4200

# O explícitamente:
http://localhost:4200/marketing
```

**Lo que verás**:
- Landing moderna con gradiente púrpura
- Información sobre la plataforma
- Sin header/footer del negocio
- Sin configuración de tenant

### Probar Home del Tenant

**Opción 1: Usando hosts file**
```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

# Agregar línea:
127.0.0.1 default.localhost
```

Luego visitar: `http://default.localhost:4200`

**Opción 2: Cambiar temporalmente el código**
```typescript
// En tenant-detection.service.ts, método isLandingPage()
return false; // Forzar tenant mode
```

**Lo que verás**:
- Home personalizado del negocio "default"
- Carousel, servicios, mapa
- Header/footer con branding
- Configuración cargada de la BD

---

## 🚀 Deployment

### Configuración de DNS en Producción

**Dominio principal** (Landing):
```
turnos.com → IP/CNAME del servidor
www.turnos.com → CNAME a turnos.com
```

**Subdomains de tenants** (Wildcards):
```
*.turnos.com → IP/CNAME del servidor
```

Esto permite que cualquier subdomain funcione:
- `barberia-juan.turnos.com`
- `spa-relax.turnos.com`
- `salon-maria.turnos.com`

### Variables de Entorno

**Frontend**:
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://backend-peluqueria-node.vercel.app/api',
  mainDomain: 'turnos.com'
};
```

**Backend**: Ya configurado con detección de subdomain en headers

---

## 📝 Flujo de Usuario

### Usuario nuevo visita turnos.com
1. Ve landing de marketing
2. Lee sobre beneficios y planes
3. Llena formulario de contacto
4. Equipo contacta y crea tenant
5. Recibe subdomain: `su-negocio.turnos.com`

### Cliente final visita barberia-juan.turnos.com
1. Ve home personalizado de "Barbería Juan"
2. Ve servicios, horarios, fotos
3. Hace clic en "Reservar Turno"
4. Crea su cita sin necesidad de login

### Dueño del negocio visita su-negocio.turnos.com/login
1. Ve su home personalizado
2. Hace clic en "Login"
3. Accede a dashboard
4. Gestiona turnos, clientes, servicios

---

## 🎨 Personalización del Landing

### Colores Principales
```scss
// src/app/components/landing/landing.component.scss

// Gradiente hero
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Colores de acento
$primary: #667eea;
$secondary: #764ba2;
$accent: #ffd700;
```

### Modificar Contenido

**Planes de precios**:
```typescript
// landing.component.ts
plans = [
  {
    name: 'Básico',
    price: 'Gratis',
    features: [...]
  }
]
```

**Características**:
```typescript
features = [
  {
    icon: 'event',
    title: 'Gestión de Turnos',
    description: '...'
  }
]
```

### Agregar Logo o Imagen

**Hero section**:
```html
<!-- Reemplazar el placeholder con imagen real -->
<div class="hero-image">
  <img src="assets/img/hero-image.png" alt="Hero">
</div>
```

---

## 🔍 Debugging

### Ver contexto actual
```typescript
// En cualquier componente
constructor(private tenantDetection: TenantDetectionService) {
  console.log(this.tenantDetection.getContext());
}

// Output:
// {
//   isLanding: false,
//   subdomain: 'default',
//   hostname: 'default.localhost'
// }
```

### Forzar landing o tenant
```typescript
// En app.component.ts
constructor() {
  // Comentar la detección automática
  // this.isLandingPage = this.tenantDetectionService.isLandingPage();
  
  // Forzar landing
  this.isLandingPage = true;
  this.router.navigate(['/marketing']);
  
  // O forzar tenant
  this.isLandingPage = false;
  this.loadTenantConfig();
}
```

---

## ✅ Checklist de Verificación

### Desarrollo Local
- [x] Landing se muestra en `localhost:4200`
- [x] Tenant se muestra en `default.localhost:4200`
- [x] Landing NO carga business-config
- [x] Tenant SÍ carga business-config
- [x] Estilos responsive funcionan
- [x] Formulario de contacto visible

### Producción
- [ ] DNS configurado con wildcards
- [ ] Landing funciona en `turnos.com`
- [ ] Tenant funciona en `negocio.turnos.com`
- [ ] Backend responde a subdomains
- [ ] SSL configurado para wildcards
- [ ] Analytics configurados (opcional)

---

## 🐛 Troubleshooting

### "No se muestra la landing"
**Solución**: Verificar que `mainDomain` en `environment.ts` esté correcto

### "Error: Cannot match any routes"
**Solución**: Verificar que `LandingComponent` esté declarado en `app.module.ts`

### "Landing se carga pero sin estilos"
**Solución**: Verificar que `landing.component.scss` esté importado correctamente

### "Subdomain no detecta tenant"
**Solución**: 
1. Verificar que backend tenga `TenantInterceptor`
2. Verificar que header `Host` se esté enviando
3. Verificar logs del backend para ver tenant detectado

---

## 📚 Referencias

- **Material Design**: https://material.angular.io/
- **Angular Routing**: https://angular.io/guide/router
- **Multi-tenancy**: Ver `docs/MULTI_TENANT_ARCHITECTURE.md`
- **Backend Config**: Ver `backend/VERCEL_ENV_VARS.md`

---

## 🚧 Próximas Mejoras

### Landing
- [ ] Agregar animaciones al scroll
- [ ] Integrar analytics (Google Analytics)
- [ ] Agregar testimonios reales
- [ ] Conectar formulario de contacto a backend
- [ ] Agregar chat en vivo (opcional)
- [ ] SEO optimization

### Multi-tenancy
- [ ] Panel de registro automático
- [ ] Verificación de email
- [ ] Onboarding wizard para nuevos tenants
- [ ] Migración de datos (importar clientes)
- [ ] Templates de diseño predefinidos
