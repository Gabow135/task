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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAs2h0hpFYTG0Dg8W9a9qu4UY9urH9U6ZQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "trello-colaborativo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "trello-colaborativo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "trello-colaborativo.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "116401509058",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:116401509058:web:6c57953b1ee7b2327fe15b",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-6PZ6SPW292"
};

// Flag para habilitar/deshabilitar Firebase
export const FIREBASE_ENABLED = process.env.REACT_APP_FIREBASE_ENABLED === 'true' || true;

// Configuración de fallback para desarrollo/demo
export const DEMO_MODE = !FIREBASE_ENABLED;