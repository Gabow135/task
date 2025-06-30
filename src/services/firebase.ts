import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig, FIREBASE_ENABLED, DEMO_MODE } from '../config/firebase-config';

// Inicializar Firebase solo si está habilitado
let app: any = null;
let db: any = null;

if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export interface CloudWorkspace {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_accessed: string;
  data?: string; // Base64 encoded database content
}

class FirebaseService {
  // Guardar workspace en Firebase
  async saveWorkspace(workspace: CloudWorkspace): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      throw new Error('Firebase not configured');
    }
    
    try {
      const docRef = doc(db, 'workspaces', workspace.key);
      await setDoc(docRef, {
        id: workspace.id,
        name: workspace.name,
        key: workspace.key,
        created_at: workspace.created_at,
        last_accessed: workspace.last_accessed,
        data: workspace.data || ''
      });
    } catch (error) {
      console.error('Error saving workspace to Firebase:', error);
      throw error;
    }
  }

  // Buscar workspace por clave
  async findWorkspaceByKey(key: string): Promise<CloudWorkspace | null> {
    if (!FIREBASE_ENABLED || !db) {
      return null;
    }
    
    try {
      const docRef = doc(db, 'workspaces', key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: data.id,
          name: data.name,
          key: data.key,
          created_at: data.created_at,
          last_accessed: data.last_accessed,
          data: data.data || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding workspace in Firebase:', error);
      return null;
    }
  }

  // Actualizar workspace
  async updateWorkspace(key: string, updates: Partial<CloudWorkspace>): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'workspaces', key);
      await updateDoc(docRef, {
        ...updates,
        last_accessed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating workspace in Firebase:', error);
      throw error;
    }
  }

  // Eliminar workspace
  async deleteWorkspace(key: string): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'workspaces', key);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting workspace from Firebase:', error);
      throw error;
    }
  }

  // Verificar si Firebase está disponible
  async isAvailable(): Promise<boolean> {
    if (!FIREBASE_ENABLED || !db) {
      return false;
    }
    
    try {
      // Intenta hacer una operación simple para verificar la conectividad
      const testDoc = doc(db, 'test', 'connectivity');
      await getDoc(testDoc);
      return true;
    } catch (error) {
      console.warn('Firebase not available:', error);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
export { db };