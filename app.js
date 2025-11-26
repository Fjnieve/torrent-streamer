// Inicializar WebTorrent client
const client = new WebTorrent();

// Variables globales
let currentTorrent = null;
let selectedFile = null;

// Elementos del DOM
const torrentFileInput = document.getElementById('torrentFile');
const magnetLinkInput = document.getElementById('magnetLink');
const loadMagnetBtn = document.getElementById('loadMagnet');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const fileListDiv = document.getElementById('fileList');
const player = document.getElementById('player');
const controls = document.getElementById('controls');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const stats = document.getElementById('stats');

// Elementos de estadísticas
const downloadSpeedEl = document.getElementById('downloadSpeed');
const uploadSpeedEl = document.getElementById('uploadSpeed');
const peersEl = document.getElementById('peers');
const downloadedEl = document.getElementById('downloaded');

// Event Listeners
torrentFileInput.addEventListener('change', handleTorrentFile);
loadMagnetBtn.addEventListener('click', handleMagnetLink);
stopBtn.addEventListener('click', stopTorrent);
clearBtn.addEventListener('click', clearCache);

// Función para mostrar estado
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = 'status active';
    if (type === 'error') {
        statusDiv.classList.add('error');
    } else if (type === 'success') {
        statusDiv.classList.add('success');
    }
}

// Función para formatear bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para formatear velocidad
function formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 KB/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Actualizar estadísticas
function updateStats() {
    if (!currentTorrent) return;

    downloadSpeedEl.textContent = formatSpeed(currentTorrent.downloadSpeed);
    uploadSpeedEl.textContent = formatSpeed(currentTorrent.uploadSpeed);
    peersEl.textContent = currentTorrent.numPeers;
    downloadedEl.textContent = formatBytes(currentTorrent.downloaded);
}

// Manejar archivo torrent
function handleTorrentFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 Archivo seleccionado:', file.name);
    console.log('📊 Tamaño del archivo:', formatBytes(file.size));
    console.log('🔧 Tipo:', file.type);

    // Verificar que sea un archivo .torrent
    if (!file.name.endsWith('.torrent')) {
        showStatus('❌ Error: Debe ser un archivo .torrent', 'error');
        console.error('❌ Archivo no válido:', file.name);
        return;
    }

    showStatus('📖 Cargando archivo .torrent...', 'info');

    // WebTorrent en el navegador acepta el File directamente
    // No necesitamos leer el contenido manualmente
    console.log('🚀 Pasando archivo directamente a WebTorrent...');
    loadTorrent(file);
}

// Manejar magnet link
function handleMagnetLink() {
    const magnetURI = magnetLinkInput.value.trim();
    if (!magnetURI) {
        showStatus('Por favor ingresa un magnet link', 'error');
        return;
    }

    if (!magnetURI.startsWith('magnet:')) {
        showStatus('El link debe empezar con "magnet:"', 'error');
        return;
    }

    showStatus('Cargando magnet link...', 'info');
    loadTorrent(magnetURI);
}

