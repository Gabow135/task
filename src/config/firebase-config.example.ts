// Configuración de Firebase
// 
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
// 
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Ve a "Configuración del proyecto" > "General" > "Tus aplicaciones"
// 4. Haz clic en "Agregar aplicación" y selecciona "Web"
// 5. Registra tu aplicación con un nombre
// 6. Copia la configuración que aparece y reemplaza los valores abajo
// 7. Ve a "Firestore Database" y crea una base de datos
// 8. Configura las reglas de seguridad (puedes usar las reglas de prueba temporalmente)
// 9. Copia este archivo como 'firebase-config.ts' y completa la configuración
//
// REGLAS DE FIRESTORE RECOMENDADAS:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /workspaces/{document} {
//       allow read, write: if true; // Temporalmente abierto - considera autenticación
//     }
//   }
// }

export const firebaseConfig = {
  // Ahora usa variables de entorno para mayor seguridad
  // Configura los valores en .env.local para desarrollo
  // O en GitHub Secrets para producción
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "demo-app-id",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Flag para habilitar/deshabilitar Firebase
export const FIREBASE_ENABLED = process.env.REACT_APP_FIREBASE_ENABLED === 'true' || false;

// Configuración de fallback para desarrollo/demo
export const DEMO_MODE = !FIREBASE_ENABLED;