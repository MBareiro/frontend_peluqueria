# 🏢 Arquitectura Multi-Tenant del Sistema

## 📋 Resumen

Tu sistema utiliza **Multi-Tenancy por SUBDOMINIOS**, donde cada negocio tiene su propio subdominio y configuración independiente.

---

## 🌐 ¿Cómo Funciona?

### **Arquitectura de Subdominios**

```
┌─────────────────────────────────────────────────────┐
│                   DOMINIO BASE                       │
│            mipeluqueria.com                         │
└─────────────────────────────────────────────────────┘
            │
            ├── goku.mipeluqueria.com → Tenant ID: 6 (Barbería Goku)
            │   └── Logo, colores, servicios de Goku
            │
            ├── vegeta.mipeluqueria.com → Tenant ID: 7 (Barbería Vegeta)
            │   └── Logo, colores, servicios de Vegeta
            │
            └── bulma.mipeluqueria.com → Tenant ID: 8 (Salón Bulma)
                └── Logo, colores, servicios de Bulma
```

### **Ventajas del Sistema**

✅ **Separación Total**: Cada negocio tiene su propia URL  
✅ **Branding Personalizado**: Logo, colores, imágenes por tenant  
✅ **SEO Independiente**: Cada subdomain se indexa por separado  
✅ **Seguridad**: Aislamiento completo de datos  
✅ **Escalabilidad**: Agregar negocios es solo crear un subdomain  
✅ **Profesional**: URLs limpias y claras  

---

## 🔐 Flujo de Identificación de Tenant

### 1. **Frontend (TenantService)**

```typescript
// Al cargar la aplicación
window.location.hostname = "goku.mipeluqueria.com"
  ↓
TenantService.detectSubdomain()
  ↓
subdomain = "goku"
  ↓
localStorage.setItem('tenant_subdomain', 'goku')
```

### 2. **Backend (JWT Token)**

```typescript
// Al hacer login
Usuario: goku@hotmail.com
  ↓
SELECT * FROM users WHERE email = 'goku@hotmail.com'
  ↓
user.tenant_id = 6
  ↓
JWT Token: { user_id: 32, role: 'employee', tenant_id: 6 }
  ↓
Cookie httpOnly con el token
```

### 3. **Peticiones API**

```typescript
// Cada petición lleva:
Headers: {
  Cookie: "token=eyJhbGc..." (con tenant_id: 6)
}
  ↓
Backend checkToken middleware
  ↓
req.user = { user_id: 32, role: 'employee', tenant_id: 6 }
  ↓
Todas las consultas filtran: WHERE tenant_id = 6
```

---

## 🏠 ¿Qué Pasa en Localhost sin Subdomain?

### **Problema:**
```
http://localhost:4200  → No hay subdomain
  ↓
TenantService detecta "default"
  ↓
No hay configuración de negocio específica
```

### **Solución Implementada: Selector de Tenant**

Cuando accedes a `localhost:4200` sin subdomain, el sistema:

1. **Detecta `tenant = "default"`**
2. **Redirige a `/select-tenant`**
3. **Muestra lista de negocios disponibles**
4. **Usuario selecciona un negocio**
5. **Se guarda en localStorage**
6. **Se recarga la página**
7. **HomeComponent carga con configuración del tenant**

```
┌────────────────────────────────────────┐
│   🏢 Sistema de Gestión de Turnos      │
│   Selecciona un negocio para continuar │
├────────────────────────────────────────┤
│                                        │
│   💈 Barbería Goku                     │
│   goku.mipeluqueria.com                │
│   [Entrar] ─────────────────────►     │
│                                        │
│   💈 Barbería Vegeta                   │
│   vegeta.mipeluqueria.com              │
│   [Entrar] ─────────────────────►     │
│                                        │
│   🔧 Panel de Administración           │
│                                        │
└────────────────────────────────────────┘
```

---

## 🚀 Flujo Completo de Usuario

### **Caso 1: Usuario Entra con Subdomain**

```
1. Usuario visita: https://goku.mipeluqueria.com
   ↓
2. TenantService detecta subdomain: "goku"
   ↓
3. HomeComponent carga configuración del tenant
   ↓
4. Business Config cargado desde: /api/business-config
   ↓
5. Se muestra:
   - Logo de Barbería Goku
   - Colores personalizados
   - Carousel con imágenes del negocio
   - Mapa con ubicación
   - Servicios de Goku
```

### **Caso 2: Usuario Entra sin Subdomain (Desarrollo)**