// Cargar torrent
function loadTorrent(torrentId) {
    console.log('🚀 Iniciando carga de torrent...');

    // Limpiar torrent anterior si existe
    if (currentTorrent) {
        console.log('🗑️ Destruyendo torrent anterior...');
        currentTorrent.destroy();
    }

    // Resetear UI
    player.classList.remove('active');
    player.src = '';
    fileListDiv.innerHTML = '';
    fileListDiv.classList.remove('active');
    controls.classList.remove('active');

    // MOSTRAR PROGRESO INMEDIATAMENTE
    showStatus('🔍 Conectando a peers y obteniendo metadata...', 'info');
    progressBar.classList.add('active');
    stats.classList.add('active');
    controls.classList.add('active');

    // Inicializar progreso en 0
    progressFill.style.width = '0%';
    progressFill.textContent = 'Conectando...';

    console.log('📡 Añadiendo torrent a WebTorrent...');
    console.log('🔍 Tipo de torrentId:', typeof torrentId);

    if (torrentId instanceof File) {
        console.log('📦 TorrentId: File (' + torrentId.name + ', ' + formatBytes(torrentId.size) + ')');
    } else if (torrentId instanceof Uint8Array) {
        console.log('📦 TorrentId: Uint8Array (' + torrentId.length + ' bytes)');
    } else if (typeof torrentId === 'string') {
        console.log('📦 TorrentId:', torrentId.substring(0, 70) + '...');
    } else {
        console.log('📦 TorrentId:', torrentId);
    }

    // Trackers públicos WebSocket para WebTorrent
    const publicTrackers = [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.webtorrent.dev',
        'wss://tracker.btorrent.xyz',
        'wss://tracker.files.fm:7073/announce',
        // Trackers adicionales más confiables
        'wss://tracker.novage.com.ua:443/announce',
        'wss://tracker.webtorrent.io'
    ];

    console.log('🌐 Agregando trackers públicos:', publicTrackers);

    try {
        // Añadir torrent con trackers y DHT habilitado
        const torrent = client.add(torrentId, {
            announce: publicTrackers,
            // Habilitar DHT para encontrar peers sin trackers
            private: false,
            // Usar IndexedDB para almacenamiento (persistente en el navegador)
            storageImpl: window.indexedDB ? null : undefined
        });

        if (!torrent) {
            throw new Error('No se pudo crear el objeto torrent');
        }

        currentTorrent = torrent;
        console.log('✅ Torrent añadido al cliente');
    } catch (err) {
        console.error('❌ Error al añadir torrent:', err);
        showStatus('❌ Error al cargar: ' + err.message, 'error');
        progressBar.classList.remove('active');
        stats.classList.remove('active');
        controls.classList.remove('active');
        return;
    }

    const torrent = currentTorrent;

    // Mostrar información de trackers inmediatamente
    console.log('🔍 Información del torrent:');
    console.log('📡 Announce (trackers):', torrent.announce || 'No disponible aún');
    console.log('🆔 Info Hash:', torrent.infoHash || 'Calculando...');

    // Timeout para advertir si no hay peers después de 30 segundos
    const peerTimeout = setTimeout(() => {
        if (torrent.numPeers === 0) {
            console.warn('⚠️ No se han conectado peers en 30 segundos');
            showStatus('⚠️ No se encontraron peers. El torrent puede no tener seeds activos o WebRTC puede estar bloqueado.', 'error');
        }
    }, 30000);

    // Evento: cuando se obtienen los metadatos
    torrent.on('metadata', () => {
        clearTimeout(peerTimeout);
        console.log('✅ Metadata recibida!');
        console.log('📦 Nombre:', torrent.name);
        console.log('📊 Tamaño:', formatBytes(torrent.length));
        console.log('📁 Archivos:', torrent.files.length);
        console.log('📡 Trackers:', torrent.announce);

        showStatus(`✅ Torrent cargado: ${torrent.name}`, 'success');

        // Mostrar archivos
        displayFiles(torrent.files);
    });

    // Evento: cuando hay nuevos peers
    torrent.on('wire', (wire, addr) => {
        console.log('🤝 Nuevo peer conectado:', addr || 'dirección desconocida');
        showStatus(`🤝 Conectado a ${torrent.numPeers} peer(s)`, 'success');
    });

    // Evento: cuando se anuncia a un tracker
    torrent.on('tracker-announce', () => {
        console.log('📢 Anunciando a trackers...');
    });

    // Evento: respuesta del tracker
    torrent.on('tracker-response', (data) => {
        console.log('📡 Respuesta del tracker:', data);
        console.log('   - Tracker URL:', data.announce);
        console.log('   - Peers encontrados:', data.peers ? data.peers.length : 0);
        if (data.peers && data.peers.length > 0) {
            showStatus(`✅ Encontrados ${data.peers.length} peers potenciales`, 'success');
        }
    });

    // Evento: error de tracker (más específico)
    torrent.on('tracker-error', (err, tracker) => {
        console.error('❌ Error de tracker:', tracker, err.message);
    });

    // Evento: advertencias
    torrent.on('warning', (err) => {
        console.warn('⚠️ Advertencia:', err.message);
    });

    // Evento: errores
    torrent.on('error', (err) => {
        console.error('❌ Error del torrent:', err);
        showStatus('❌ Error: ' + err.message, 'error');
    });

    // Evento: cuando se descarga un chunk
    torrent.on('download', (bytes) => {
        console.log('📥 Descargados:', formatBytes(bytes));
    });

    // Evento: cuando el torrent termina
    torrent.on('done', () => {
        console.log('🎉 ¡Descarga completa!');
        showStatus('🎉 ¡Descarga completa!', 'success');
    });

    // Actualizar progreso continuamente
    const interval = setInterval(() => {
        if (!currentTorrent) {
            clearInterval(interval);
            return;
        }

        const progress = Math.round(torrent.progress * 100);
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';

        // Actualizar estadísticas
        updateStats();

        // Log cada 5 segundos
        if (progress % 5 === 0) {
            console.log(`📊 Progreso: ${progress}%, Peers: ${torrent.numPeers}, Velocidad: ${formatSpeed(torrent.downloadSpeed)}`);
        }
    }, 500); // Actualizar cada 500ms para más responsividad

    // Error global del cliente
    client.on('error', (err) => {
        console.error('❌ Error del cliente:', err);
        showStatus('❌ Error: ' + err.message, 'error');
    });
}

