# Sistema de Personalización del Home 🎨

## Descripción General

El sistema de personalización del home permite a los clientes (propietarios de cada tenant) personalizar **absolutamente todo** el contenido y apariencia de su página de inicio, incluyendo:

- Hero section (banner principal)
- Sección de bienvenida
- Visibilidad de secciones (servicios, equipo, testimonios, mapa)
- Integración con WhatsApp
- Horarios de atención
- Configuración del carrusel
- Custom CSS (para personalizaciones avanzadas)

## Campos de Personalización

### 🌟 Hero Section (Banner Principal)

| Campo | Tipo | Max Length | Default | Descripción |
|-------|------|------------|---------|-------------|
| `hero_title` | VARCHAR(200) | 200 | 'Bienvenido' | Título principal del hero |
| `hero_subtitle` | VARCHAR(500) | 500 | 'Reserva tu turno online' | Subtítulo/descripción |
| `hero_button_text` | VARCHAR(50) | 50 | 'Turno Online' | Texto del botón CTA |
| `hero_background_image` | VARCHAR(500) | 500 | NULL | URL de imagen de fondo |

**Nota sobre imagen de fondo**: Si no se especifica, se usa un gradiente basado en los colores primary_color y secondary_color del negocio.

### 👋 Sección de Bienvenida

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `welcome_section_title` | VARCHAR(200) | 'Bienvenido' | Título de la sección |
| `welcome_section_text` | TEXT | NULL | Contenido (soporta HTML básico) |

**Nota**: La sección de bienvenida solo se muestra si al menos uno de estos campos tiene valor.

### 👁️ Visibilidad de Secciones

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `show_services_section` | BOOLEAN | true | Mostrar sección de servicios |
| `show_team_section` | BOOLEAN | true | Mostrar sección del equipo |
| `show_testimonials_section` | BOOLEAN | false | Mostrar testimonios |
| `show_map` | BOOLEAN | true | Mostrar mapa de ubicación |

### 💬 Integración WhatsApp

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `whatsapp_number` | VARCHAR(30) | NULL | Número con código país (ej: +595981234567) |
| `show_whatsapp_button` | BOOLEAN | false | Mostrar botón flotante |

**Formato del número**: Incluir código de país con +. Ejemplo: `+595981234567` para Paraguay.

**Funcionalidad**: El botón flotante aparece en la esquina inferior derecha y abre WhatsApp Web con un mensaje pre-llenado personalizado con el nombre del negocio.

### 🕐 Horarios de Atención

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `business_hours` | TEXT | Horarios (soporta HTML) |

**Ejemplo**:
```html
<strong>Lunes a Viernes:</strong> 8:00 - 20:00<br>
<strong>Sábados:</strong> 8:00 - 18:00<br>
<strong>Domingos:</strong> Cerrado
```

### 🎠 Configuración del Carrusel

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `carousel_auto_play` | BOOLEAN | true | Reproducción automática |
| `carousel_interval` | INTEGER | 5000 | Intervalo en milisegundos (1000-10000) |
| `carousel_image_1` | VARCHAR(500) | NULL | URL imagen 1 |
| `carousel_image_2` | VARCHAR(500) | NULL | URL imagen 2 |
| `carousel_image_3` | VARCHAR(500) | NULL | URL imagen 3 |

**Nota**: Si no se especifican imágenes custom, se usan imágenes por defecto según el `business_type`.

### 🎨 Estilos Custom

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `custom_css` | TEXT | CSS personalizado para estilos avanzados |

**Uso avanzado**: Permite a clientes técnicos agregar estilos CSS personalizados que se aplicarán a su home.

## Arquitectura del Sistema

### Backend

#### Base de Datos
**Tabla**: `business_config`
- Todos los campos de personalización están en esta tabla
- Relacionada con `tenant_id` (multi-tenant)
- Campos con valores DEFAULT para nuevos tenants

#### Modelo
**Archivo**: `src/models/business_config.model.js`
- Definición Sequelize con todos los campos
- Validaciones (max length, tipos)
- Defaults configurados

#### Controller
**Archivo**: `src/controllers/business-config.controller.js`
- `GET /api/business-config`: Obtener configuración del tenant actual
- `PUT /api/business-config`: Actualizar configuración (solo owners)

