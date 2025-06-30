# Configuración de Firebase para Colaboración

Este documento explica cómo configurar Firebase para habilitar la colaboración en tiempo real entre múltiples usuarios usando claves de workspace compartidas.

## ¿Por qué Firebase?

Actualmente el sistema funciona solo en modo local (localStorage), lo que significa que las claves de workspace solo funcionan en el mismo navegador/dispositivo. Para permitir verdadera colaboración, necesitas un backend compartido donde almacenar los datos de los workspaces.

## Configuración Paso a Paso

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Sigue los pasos del asistente:
   - Nombre del proyecto: `trello-colaborativo` (o el que prefieras)
   - Google Analytics: opcional
   - Acepta los términos y crea el proyecto

### 2. Configurar Firestore Database

1. En la consola de Firebase, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para desarrollo)
4. Elige una ubicación cercana a tus usuarios

### 3. Configurar Reglas de Seguridad

1. En **Firestore Database > Reglas**, reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{document} {
      // Permite leer y escribir a cualquier usuario por ahora
      // TODO: Agregar autenticación más adelante
      allow read, write: if true;
    }
  }
}
```

2. **¡IMPORTANTE!** Haz clic en **"Publicar"** para aplicar las reglas
3. Si no publicas las reglas, verás errores de permisos

⚠️ **Nota de Seguridad**: Estas reglas permiten acceso completo. Para producción, considera implementar autenticación.

### ⚠️ Solución de Errores Comunes

**Error: "Missing or insufficient permissions"**
- Significa que no configuraste o no publicaste las reglas de Firestore
- Ve a Firebase Console → Firestore Database → Reglas
- Copia las reglas de arriba y haz clic en "Publicar"

### 4. Registrar tu Aplicación Web

1. En la página principal del proyecto, haz clic en el ícono **"</>"** (Web)
2. Registra tu aplicación:
   - Nombre: `trello-app`
   - No necesitas configurar hosting por ahora
3. Firebase te mostrará la configuración de tu aplicación

### 5. Configurar la Aplicación

#### Para Desarrollo Local:

1. Copia el archivo de ejemplo: `cp .env.example .env.local`
2. Abre `.env.local` y completa con tu configuración de Firebase:

```bash
REACT_APP_FIREBASE_API_KEY=tu-api-key-real
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=tu-app-id-real
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FIREBASE_ENABLED=true
```

#### Para GitHub Pages:

Sigue las instrucciones en `setup-github-secrets.md` para configurar los secrets en GitHub.

### 6. Probar la Configuración

1. Reinicia tu aplicación de desarrollo: `npm start`
2. Ve a la sección de "Gestión de Workspaces"
3. Deberías ver "☁️ Conectado" en lugar de "📱 Solo local"
4. Crea un workspace y comparte la clave
5. Abre otro navegador/dispositivo y únete usando la misma clave

## Características con Firebase Habilitado

✅ **Colaboración Real**: Múltiples usuarios pueden acceder al mismo workspace usando la misma clave

✅ **Sincronización**: Los datos se sincronizan automáticamente entre dispositivos

✅ **Persistencia**: Los workspaces se guardan en la nube, no solo localmente

✅ **Fallback**: Si Firebase no está disponible, la app sigue funcionando en modo local

## Solución de Problemas

### Error de Conexión
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que `FIREBASE_ENABLED = true` en la configuración

### "No se encontró un workspace con esa clave"
- Con Firebase deshabilitado, esto es normal entre diferentes navegadores
- Habilita Firebase para resolver este problema

### Errores de Configuración
- Verifica que todas las claves en `firebase-config.ts` sean correctas
- Revisa la consola del navegador para errores específicos

## Limitaciones del Modo de Prueba

Las reglas en "modo de prueba" expiran después de 30 días. Para producción:

1. Implementa autenticación de Firebase
2. Actualiza las reglas de seguridad
3. Considera límites de uso y costos

## Costos

Firebase Firestore tiene un nivel gratuito generoso:
- 50,000 lecturas/día
- 20,000 escrituras/día
- 1 GB de almacenamiento

Para la mayoría de equipos pequeños, esto es suficiente y gratuito.

## Próximos Pasos

Una vez que Firebase esté funcionando, considera:

1. **Autenticación**: Agregar login con Google/Email
2. **Permisos**: Roles de admin/editor por workspace
3. **Tiempo Real**: Actualizaciones en vivo con Firebase Realtime listeners
4. **Backup**: Exportación automática de datos