// Mostrar lista de archivos
function displayFiles(files) {
    fileListDiv.innerHTML = '<h3 style="margin-bottom: 15px;">📂 Archivos disponibles:</h3>';

    // Ordenar archivos por nombre
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    sortedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        // Determinar tipo y compatibilidad
        const extension = file.name.split('.').pop().toLowerCase();
        const isVideo = /\.(mp4|mkv|avi|mov|webm|m4v)$/i.test(file.name);
        const isAudio = /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
        const isPlayable = isVideo || isAudio;

        // Formatos nativamente soportados por navegadores
        const nativeFormats = ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'm4a'];
        const isNativelySupported = nativeFormats.includes(extension);

        const icon = isVideo ? '🎬' : isAudio ? '🎵' : '📄';

        let compatibilityWarning = '';
        if (isPlayable && !isNativelySupported) {
            compatibilityWarning = ' <span style="color: #ff9800;">⚠️ Compatibilidad limitada</span>';
        }

        fileItem.innerHTML = `
            <div class="file-name">${icon} ${file.name}${compatibilityWarning}</div>
            <div class="file-size">${formatBytes(file.length)} ${isPlayable ? '- Haz click para reproducir' : ''}</div>
        `;

        if (isPlayable) {
            fileItem.addEventListener('click', () => {
                selectFile(file, fileItem);
            });
        } else {
            fileItem.style.opacity = '0.6';
            fileItem.style.cursor = 'not-allowed';
        }

        fileListDiv.appendChild(fileItem);
    });

    fileListDiv.classList.add('active');
}

