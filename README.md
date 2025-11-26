# 🎬 Torrent Streamer

Aplicación web para reproducir archivos torrent en streaming sin necesidad de descargar el contenido completo. Compatible con iOS y cualquier navegador moderno.

## ✨ Características

- ✅ Streaming de torrents en tiempo real
- ✅ Soporte para archivos .torrent y magnet links
- ✅ Reproducción de video y audio
- ✅ Interfaz responsive compatible con iOS
- ✅ Estadísticas en tiempo real (velocidad, peers, progreso)
- ✅ Almacenamiento local con IndexedDB
- ✅ Gestión de caché para limpiar archivos descargados

## 🚀 Cómo alojar en GitHub Pages

### Paso 1: Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz click en el botón "+" en la esquina superior derecha
3. Selecciona "New repository"
4. Nombra tu repositorio (por ejemplo: `torrent-streamer`)
5. Marca como **Public** (GitHub Pages gratis requiere repositorio público)
6. Haz click en "Create repository"

### Paso 2: Subir los archivos

Tienes dos opciones:

#### Opción A: Usando la interfaz web de GitHub

1. En tu repositorio nuevo, haz click en "uploading an existing file"
2. Arrastra los archivos: `index.html`, `app.js`, y `README.md`
3. Haz click en "Commit changes"

#### Opción B: Usando Git (línea de comandos)

```bash
# Inicializar git en la carpeta del proyecto
git init

# Agregar los archivos
git add index.html app.js README.md

# Hacer commit
git commit -m "Initial commit: Torrent Streamer app"

# Agregar el repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/torrent-streamer.git

# Subir los archivos
git branch -M main
git push -u origin main
```

### Paso 3: Activar GitHub Pages

1. En tu repositorio, ve a "Settings" (Configuración)
2. En el menú lateral izquierdo, haz click en "Pages"
3. En "Source", selecciona "Deploy from a branch"
4. En "Branch", selecciona `main` y carpeta `/ (root)`
5. Haz click en "Save"
6. Espera unos minutos y tu sitio estará disponible en: `https://TU-USUARIO.github.io/torrent-streamer/`

## 📱 Usar desde iOS

### Safari (Recomendado)

1. Abre Safari en tu iPhone/iPad
2. Navega a tu URL de GitHub Pages: `https://TU-USUARIO.github.io/torrent-streamer/`
3. La aplicación funcionará directamente en el navegador

### Agregar a la pantalla de inicio (PWA)

1. Abre la aplicación en Safari
2. Toca el botón de "Compartir" (cuadrado con flecha hacia arriba)
3. Desplázate y selecciona "Agregar a pantalla de inicio"
4. Dale un nombre (por ejemplo: "Torrent Player")
5. Toca "Agregar"
6. Ahora tendrás un ícono en tu pantalla de inicio que abre la app como si fuera nativa

## 🎯 Cómo usar la aplicación

1. **Cargar un torrent:**
   - Opción 1: Haz click en "📁 Seleccionar archivo .torrent" y elige un archivo .torrent
   - Opción 2: Pega un magnet link en el campo de texto y haz click en "🧲 Cargar Magnet Link"

2. **Seleccionar archivo:**
   - Espera a que se cargue la lista de archivos
   - Los archivos de video (🎬) y audio (🎵) serán reproducibles
   - Haz click en el archivo que quieres ver/escuchar

3. **Reproducir:**
   - El reproductor aparecerá automáticamente
   - Usa los controles estándar de video/audio
   - El contenido se descargará mientras lo reproduces (streaming)

4. **Limpiar caché:**
   - Haz click en "🗑️ Limpiar caché" para borrar todos los archivos descargados
   - Esto liberará espacio en tu navegador

## 🔧 Formatos soportados

### Video
- MP4, MKV, AVI, MOV, WebM, M4V

### Audio
- MP3, WAV, OGG, M4A, FLAC, AAC

## 📊 Almacenamiento

Los archivos se almacenan temporalmente en:
- **IndexedDB** del navegador (almacenamiento local persistente)
- Los archivos permanecen hasta que:
  - Uses el botón "Limpiar caché"
  - Borres los datos del navegador
  - El navegador limpie automáticamente (por falta de espacio)

## ⚠️ Consideraciones importantes

### Limitaciones de iOS
- Safari en iOS tiene límites de almacenamiento
- Para archivos muy grandes, es posible que necesites limpiar la caché frecuentemente
- WebRTC (usado por WebTorrent) funciona mejor con WiFi que con datos móviles

### Privacidad
- Esta aplicación funciona 100% en tu navegador
- No se envían datos a servidores externos (excepto a los peers de torrent)
- Todo el procesamiento es local

### Legalidad
- **IMPORTANTE:** Solo usa esta aplicación con contenido legal que tengas derecho a descargar
- Esta herramienta es para uso personal y educativo
- Respeta las leyes de copyright de tu país

## 🛠️ Tecnologías utilizadas

- **WebTorrent**: Biblioteca de torrents para navegadores
- **HTML5 Video/Audio API**: Reproducción multimedia
- **IndexedDB**: Almacenamiento persistente en el navegador
- **JavaScript ES6+**: Lógica de la aplicación

## 🐛 Solución de problemas

### El video no carga
- Verifica que el formato sea compatible
- Asegúrate de tener conexión a internet estable
- Espera a que se descargue suficiente contenido para iniciar la reproducción

### No se conecta a peers
- Verifica tu conexión a internet
- Algunos torrents tienen pocos peers, espera unos minutos
- WebRTC puede estar bloqueado por tu red (intenta con WiFi diferente)

### Error de almacenamiento
- Limpia la caché de la aplicación
- Libera espacio en tu dispositivo
- Borra datos del navegador de Safari

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 🤝 Contribuir

Si encuentras bugs o quieres mejorar la aplicación, siéntete libre de:
1. Hacer un fork del repositorio
2. Crear mejoras
3. Enviar pull requests

---
Probar con este enlace:
magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny

**¡Disfruta del streaming! 🍿**
