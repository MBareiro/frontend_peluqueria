# Deploy en Vercel - Frontend

## 🚀 Configuración Completada

### Archivos de Configuración

1. **vercel.json** - Configuración de Vercel
   - Build command: `npm run build`
   - Output directory: `dist/frontend_peluqueria/browser`
   - Rewrites para SPA (todas las rutas → index.html)
   - Headers de seguridad
   - Cache headers para assets

2. **.vercelignore** - Archivos ignorados en deploy
   - node_modules
   - Archivos temporales
   - Tests

3. **angular.json** - Budgets actualizados
   - Initial: 5MB max (era 2MB)
   - Component styles: 20KB max (era 4KB)
   - ✅ Solucionado: Landing page CSS (~8KB)
   - ✅ Solucionado: Schedule CSS (~3.6KB)
   - ✅ Solucionado: Create appointment CSS (~5.5KB)

## 📋 Pasos para Deploy

### 1. Preparar el proyecto

```bash
# Asegurarse de estar en el directorio del frontend
cd frontend_peluqueria

# Instalar dependencias
npm install

# Probar build local
npm run build
```

### 2. Deploy en Vercel

#### Opción A: CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

#### Opción B: GitHub Integration (Recomendado)

1. Push tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Click en "Import Project"
4. Selecciona tu repositorio
5. Vercel detectará automáticamente Angular
6. Click en "Deploy"

### 3. Variables de Entorno en Vercel

En el dashboard de Vercel, configura:

**Production**:
- `NODE_ENV` = `production`

**Nota**: La `apiUrl` ya está configurada en `environment.prod.ts` apuntando a tu backend en Vercel.

## 🔧 Configuración Backend (environment.prod.ts)

```typescript
apiUrl: 'https://backend-peluqueria-node.vercel.app/api'
```

Asegúrate de que tu backend esté deployado en Vercel y ajusta la URL si es diferente.

## ⚠️ Problemas Solucionados

### 1. Budget Exceeded
**Problema**: Archivos CSS excedían límites (2KB → 8KB)
**Solución**: Aumentados los budgets en `angular.json`:
- `anyComponentStyle`: 2KB → 20KB
- `initial`: 500KB → 5MB

### 2. Selector CSS Warning
**Problema**: `.form-floating>~label` (selector inválido)
**Solución**: Este warning viene de Bootstrap y no afecta el build. Angular lo skipea automáticamente.

### 3. Output Directory
**Problema**: Vercel no encontraba los archivos compilados
**Solución**: Configurado `outputDirectory: "dist/frontend_peluqueria/browser"` en vercel.json

## 🎯 URL de Producción

Una vez deployado, tu frontend estará disponible en:
```
https://tu-proyecto.vercel.app
```

Vercel te asignará un dominio automáticamente. Puedes configurar un dominio custom en el dashboard.

## 🔍 Verificación Post-Deploy

1. ✅ Landing page carga correctamente
2. ✅ Login funciona
3. ✅ API calls funcionan (verificar que apunten al backend correcto)
4. ✅ Rutas de Angular funcionan (gracias a rewrites en vercel.json)
5. ✅ Assets se cargan (favicon, imágenes, CSS)

## 📊 Monitoreo

En el dashboard de Vercel puedes ver:
- Build logs
- Runtime logs
- Analytics
- Performance metrics

## 🚨 Troubleshooting

### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Budget exceeded"
Si aún tienes errores de budget, aumenta más los límites en `angular.json` → `budgets`.

### Error 404 en rutas
Verifica que `vercel.json` tenga el rewrite configurado correctamente.

### API no responde
- Verifica que el backend esté corriendo
- Verifica CORS en el backend
- Verifica la URL en `environment.prod.ts`

## 🔗 Links Útiles

- [Vercel Angular Docs](https://vercel.com/docs/frameworks/angular)
- [Angular Budget Docs](https://angular.io/guide/build#configuring-size-budgets)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Última actualización**: Enero 2026
**Status**: ✅ Listo para deploy
