import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { firebaseConfig, FIREBASE_ENABLED, DEMO_MODE } from '../config/firebase-config';
import { Board, List, Card } from '../database/database';

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

export interface CloudBoard extends Board {
  workspace_key: string;
}

export interface CloudList extends List {
  workspace_key: string;
}

export interface CloudCard extends Card {
  workspace_key: string;
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

  // Board operations
  async saveBoard(workspaceKey: string, board: Board): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      throw new Error('Firebase not configured');
    }
    
    try {
      const boardData: CloudBoard = {
        ...board,
        workspace_key: workspaceKey
      };
      
      const docRef = doc(db, 'boards', `${workspaceKey}_${board.id}`);
      await setDoc(docRef, boardData);
    } catch (error) {
      console.error('Error saving board to Firebase:', error);
      throw error;
    }
  }

  async getBoardsByWorkspace(workspaceKey: string): Promise<CloudBoard[]> {
    if (!FIREBASE_ENABLED || !db) {
      return [];
    }
    
    try {
      const q = query(
        collection(db, 'boards'),
        where('workspace_key', '==', workspaceKey),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as CloudBoard);
    } catch (error) {
      console.error('Error getting boards from Firebase:', error);
      return [];
    }
  }

  async updateBoard(workspaceKey: string, boardId: number, updates: Partial<Board>): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'boards', `${workspaceKey}_${boardId}`);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating board in Firebase:', error);
      throw error;
    }
  }

  async deleteBoard(workspaceKey: string, boardId: number): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'boards', `${workspaceKey}_${boardId}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting board from Firebase:', error);
      throw error;
    }
  }

  // List operations
  async saveList(workspaceKey: string, list: List): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      throw new Error('Firebase not configured');
    }
    
    try {
      const listData: CloudList = {
        ...list,
        workspace_key: workspaceKey
      };
      
      const docRef = doc(db, 'lists', `${workspaceKey}_${list.id}`);
      await setDoc(docRef, listData);
    } catch (error) {
      console.error('Error saving list to Firebase:', error);
      throw error;
    }
  }

  async getListsByWorkspace(workspaceKey: string, boardId?: number): Promise<CloudList[]> {
    if (!FIREBASE_ENABLED || !db) {
      return [];
    }
    
    try {
      let q;
      if (boardId) {
        q = query(
          collection(db, 'lists'),
          where('workspace_key', '==', workspaceKey),
          where('board_id', '==', boardId),
          orderBy('position')
        );
      } else {
        q = query(
          collection(db, 'lists'),
          where('workspace_key', '==', workspaceKey),
          orderBy('position')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as CloudList);
    } catch (error) {
      console.error('Error getting lists from Firebase:', error);
      return [];
    }
  }

  async updateList(workspaceKey: string, listId: number, updates: Partial<List>): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'lists', `${workspaceKey}_${listId}`);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating list in Firebase:', error);
      throw error;
    }
  }

  async deleteList(workspaceKey: string, listId: number): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'lists', `${workspaceKey}_${listId}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting list from Firebase:', error);
      throw error;
    }
  }

  // Card operations
  async saveCard(workspaceKey: string, card: Card): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      throw new Error('Firebase not configured');
    }
    
    try {
      const cardData: CloudCard = {
        ...card,
        workspace_key: workspaceKey
      };
      
      const docRef = doc(db, 'cards', `${workspaceKey}_${card.id}`);
      await setDoc(docRef, cardData);
    } catch (error) {
      console.error('Error saving card to Firebase:', error);
      throw error;
    }
  }

  async getCardsByWorkspace(workspaceKey: string, listId?: number): Promise<CloudCard[]> {
    if (!FIREBASE_ENABLED || !db) {
      return [];
    }
    
    try {
      let q;
      if (listId) {
        q = query(
          collection(db, 'cards'),
          where('workspace_key', '==', workspaceKey),
          where('list_id', '==', listId),
          orderBy('position')
        );
      } else {
        q = query(
          collection(db, 'cards'),
          where('workspace_key', '==', workspaceKey),
          orderBy('position')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as CloudCard);
    } catch (error) {
      console.error('Error getting cards from Firebase:', error);
      return [];
    }
  }

  async updateCard(workspaceKey: string, cardId: number, updates: Partial<Card>): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'cards', `${workspaceKey}_${cardId}`);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating card in Firebase:', error);
      throw error;
    }
  }

  async deleteCard(workspaceKey: string, cardId: number): Promise<void> {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }
    
    try {
      const docRef = doc(db, 'cards', `${workspaceKey}_${cardId}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting card from Firebase:', error);
      throw error;
    }
  }

  // Real-time listeners
  onBoardsChange(workspaceKey: string, callback: (boards: CloudBoard[]) => void): () => void {
    if (!FIREBASE_ENABLED || !db) {
      return () => {};
    }
    
    const q = query(
      collection(db, 'boards'),
      where('workspace_key', '==', workspaceKey),
      orderBy('created_at', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const boards = querySnapshot.docs.map(doc => doc.data() as CloudBoard);
      callback(boards);
    });
  }

  onListsChange(workspaceKey: string, boardId: number, callback: (lists: CloudList[]) => void): () => void {
    if (!FIREBASE_ENABLED || !db) {
      return () => {};
    }
    
    const q = query(
      collection(db, 'lists'),
      where('workspace_key', '==', workspaceKey),
      where('board_id', '==', boardId),
      orderBy('position')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const lists = querySnapshot.docs.map(doc => doc.data() as CloudList);
      callback(lists);
    });
  }

  onCardsChange(workspaceKey: string, listId: number, callback: (cards: CloudCard[]) => void): () => void {
    if (!FIREBASE_ENABLED || !db) {
      return () => {};
    }
    
    const q = query(
      collection(db, 'cards'),
      where('workspace_key', '==', workspaceKey),
      where('list_id', '==', listId),
      orderBy('position')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const cards = querySnapshot.docs.map(doc => doc.data() as CloudCard);
      callback(cards);
    });
  }

  // Verificar si Firebase está disponible
  async isAvailable(): Promise<boolean> {
    if (!FIREBASE_ENABLED || !db) {
      return false;
    }
    
    try {
      // Intenta hacer una operación simple para verificar la conectividad
      const testDoc = doc(db, 'workspaces', 'test-connection');
      await getDoc(testDoc);
      return true;
    } catch (error: any) {
      console.warn('Firebase not available:', error);
      
      // Proporcionar información específica sobre el error
      if (error?.code === 'permission-denied') {
        console.error(`
🚨 FIREBASE PERMISSION ERROR:
Las reglas de Firestore están bloqueando el acceso.

SOLUCIÓN:
1. Ve a Firebase Console → Firestore Database → Reglas
2. Reemplaza las reglas con:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document} {
      allow read, write: if true;
    }
  }
}

3. Publica las reglas
4. Recarga la aplicación
        `);
      } else if (error?.code === 'unavailable') {
        console.error('Firebase service temporarily unavailable');
      }
      
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
export { db };