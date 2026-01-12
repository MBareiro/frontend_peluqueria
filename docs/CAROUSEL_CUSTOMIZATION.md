# Personalización del Carrusel de Imágenes

## Descripción

El componente home ahora tiene un carrusel de imágenes completamente personalizable que se adapta al tipo de negocio configurado.

## Funcionamiento

### 1. Imágenes Personalizadas (Prioridad)

Desde el panel de administración en **Configuración del Negocio**, puedes configurar URLs personalizadas para hasta 3 imágenes:

- `carousel_image_1`: URL de la primera imagen
- `carousel_image_2`: URL de la segunda imagen  
- `carousel_image_3`: URL de la tercera imagen

Estas pueden ser:
- URLs externas (ej: `https://ejemplo.com/imagen.jpg`)
- URLs de servicios de almacenamiento (ej: Cloudinary, S3)
- Rutas locales en assets (ej: `assets/img/mi-imagen.jpg`)

### 2. Imágenes por Defecto (Fallback)

Si no se configuran URLs personalizadas, el sistema usa automáticamente imágenes por defecto según el `business_type`:

| Tipo de Negocio | Carpeta de Imágenes |
|----------------|---------------------|
| `barbershop` | `assets/img/carousel/barbershop-*.jpg` |
| `beauty_salon` | `assets/img/carousel/salon-*.jpg` |
| `nails` | `assets/img/carousel/nails-*.jpg` |
| `spa` | `assets/img/carousel/spa-*.jpg` |
| `massage` | `assets/img/carousel/massage-*.jpg` |
| `tattoo` | `assets/img/carousel/tattoo-*.jpg` |
| `other` | `assets/img/carousel/foto*.jpg` (actuales) |

### 3. Configuración Adicional

También puedes configurar el comportamiento del carrusel:

- `carousel_auto_play` (boolean): Activar/desactivar avance automático (default: `true`)
- `carousel_interval` (number): Intervalo entre imágenes en milisegundos (default: `5000` = 5 segundos)

## Agregar Imágenes por Defecto

Para agregar imágenes por defecto para un tipo de negocio:

1. Coloca las imágenes en `src/assets/img/carousel/`
2. Nombra los archivos según el patrón: `{tipo}-1.jpg`, `{tipo}-2.jpg`, `{tipo}-3.jpg`
3. Tamaño recomendado: 1200x400px (ratio 3:1)
4. Formato: JPG optimizado o WebP

Ejemplo para barbería:
```
assets/img/carousel/
  ├── barbershop-1.jpg
  ├── barbershop-2.jpg
  └── barbershop-3.jpg
```

## API de Configuración

**GET** `/api/business-config`
```json
{
  "carousel_image_1": "https://ejemplo.com/img1.jpg",
  "carousel_image_2": null,
  "carousel_image_3": null,
  "carousel_auto_play": true,
  "carousel_interval": 5000,
  "business_type": "barbershop"
}
```

**PUT** `/api/business-config`
```json
{
  "carousel_image_1": "https://mi-cdn.com/nueva-imagen.jpg",
  "carousel_auto_play": false,
  "carousel_interval": 3000
}
```

## Manejo de Errores

Si una imagen personalizada no carga (URL inválida, 404, etc.), el sistema automáticamente usa la imagen por defecto `foto1.jpg` como fallback.

## Recomendaciones

1. **Optimiza las imágenes** antes de subirlas (compresión, tamaño adecuado)
2. **Usa CDN** para imágenes externas (mejor performance)
3. **Mantén ratio 3:1** (1200x400px) para mejor visualización
4. **Agrega alt text descriptivo** para accesibilidad (se genera automáticamente)
5. **Prueba en mobile** - las imágenes son responsive

## Próximas Mejoras (Fase 2)

- Upload de imágenes desde el panel de admin
- Galería de imágenes del negocio
- Múltiples carruseles configurables
- Editor de texto overlay en imágenes
- Animaciones y transiciones personalizables