```
1. Usuario visita: http://localhost:4200
   ↓
2. TenantService detecta: "default"
   ↓
3. HomeComponent verifica tenant
   ↓
4. Redirige a: /select-tenant
   ↓
5. Usuario selecciona "Barbería Goku"
   ↓
6. localStorage.setItem('tenant_subdomain', 'goku')
   ↓
7. window.location.reload()
   ↓
8. TenantService lee de localStorage: "goku"
   ↓
9. HomeComponent carga configuración de Goku
```

### **Caso 3: Usuario sin Subdomain (Producción)**

```
1. Usuario visita: https://mipeluqueria.com (sin subdomain)
   ↓
2. TenantService detecta: "default"
   ↓
3. TenantSelectorPageComponent muestra:
   - Landing page del sistema
   - "Esta página no está disponible en producción"
   - "Por favor, accede usando: tunegocio.mipeluqueria.com"
```

---

## 📁 Componentes del Sistema Multi-Tenant

### **1. TenantService** (`core/services/tenant.service.ts`)

**Responsabilidad:** Detectar y gestionar el tenant actual

```typescript
class TenantService {
  // Detecta subdomain de la URL
  detectSubdomain(): void
  
  // Obtiene el tenant actual
  getTenant(): string
  
  // Establece el tenant manualmente
  setTenant(subdomain: string): void
  
  // Observable para reaccionar a cambios
  getTenant$(): Observable<string>
}
```

**Casos de Uso:**
- `localhost:4200` → `"default"`
- `goku.localhost:4200` → `"goku"` (con hosts file)
- `goku.mipeluqueria.com` → `"goku"`

---

### **2. TenantInterceptor** (`interceptors/tenant.interceptor.ts`)

**Responsabilidad:** Agregar header X-Tenant-Subdomain a las peticiones

```typescript
intercept(req, next) {
  const subdomain = tenantService.getTenant();
  
  if (subdomain !== 'default') {
    req = req.clone({
      setHeaders: { 'X-Tenant-Subdomain': subdomain }
    });
  }
  
  return next.handle(req);
}
```

**Nota:** Actualmente no es necesario porque el backend usa `tenant_id` del JWT token, pero está disponible para validación adicional.

---

### **3. BusinessConfigService** (`services/business-config.service.ts`)

**Responsabilidad:** Cargar configuración del negocio actual

```typescript
class BusinessConfigService {
  // Observable con la configuración actual
  config$: Observable<BusinessConfig>
  
  // Carga la configuración desde /api/business-config
  loadConfig(): void
}
```

**Datos Cargados:**
- `business_name`: "Barbería Goku"
- `business_type`: "barbershop"
- `primary_color`: "#FF6B35"
- `secondary_color`: "#004E89"
- `logo_url`: "https://..."
- `carousel_images`: ["url1", "url2", "url3"]

---

### **4. HomeComponent** (`components/home/home.component.ts`)

**Responsabilidad:** Página principal adaptada al tenant

```typescript
ngOnInit() {
  const tenant = this.tenantService.getTenant();
  
  if (tenant === 'default') {
    // Sin tenant: redirigir a selector
    this.router.navigate(['/select-tenant']);
  } else {
    // Con tenant: cargar configuración
    this.loadBusinessConfig();
  }
}
```

---

### **5. TenantSelectorPageComponent** (`components/shared/tenant-selector-page`)

**Responsabilidad:** Página de selección de tenant (solo desarrollo)

**Funcionalidades:**
- Lista todos los tenants activos
- Permite seleccionar uno
- Guarda en localStorage
- Recarga la página
- Se oculta en producción

---

## 🛠️ Configuración para Desarrollo Local

### **Opción 1: Sin Hosts File (Actual)**

```
URL: http://localhost:4200
Tenant: "default"
Comportamiento: Redirige a /select-tenant
```

**Ventajas:**
- No requiere configuración
- Selector visual de tenants
- Fácil cambiar entre negocios

---

### **Opción 2: Con Hosts File (Simular Subdominios)**

**1. Editar archivo hosts:**

Windows: `C:\Windows\System32\drivers\etc\hosts`  
Mac/Linux: `/etc/hosts`

```
127.0.0.1   goku.localhost
127.0.0.1   vegeta.localhost
127.0.0.1   bulma.localhost
```

**2. Acceder con subdomain:**

```
http://goku.localhost:4200  → Tenant: "goku"
http://vegeta.localhost:4200 → Tenant: "vegeta"
```