### Frontend

#### Models
**Archivo**: `src/app/models/business-config.model.ts`
- Interface TypeScript con todos los campos
- Tipado para type-safety

#### Service
**Archivo**: `src/app/services/business-config.service.ts`
- `loadConfig()`: Cargar configuración del backend
- `updateConfig(data)`: Guardar cambios
- `config$`: BehaviorSubject observable

#### Home Component
**Archivos**: 
- `src/app/components/home/home.component.ts`
- `src/app/components/home/home.component.html`
- `src/app/components/home/home.component.css`

**Funcionalidad**:
- Consume `businessConfig$` observable
- Renderiza secciones condicionalmente según `show_*` flags
- Método `getHeroBackground()`: Retorna imagen o gradiente
- Método `getWhatsAppLink()`: Genera link de WhatsApp con mensaje

#### Admin Panel
**Archivos**:
- `src/app/components/admin/home-customization/home-customization.component.ts`
- `src/app/components/admin/home-customization/home-customization.component.html`
- `src/app/components/admin/home-customization/home-customization.component.css`

**Funcionalidad**:
- Formulario reactivo con todos los campos de personalización
- Validaciones (max length, formato)
- Botón de vista previa (abre home en nueva pestaña)
- Guarda cambios vía BusinessConfigService
- SweetAlert2 para notificaciones

**Ruta**: `/dashboard/admin/home-customization` (solo propietarios)

## Flujo de Uso

### Para el Propietario del Negocio:

1. **Login** → `/login` con credenciales de owner
2. **Dashboard** → Hacer clic en menú "Configuración"
3. **Personalizar Home** → Seleccionar "Personalizar Home"
4. **Editar Campos** → Completar/modificar:
   - Títulos del hero
   - Textos de bienvenida
   - Número de WhatsApp
   - Horarios
   - Activar/desactivar secciones
5. **Vista Previa** → Click en "Vista Previa" para ver cambios en tiempo real
6. **Guardar** → Click en "Guardar Cambios"
7. **Verificar** → Los cambios se aplican inmediatamente en el home

### Para los Visitantes:

1. **Acceder al Home** → `http://subdomain.turnos.com` o `localhost:4200` (desarrollo)
2. **Ver Personalización** → Todo el contenido es dinámico según configuración:
   - Hero con título/subtítulo personalizados
   - Sección de bienvenida (si está configurada)
   - Carrusel con imágenes custom
   - Servicios (si está activado)
   - Horarios (si están configurados)
   - Mapa (si está activado)
   - Botón WhatsApp flotante (si está activado)
3. **Interactuar** → Click en "Turno Online" para agendar

## Ejemplo de Configuración: Barbería Goku

```javascript
{
  business_name: "Barbería Goku",
  hero_title: "Barbería Goku - Estilo y Tradición",
  hero_subtitle: "¡Cortes modernos con la potencia Saiyan! Agenda tu turno online",
  hero_button_text: "Reservar Turno",
  hero_background_image: null, // Usa gradiente
  
  welcome_section_title: "¡Bienvenido a Barbería Goku!",
  welcome_section_text: "En Barbería Goku combinamos técnicas tradicionales con estilos modernos...",
  
  show_services_section: true,
  show_team_section: true,
  show_testimonials_section: false,
  show_map: true,
  
  whatsapp_number: "+595981234567",
  show_whatsapp_button: true,
  
  business_hours: "<strong>Lunes a Viernes:</strong> 8:00 - 20:00<br>...",
  
  carousel_auto_play: true,
  carousel_interval: 5000,
  carousel_image_1: "https://...",
  carousel_image_2: "https://...",
  carousel_image_3: "https://..."
}
```

## Scripts de Utilidad

### Agregar Campos a la Base de Datos
```bash
node scripts/add-home-customization-fields.js
```
- Verifica si los campos existen
- Agrega solo los faltantes
- Safe para ejecutar múltiples veces

### Actualizar Configuración de Goku (Ejemplo)
```bash
node scripts/update-goku-home-config.js
```
- Actualiza tenant_id 6 (Barbería Goku)
- Configura valores de ejemplo
- Útil para testing

