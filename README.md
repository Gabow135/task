# 📋 Trello App - Clon de Trello con React y SQLite

Una aplicación tipo Trello construida con React, TypeScript y SQLite que funciona completamente en el navegador.

## ✨ Características

- 📝 **Tableros, listas y tarjetas** - Organización completa tipo Kanban
- 🖼️ **Soporte de imágenes** - Agrega imágenes a las tarjetas con drag & drop
- 🎯 **Drag & drop** - Mueve tarjetas entre listas fácilmente
- 💾 **Persistencia local** - Datos guardados en SQLite local
- 📱 **Responsive** - Funciona en móviles y desktop
- ⚡ **Sin backend** - Todo funciona en el navegador

## 🚀 Instalación y uso

### Desarrollo
```bash
# Clonar repositorio
git clone [tu-repo-url]
cd trello-app

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

### Producción
```bash
# Compilar para producción
npm run build

# Servir localmente
npm install -g serve
serve -s build
```

### Deploy en GitHub Pages
```bash
# Configurar tu usuario en package.json homepage
# Instalar gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## 🛠️ Tecnologías utilizadas

- **React 19** - Framework frontend
- **TypeScript** - Tipado estático
- **SQLite (sql.js)** - Base de datos en el navegador
- **@hello-pangea/dnd** - Drag and drop
- **CSS3** - Estilos personalizados

## 📱 Funcionalidades

### Gestión de tableros
- ✅ Crear múltiples tableros
- ✅ Editar nombres de tableros
- ✅ Eliminar tableros
- ✅ Navegación entre tableros

### Gestión de listas
- ✅ Crear listas en tableros
- ✅ Editar nombres de listas
- ✅ Eliminar listas
- ✅ Reordenar listas

### Gestión de tarjetas
- ✅ Crear tarjetas con título y descripción
- ✅ Agregar imágenes (drag & drop o click)
- ✅ Editar tarjetas
- ✅ Eliminar tarjetas
- ✅ Mover tarjetas entre listas (drag & drop)

### Gestión de imágenes
- ✅ Upload por drag & drop
- ✅ Selección tradicional de archivos
- ✅ Formatos: JPG, PNG, GIF
- ✅ Límite de 5MB por imagen
- ✅ Vista previa en tarjetas
- ✅ Cambiar/eliminar imágenes

## 💾 Almacenamiento

Los datos se guardan localmente en el navegador usando:
- **SQLite** (sql.js) para la estructura de datos
- **localStorage** para persistencia
- **Base64** para almacenamiento de imágenes

## 📦 Scripts disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm test` - Ejecutar tests
- `npm run deploy` - Deploy a GitHub Pages

## 🌐 Deploy sugerido

### Netlify (Recomendado)
1. Ir a [netlify.com](https://netlify.com)
2. Arrastrar carpeta `build` a la zona de deploy
3. ¡Listo!

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
npm run deploy
```

## 🔧 Configuración

### Para GitHub Pages
Actualizar `homepage` en `package.json`:
```json
"homepage": "https://tu-usuario.github.io/nombre-repo"
```

### Para subdirectorios
Si vas a hostear en un subdirectorio, actualiza la URL base en `package.json`.

## 📄 Licencia

MIT License - Puedes usar este código libremente.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:
1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras problemas:
1. Revisa que tengas Node.js 16+ instalado
2. Borra `node_modules` y ejecuta `npm install`
3. Si hay problemas con la BD, recarga la página (se resetea automáticamente)

---

Hecho con ❤️ usando React y TypeScript