# Configurar GitHub Secrets para Firebase

Para que GitHub Pages funcione con Firebase, necesitas configurar los secrets en tu repositorio.

## Opción 1: Manual (Recomendado)

### 1. Ve a tu repositorio en GitHub
- Ve a **Settings** > **Secrets and variables** > **Actions**

### 2. Agrega estos secrets uno por uno:

Haz clic en **"New repository secret"** para cada uno:

```
Name: REACT_APP_FIREBASE_API_KEY
Value: tu-api-key-de-firebase

Name: REACT_APP_FIREBASE_AUTH_DOMAIN  
Value: tu-proyecto.firebaseapp.com

Name: REACT_APP_FIREBASE_PROJECT_ID
Value: tu-proyecto-id

Name: REACT_APP_FIREBASE_STORAGE_BUCKET
Value: tu-proyecto.appspot.com

Name: REACT_APP_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789

Name: REACT_APP_FIREBASE_APP_ID
Value: tu-app-id

Name: REACT_APP_FIREBASE_MEASUREMENT_ID
Value: G-XXXXXXXXXX

Name: REACT_APP_FIREBASE_ENABLED
Value: true
```

## Opción 2: Usando GitHub CLI

Si tienes `gh` CLI instalado:

```bash
# Configura los secrets (reemplaza con tus valores reales)
gh secret set REACT_APP_FIREBASE_API_KEY --body "tu-api-key"
gh secret set REACT_APP_FIREBASE_AUTH_DOMAIN --body "tu-proyecto.firebaseapp.com"
gh secret set REACT_APP_FIREBASE_PROJECT_ID --body "tu-proyecto-id"
gh secret set REACT_APP_FIREBASE_STORAGE_BUCKET --body "tu-proyecto.appspot.com"
gh secret set REACT_APP_FIREBASE_MESSAGING_SENDER_ID --body "123456789"
gh secret set REACT_APP_FIREBASE_APP_ID --body "tu-app-id"
gh secret set REACT_APP_FIREBASE_MEASUREMENT_ID --body "G-XXXXXXXXXX"
gh secret set REACT_APP_FIREBASE_ENABLED --body "true"
```

## Verificar la Configuración

1. Después de configurar los secrets, haz un push al branch `main`
2. Ve a **Actions** en tu repositorio para ver el proceso de deployment
3. Si todo está bien, tu app se deployará automáticamente a GitHub Pages

## Solución de Problemas

### Si el build falla:
- Verifica que todos los secrets estén configurados correctamente
- Revisa los logs en la pestaña **Actions**

### Si Firebase no funciona en producción:
- Asegúrate de que `REACT_APP_FIREBASE_ENABLED=true`
- Verifica que el dominio de GitHub Pages esté autorizado en Firebase Console

## Beneficios de esta Configuración:

✅ **Seguro**: Las API keys no están en el código fuente
✅ **Automático**: Se deploya automáticamente con cada push
✅ **Flexible**: Puedes cambiar configuración sin modificar código
✅ **Profesional**: Separación clara entre desarrollo y producción