## Estilos y Diseño

### Hero Section
- **Altura mínima**: 500px
- **Overlay**: rgba(0, 0, 0, 0.5) para legibilidad del texto
- **Animaciones**: fadeInUp en título, subtítulo y botón
- **Botón**: Gradient con hover effect (translateY + box-shadow)

### WhatsApp Button
- **Posición**: fixed, bottom-right (30px, 30px)
- **Color**: #25d366 (verde WhatsApp oficial)
- **Hover**: Escala 1.1, color más oscuro
- **Icono**: Font Awesome fab fa-whatsapp

### Responsive
- **Breakpoint**: 768px
- **Mobile**: Fuentes más pequeñas, botones más compactos

## Seguridad

### Permisos
- **GET /api/business-config**: Público (cualquier visitante del tenant)
- **PUT /api/business-config**: Solo owners y super_admins
- **Ruta del panel**: Solo accessible por owners (guard)

### Validaciones
- **Max lengths**: Validados en frontend (form) y backend (Sequelize)
- **HTML Injection**: `[innerHTML]` solo en campos de texto largo (welcome_section_text, business_hours)
- **URLs**: Validación de formato URL en hero_background_image

## Mejoras Futuras

### Corto Plazo
- [ ] Upload de imágenes (hero background, carousel) en lugar de URLs
- [ ] Preview en tiempo real dentro del panel (iframe)
- [ ] Más opciones de gradientes predefinidos
- [ ] Color picker para hero overlay opacity

### Mediano Plazo
- [ ] Biblioteca de plantillas prediseñadas
- [ ] Editor visual drag & drop
- [ ] Sección de testimonios gestionable
- [ ] Sección de equipo con fotos y descripciones
- [ ] Blog/noticias sección

### Largo Plazo
- [ ] A/B testing de diferentes configuraciones
- [ ] Analytics por sección (clicks, time spent)
- [ ] Themes marketplace
- [ ] Advanced CSS editor con syntax highlighting

## Testing

### Manual Testing Checklist
- [ ] Cargar home sin configuración (usa defaults)
- [ ] Editar hero section → guardar → verificar cambios
- [ ] Activar/desactivar cada sección → verificar visibilidad
- [ ] Configurar WhatsApp → verificar link correcto
- [ ] Probar con/sin hero_background_image
- [ ] Probar HTML en welcome_section_text
- [ ] Verificar responsive en mobile
- [ ] Vista previa desde panel admin
- [ ] Permisos: employee no puede acceder al panel

### Casos Edge
- [ ] Campos vacíos (usa defaults)
- [ ] HTML malformado en texto (sanitizar?)
- [ ] URLs inválidas en imágenes (mostrar gradiente)
- [ ] Número WhatsApp sin código país (agregar nota en UI)
- [ ] Interval del carrusel muy bajo/alto (validado 1000-10000)

## Soporte

### Preguntas Frecuentes

**Q: ¿Cómo cambio el color del botón del hero?**
A: Los colores se heredan de `primary_color` y `secondary_color` en "Datos del Negocio". El hero button usa un gradiente entre esos colores.

**Q: ¿Puedo usar mis propias imágenes?**
A: Actualmente debes proporcionar URLs públicas. Próximamente agregaremos upload directo de archivos.

**Q: ¿Cómo agrego más de 3 imágenes al carrusel?**
A: Por ahora el límite es 3 imágenes. Estamos considerando expandirlo en futuras versiones.

**Q: ¿El custom CSS afecta otras páginas?**
A: No, solo se aplica al componente home. Usa scoping de Angular.

**Q: ¿Puedo ocultar el carrusel completamente?**
A: No hay toggle para el carrusel aún, pero puedes no configurar imágenes y se mostrarán defaults minimalistas.

**Q: ¿Qué pasa si no configuro WhatsApp?**
A: El botón simplemente no aparece. Es completamente opcional.

## Conclusión

Este sistema permite **personalización completa del home** sin tocar código, cumpliendo el objetivo de "que los clientes puedan personalizar absolutamente todo el home". Cada tenant puede tener una experiencia única y branded, fundamental para el éxito de un sistema multi-tenant SaaS.

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Autor**: Sistema de Turnos Online