// Seleccionar y reproducir archivo
function selectFile(file, fileElement) {
    // Remover selección previa
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Marcar como seleccionado
    fileElement.classList.add('selected');
    selectedFile = file;

    console.log('🎬 Intentando reproducir:', file.name);
    console.log('📊 Tamaño:', formatBytes(file.length));

    // Verificar formato del archivo
    const extension = file.name.split('.').pop().toLowerCase();
    const supportedFormats = ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'm4a'];
    const isFormatSupported = supportedFormats.includes(extension);

    // Advertir sobre MKV y AVI (no soportados nativamente)
    if (extension === 'mkv' || extension === 'avi') {
        showStatus(`⚠️ Formato ${extension.toUpperCase()} puede no ser compatible. Intenta con MP4 o WebM para mejor compatibilidad.`, 'error');
        console.warn('⚠️ Formato no soportado nativamente por navegadores:', extension);
    }

    // Verificar tamaño (200MB es el límite para streaming óptimo)
    const MAX_BLOB_SIZE = 200 * 1024 * 1024; // 200 MB
    const isLargeFile = file.length > MAX_BLOB_SIZE;

    if (isLargeFile) {
        console.log('📦 Archivo grande detectado, usando streaming progresivo...');
        showStatus(`📦 Archivo grande (${formatBytes(file.length)}). Preparando streaming...`, 'info');
    } else {
        showStatus(`📥 Preparando: ${file.name}`, 'info');
    }

    // Limpiar el reproductor
    player.src = '';
    player.classList.remove('active');

    // Para archivos grandes o MKV, intentar con appendTo creando un nuevo elemento
    if (isLargeFile || !isFormatSupported) {
        console.log('🎥 Usando appendTo() para archivos grandes/especiales...');

        // Crear contenedor para el nuevo video
        const videoContainer = document.getElementById('player').parentElement;

        // Limpiar videos anteriores creados por appendTo
        const oldVideos = videoContainer.querySelectorAll('video:not(#player)');
        oldVideos.forEach(v => v.remove());

        try {
            file.appendTo(videoContainer, {
                autoplay: true,
                controls: true,
                maxBlobLength: MAX_BLOB_SIZE
            }, (err) => {
                if (err) {
                    console.error('❌ Error con appendTo():', err);
                    // Intentar método simple
                    trySimpleRender(file);
                    return;
                }

                console.log('✅ AppendTo funcionó');
                showStatus(`▶️ Reproduciendo: ${file.name}`, 'success');

                // Ocultar el player original y mostrar el nuevo
                const newVideo = videoContainer.querySelector('video:not(#player)');
                if (newVideo) {
                    newVideo.style.width = '100%';
                    newVideo.style.maxWidth = '100%';
                    newVideo.style.borderRadius = '10px';
                    newVideo.style.background = '#000';
                    newVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        } catch (err) {
            console.error('❌ Error al iniciar appendTo:', err);
            trySimpleRender(file);
        }
    } else {
        // Para archivos pequeños y soportados, usar renderTo directo
        trySimpleRender(file);
    }
}

// Método simple usando renderTo
function trySimpleRender(file) {
    console.log('🎥 Usando renderTo() para reproducción...');
    showStatus('🎥 Preparando reproducción...', 'info');

    player.classList.add('active');

    file.renderTo(player, {
        autoplay: true,
        controls: true
    }, (err) => {
        if (err) {
            console.error('❌ Error con renderTo():', err);

            // Determinar el tipo de error
            if (err.message.includes('Blob URL') || err.message.includes('too large')) {
                showStatus(`❌ Archivo demasiado grande (${formatBytes(file.length)}). WebTorrent tiene un límite de 200MB para este método. Prueba con un archivo más pequeño o en formato MP4.`, 'error');
            } else if (err.message.includes('no supported source')) {
                showStatus(`❌ Formato no soportado. El navegador no puede reproducir archivos ${file.name.split('.').pop().toUpperCase()}. Prueba con MP4, WebM o MP3.`, 'error');
            } else {
                showStatus(`❌ Error al reproducir: ${err.message}`, 'error');
            }
            return;
        }

        console.log('✅ Reproducción iniciada');
        showStatus(`▶️ Reproduciendo: ${file.name}`, 'success');
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// Detener torrent
function stopTorrent() {
    if (!currentTorrent) {
        showStatus('No hay ningún torrent activo', 'error');
        return;
    }

    const torrentName = currentTorrent.name;
    currentTorrent.destroy(() => {
        currentTorrent = null;
        selectedFile = null;

        // Resetear UI
        player.classList.remove('active');
        player.src = '';
        fileListDiv.innerHTML = '';
        fileListDiv.classList.remove('active');
        progressBar.classList.remove('active');
        stats.classList.remove('active');
        progressFill.style.width = '0%';
        progressFill.textContent = '0%';
        torrentFileInput.value = '';
        magnetLinkInput.value = '';

        showStatus(`Torrent detenido: ${torrentName}`, 'info');
    });
}

// Limpiar caché
function clearCache() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los archivos descargados?')) {
        // Detener todos los torrents
        client.destroy(() => {
            showStatus('Caché limpiado. Recarga la página para continuar.', 'success');

            // Limpiar IndexedDB
            if (window.indexedDB) {
                const request = indexedDB.deleteDatabase('webtorrent');
                request.onsuccess = () => {
                    console.log('IndexedDB eliminado');
                };
            }

            // Resetear UI
            player.classList.remove('active');
            player.src = '';
            fileListDiv.innerHTML = '';
            fileListDiv.classList.remove('active');
            controls.classList.remove('active');
            progressBar.classList.remove('active');
            stats.classList.remove('active');
            progressFill.style.width = '0%';
            progressFill.textContent = '0%';
            torrentFileInput.value = '';
            magnetLinkInput.value = '';

            // Recargar la página después de 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });
    }
}

// Prevenir que el navegador descargue el archivo .torrent al soltarlo
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Verificar WebRTC
function checkWebRTC() {
    const hasRTCPeerConnection = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    const hasWebSocket = !!window.WebSocket;

    console.log('🔍 Verificando capacidades del navegador:');
    console.log('   ✓ RTCPeerConnection:', hasRTCPeerConnection ? '✅ Disponible' : '❌ No disponible');
    console.log('   ✓ WebSocket:', hasWebSocket ? '✅ Disponible' : '❌ No disponible');

    if (!hasRTCPeerConnection) {
        showStatus('❌ WebRTC no está disponible en este navegador. WebTorrent no funcionará.', 'error');
        return false;
    }

    if (!hasWebSocket) {
        showStatus('❌ WebSocket no está disponible. No se podrá conectar a trackers.', 'error');
        return false;
    }

    return true;
}

// Verificar que WebTorrent esté disponible
if (typeof WebTorrent === 'undefined') {
    showStatus('❌ Error: WebTorrent no se cargó correctamente. Recarga la página.', 'error');
    console.error('❌ WebTorrent no está disponible');
} else {
    console.log('✅ WebTorrent cargado correctamente');
    console.log('📦 Versión:', WebTorrent.VERSION);
    console.log('🌐 Navegador:', navigator.userAgent);

    // Verificar WebRTC
    const webrtcOK = checkWebRTC();

    if (webrtcOK) {
        console.log('🎬 Torrent Streamer listo para usar');
        showStatus('✅ Aplicación lista. Carga un torrent para comenzar.', 'success');
    }
}

// Log de depuración para el cliente
console.log('👥 Cliente WebTorrent:', client);
console.log('🔧 Opciones del cliente:', {
    maxConns: client.maxConns,
    downloadLimit: client.downloadLimit,
    uploadLimit: client.uploadLimit
});