**Ventajas:**
- Simula producción exactamente
- No necesita selector
- URLs más profesionales

**Desventajas:**
- Requiere editar hosts file
- Más complicado para desarrollo

---

## 🌍 Configuración para Producción

### **DNS Setup**

1. **Dominio Base**: `mipeluqueria.com`
2. **Wildcard DNS**: `*.mipeluqueria.com → IP_DEL_SERVIDOR`

**Resultado:**
- `goku.mipeluqueria.com` → Funciona automáticamente
- `vegeta.mipeluqueria.com` → Funciona automáticamente
- `cualquier-nombre.mipeluqueria.com` → Funciona automáticamente

### **Servidor (Nginx/Apache)**

```nginx
server {
    server_name *.mipeluqueria.com;
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

## 📊 Comparación: Subdominios vs Rutas

| Aspecto | Subdominios (Actual) | Rutas (/tenant1) |
|---------|---------------------|------------------|
| URLs | `goku.domain.com` | `domain.com/goku` |
| SEO | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Bueno |
| Branding | ⭐⭐⭐⭐⭐ Muy profesional | ⭐⭐⭐ Aceptable |
| Complejidad Frontend | ⭐⭐⭐⭐ Sencillo | ⭐⭐ Complejo |
| Escalabilidad | ⭐⭐⭐⭐⭐ Ilimitada | ⭐⭐⭐ Limitada |
| DNS Setup | Wildcard DNS | No necesario |

**Conclusión:** Tu sistema eligió la mejor opción ✅

---

## 🔒 Seguridad Multi-Tenant

### **Aislamiento de Datos**

Cada consulta en el backend incluye `tenant_id`:

```sql
-- Mal (sin tenant_id)
SELECT * FROM appointments WHERE hairdresser_id = 32;

-- Bien (con tenant_id)
SELECT * FROM appointments 
WHERE hairdresser_id = 32 
AND tenant_id = 6;
```

### **Middleware checkToken**

Todas las rutas protegidas verifican:

```javascript
// 1. Token válido
const decoded = jwt.verify(token, SECRET);

// 2. Extraer tenant_id
req.user = {
  user_id: decoded.user_id,
  role: decoded.role,
  tenant_id: decoded.tenant_id // ← Crucial
};

// 3. Usarlo en consultas
addTenantFilter(where, req); // Agrega: { tenant_id: req.user.tenant_id }
```

---

## ✅ Recomendaciones

### **Para Desarrollo:**
1. ✅ Usar `localhost:4200` sin subdomain
2. ✅ Dejar que el selector elija el tenant
3. ✅ Cambiar de tenant fácilmente
4. ⚠️ (Opcional) Configurar hosts file si quieres simular producción

### **Para Producción:**
1. ✅ Configurar wildcard DNS: `*.mipeluqueria.com`
2. ✅ Cada cliente recibe su subdomain: `nombrenegocio.mipeluqueria.com`
3. ✅ El subdomain base `mipeluqueria.com` muestra landing page corporativa
4. ✅ Usuarios siempre acceden con subdomain

---

## 🎯 Próximos Pasos

### **Mejoras Sugeridas:**

1. **Landing Page Corporativa**  
   En `mipeluqueria.com` (sin subdomain en producción):
   - Marketing del sistema
   - Botón "Crear Mi Negocio"
   - Testimonios
   - Precios

2. **Selector Mejorado**  
   En desarrollo (`localhost:4200`):
   - Búsqueda de tenants
   - Últimos visitados
   - Favoritos

3. **Validación de Subdomain**  
   Verificar que el subdomain existe antes de cargar:
   ```typescript
   GET /api/tenants/validate/:subdomain
   → { exists: true, active: true, business_name: "..." }
   ```

4. **Custom Domains**  
   Permitir que clientes usen su propio dominio:
   - `www.barberiagoku.com` → `goku.mipeluqueria.com`
   - Configuración de CNAME

---

## 📝 Resumen

Tu sistema está **correctamente configurado** para multi-tenancy por subdominios:

✅ **Frontend**: Detecta subdomain automáticamente  
✅ **Backend**: Usa tenant_id del JWT  
✅ **Desarrollo**: Selector de tenant en localhost  
✅ **Producción**: Cada negocio tiene su subdomain  
✅ **Seguridad**: Aislamiento total de datos  
✅ **Escalabilidad**: Agregar negocios es trivial  

**No necesitas cambiar a rutas tipo `/goku` - tu arquitectura es la correcta.**
