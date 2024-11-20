// Definir el nombre de la base de datos y el nombre del objeto de almacenamiento
const dbName = 'BibliotecaDB';
const storeName = 'Libros';

let db; // Variable para almacenar la conexión con IndexedDB

// Guardar configuración en LocalStorage
localStorage.setItem('tema', 'oscuro');

// Acceder a la base de datos IndexedDB
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    // Crear el objeto de almacenamiento si no existe
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    mostrarLibros(); // Recuperar y mostrar libros
};

request.onerror = (event) => {
    console.error('Error al abrir IndexedDB:', event.target.errorCode);
};

// Función para mostrar libros offline desde IndexedDB
function mostrarLibros() {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
        const libros = event.target.result;
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerHTML = '';
        
        libros.forEach(libro => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${libro.titulo}</h3>
                <p><strong>Autor:</strong> ${libro.autor}</p>
                <p><strong>Año:</strong> ${libro.anio}</p>
            `;
            resultadoDiv.appendChild(card);
        });
    };
}

// Registro de Service Worker y Push Notifications
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registrado con éxito:', registration);
            // Suscripción a notificaciones push
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: '<Clave del Servidor>'
            }).then(subscription => {
                console.log('Suscripción a Push:', subscription);
                guardarSuscripcion(subscription);
            });
        })
        .catch(error => console.error('Error al registrar el Service Worker:', error));
}

// Guardar suscripción en IndexedDB
function guardarSuscripcion(subscription) {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.put({ id: 'suscripcion', subscription });

    request.onsuccess = () => {
        console.log('Suscripción guardada en IndexedDB');
    };
}

// Enviar una notificación manual desde la base de datos
function enviarNotificacionManual() {
    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Notificación Manual', {
            body: 'Esta es una notificación enviada manualmente',
            icon: '/icons/icon-192x192.png'
        });
    });
}

// Agregar evento al botón de notificación manual
document.getElementById('enviarNotificacion').addEventListener('click', enviarNotificacionManual);
