# 🎨 Guía de Estilos CSS - Frontend Peluquería

## 📋 Tabla de Contenidos
1. [Sistema de Variables](#sistema-de-variables)
2. [Clases Reutilizables](#clases-reutilizables)
3. [Mixins SCSS](#mixins-scss)
4. [Convenciones de Nombres](#convenciones-de-nombres)
5. [Responsive Design](#responsive-design)
6. [Accesibilidad](#accesibilidad)

---

## 🎨 Sistema de Variables

### Variables SCSS (definidas en `src/styles/_variables.scss`)

#### Colores
```scss
// Colores primarios
$color-primary: #3f51b5;
$color-accent: #ff4081;
$color-success: #4caf50;
$color-warning: #ff9800;
$color-error: #f44336;
$color-info: #2196f3;

// Backgrounds oscuros
$bg-dark-card: #191c24;      // Cards y superficies principales
$bg-dark-surface: #2c2e33;   // Tablas y superficies secundarias
```

#### Spacing (Sistema de 8px)
```scss
$spacing-xs: 0.5rem;   // 8px
$spacing-sm: 1rem;     // 16px
$spacing-md: 1.5rem;   // 24px
$spacing-lg: 2rem;     // 32px
$spacing-xl: 3rem;     // 48px
```

#### Bordes
```scss
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;   // Para chips/pills
```

#### Transiciones
```scss
$transition-fast: 150ms;
$transition-base: 250ms;
$transition-slow: 400ms;
```

### CSS Custom Properties (disponibles en `:root`)

Usa variables CSS para valores que pueden cambiar dinámicamente:

```css
/* Colores */
var(--color-primary)
var(--bg-dark-card)
var(--bg-dark-surface)

/* Spacing */
var(--spacing-xs)
var(--spacing-sm)
var(--spacing-md)

/* Bordes */
var(--border-radius-lg)

/* Transiciones */
var(--transition-base)

/* Brand (para theming dinámico) */
var(--brand-primary)
var(--brand-secondary)
```

---

## 🧩 Clases Reutilizables

### Cards (definidas en `src/styles/_shared-cards.scss`)

#### `.shipping-card`
Card oscura estándar para formularios pequeños (max-width: 400px)
```html
<mat-card class="shipping-card">
  <!-- Contenido del formulario -->
</mat-card>
```

#### `.booking-card`
Card oscura full-width para formularios complejos (max-width: 960px)
```html
<mat-card class="booking-card">
  <!-- Formulario de turnos, etc -->
</mat-card>
```

### Grid Responsivo

#### `.form-grid`
Grid responsivo para formularios con columnas automáticas
```html
<form class="form-grid">
  <mat-form-field class="col">...</mat-form-field>
  <mat-form-field class="col">...</mat-form-field>
  <mat-form-field class="col full">...</mat-form-field>
</form>
```

### Stats Cards

Cards con gradientes predefinidos para dashboards:
```html
<div class="stat-card-purple">
  <div>📊 Total</div>
  <div>123</div>
</div>
```

Colores disponibles:
- `.stat-card-purple` - Gradiente morado
- `.stat-card-blue` - Gradiente azul
- `.stat-card-green` - Gradiente verde
- `.stat-card-red` - Gradiente rojo
- `.stat-card-yellow` - Gradiente amarillo

### Actions Row

#### `.actions` / `.inline-actions`
Fila de botones responsive que se apila en móvil
```html
<div class="actions">
  <button mat-button>Cancelar</button>
  <button mat-raised-button color="primary">Guardar</button>
</div>
```

---

## 🎭 Mixins SCSS

### Cards
```scss
@import 'styles/shared-cards';

.my-custom-card {
  @include dark-card;  // Card oscura 400px
}

.my-wide-card {
  @include dark-card-full;  // Card oscura 960px
}
```

### Form Grid
```scss
.my-form {
  @include form-grid;
}
```

### Material Dark Theme
```scss
.my-component {
  @include material-dark-theme;
}
```

### Responsive
```scss
@import 'styles/mixins';

.my-element {
  font-size: 16px;
  
  @include respond-to('sm') {
    font-size: 14px;  // En pantallas pequeñas
  }
}
```

Breakpoints disponibles:
- `'sm'` - 576px
- `'md'` - 768px
- `'lg'` - 992px
- `'xl'` - 1200px

---

## 📝 Convenciones de Nombres

### Archivos
```
kebab-case.component.css
kebab-case.component.scss
```

### Clases
```css
/* Componente específico */
.my-component-header { }

/* Elemento de componente */
.my-component-header-title { }

/* Modificador */
.my-component-header--large { }
```

### Variables CSS Custom
```css
--color-primary
--spacing-md
--bg-dark-card
```

### Variables SCSS
```scss
$color-primary
$spacing-md
$bg-dark-card
```

---

## 📱 Responsive Design

### Mobile-First Approach (RECOMENDADO)

```scss
.element {
  // Estilos para móvil por defecto
  font-size: 14px;
  
  @include respond-to('md') {
    // Tablet
    font-size: 16px;
  }
  
  @include respond-to('lg') {
    // Desktop
    font-size: 18px;
  }
}
```

### Breakpoints Consistentes

**USAR:**
```scss
@include respond-to('sm') { ... }
```

**NO USAR:**
```scss
@media (max-width: 640px) { ... }  // ❌ Valor mágico
```

---

## ♿ Accesibilidad

### Focus States

Siempre incluir estados de foco visibles:

```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

O usar el mixin:
```scss
button {
  @include focus-outline(var(--color-primary));
}
```

### Contraste de Colores

Asegurar ratio de contraste WCAG AA (4.5:1 para texto normal):

```css
/* ✅ BUENO - Alto contraste */
.text-light {
  color: white;
  background-color: #191c24;
}

/* ❌ MALO - Bajo contraste */
.text-low-contrast {
  color: #999;
  background-color: #aaa;
}
```

### Clases Utilitarias

```css
/* Ocultar visualmente pero mantener para lectores de pantalla */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## ⚡ Performance

### DO's ✅

```css
/* Usar variables CSS para valores reutilizables */
color: var(--color-primary);

/* Usar transform para animaciones */
transform: translateY(-2px);
transition: transform var(--transition-base);

/* Selectores específicos */
.my-component .my-element { }
```

### DON'Ts ❌

```css
/* NO usar !important innecesariamente */
color: red !important;  /* ❌ */

/* NO selectores muy genéricos */
td, th { }  /* ❌ Afecta todas las tablas */

/* NO valores hardcodeados repetidos */
margin: 16px;  /* ❌ Usar var(--spacing-md) */

/* NO colores inline */
style="color: #191c24"  /* ❌ Usar clase CSS */
```

---

## 📚 Ejemplos Prácticos

### Componente Completo

```scss
// my-component.component.scss
@import 'styles/variables';
@import 'styles/mixins';

:host {
  display: block;
  padding: var(--spacing-md);
}

.my-card {
  @include dark-card-full;
}

.my-form {
  @include form-grid;
}

.my-button {
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus-visible {
    @include focus-outline(var(--color-primary));
  }
}

@include respond-to('sm') {
  :host {
    padding: var(--spacing-sm);
  }
}
```

---

## 🔄 Migración de CSS Antiguo

Si encuentras código como este:

```css
/* ❌ ANTES */
.card {
  max-width: 400px;
  margin: 20px auto;
  background-color: #191c24 !important;
}

.element {
  padding: 16px;
  border-radius: 12px;
}
```

Refactorizar a:

```css
/* ✅ DESPUÉS */
.card {
  /* Usa clase global o mixin */
  @include dark-card;
}

.element {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}
```

---

## 📞 Soporte

Para dudas sobre estilos:
1. Revisar [_variables.scss](src/styles/_variables.scss)
2. Revisar [_shared-cards.scss](src/styles/_shared-cards.scss)
3. Revisar [_mixins.scss](src/styles/_mixins.scss)

---

**Última actualización:** Diciembre 2025
