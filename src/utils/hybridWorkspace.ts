import { 
  Workspace, 
  generateWorkspaceKey, 
  generateWorkspaceId, 
  isValidWorkspaceKey,
  getCurrentWorkspace as getLocalCurrentWorkspace,
  setCurrentWorkspace as setLocalCurrentWorkspace,
  getSavedWorkspaces as getLocalSavedWorkspaces,
  saveWorkspace as saveLocalWorkspace,
  removeWorkspace as removeLocalWorkspace,
  getWorkspaceDbKey
} from './workspace';
import { firebaseService, CloudWorkspace } from '../services/firebase';
import { FIREBASE_ENABLED } from '../config/firebase-config';

class HybridWorkspaceService {
  // Crear workspace (guarda local y en la nube si está disponible)
  async createWorkspace(name: string, customKey?: string): Promise<Workspace> {
    const workspace: Workspace = {
      id: generateWorkspaceId(),
      name: name.trim(),
      key: customKey || generateWorkspaceKey(),
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString()
    };

    // Guardar localmente
    saveLocalWorkspace(workspace);

    // Intentar guardar en Firebase
    if (FIREBASE_ENABLED) {
      try {
        const cloudWorkspace: CloudWorkspace = {
          ...workspace,
          data: '' // Se llenará cuando se sincronice la base de datos
        };
        await firebaseService.saveWorkspace(cloudWorkspace);
        console.log('Workspace saved to cloud successfully');
      } catch (error) {
        console.warn('Failed to save workspace to cloud, using local only:', error);
      }
    }

    return workspace;
  }

  // Buscar workspace por clave (primero en la nube, luego local)
  async findWorkspaceByKey(key: string): Promise<Workspace | null> {
    if (!isValidWorkspaceKey(key)) {
      return null;
    }

    // Primero intentar en Firebase
    if (FIREBASE_ENABLED) {
      try {
        const cloudWorkspace = await firebaseService.findWorkspaceByKey(key);
        if (cloudWorkspace) {
          // Convertir CloudWorkspace a Workspace
          const workspace: Workspace = {
            id: cloudWorkspace.id,
            name: cloudWorkspace.name,
            key: cloudWorkspace.key,
            created_at: cloudWorkspace.created_at,
            last_accessed: cloudWorkspace.last_accessed
          };

          // Guardar localmente para acceso offline
          saveLocalWorkspace(workspace);

          // Si hay datos de la base de datos, restaurarlos
          if (cloudWorkspace.data) {
            try {
              const dbKey = getWorkspaceDbKey(workspace.id);
              localStorage.setItem(dbKey, cloudWorkspace.data);
            } catch (error) {
              console.warn('Failed to restore database from cloud:', error);
            }
          }

          return workspace;
        }
      } catch (error) {
        console.warn('Failed to search in cloud, checking local:', error);
      }
    }

    // Fallback a búsqueda local
    const localWorkspaces = getLocalSavedWorkspaces();
    return localWorkspaces.find(w => w.key.toLowerCase() === key.toLowerCase()) || null;
  }

  // Sincronizar workspace con la nube
  async syncWorkspaceToCloud(workspace: Workspace, databaseData?: string): Promise<boolean> {
    if (!FIREBASE_ENABLED) {
      return false;
    }

    try {
      const cloudWorkspace: CloudWorkspace = {
        ...workspace,
        data: databaseData || ''
      };

      await firebaseService.saveWorkspace(cloudWorkspace);
      return true;
    } catch (error) {
      console.error('Failed to sync workspace to cloud:', error);
      return false;
    }
  }

  // Obtener datos de la base de datos para sincronización
  getWorkspaceDatabaseData(workspaceId: string): string {
    try {
      const dbKey = getWorkspaceDbKey(workspaceId);
      return localStorage.getItem(dbKey) || '';
    } catch (error) {
      console.error('Failed to get database data:', error);
      return '';
    }
  }

  // Obtener workspace actual
  getCurrentWorkspace(): Workspace | null {
    return getLocalCurrentWorkspace();
  }

  // Establecer workspace actual
  setCurrentWorkspace(workspace: Workspace): void {
    setLocalCurrentWorkspace(workspace);
  }

  // Obtener workspaces guardados
  getSavedWorkspaces(): Workspace[] {
    return getLocalSavedWorkspaces();
  }

  // Guardar workspace
  saveWorkspace(workspace: Workspace): void {
    saveLocalWorkspace(workspace);
  }

  // Eliminar workspace
  async removeWorkspace(workspaceId: string): Promise<void> {
    // Obtener el workspace para conseguir la clave
    const workspaces = getLocalSavedWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);

    // Eliminar localmente
    removeLocalWorkspace(workspaceId);

    // Eliminar de la nube si es posible
    if (FIREBASE_ENABLED && workspace) {
      try {
        await firebaseService.deleteWorkspace(workspace.key);
      } catch (error) {
        console.warn('Failed to delete workspace from cloud:', error);
      }
    }
  }

  // Verificar si la nube está disponible
  async isCloudAvailable(): Promise<boolean> {
    if (!FIREBASE_ENABLED) {
      return false;
    }

    return await firebaseService.isAvailable();
  }

  // Sincronizar todos los workspaces locales con la nube
  async syncAllWorkspaces(): Promise<void> {
    if (!FIREBASE_ENABLED) {
      return;
    }

    const localWorkspaces = getLocalSavedWorkspaces();
    
    for (const workspace of localWorkspaces) {
      try {
        const databaseData = this.getWorkspaceDatabaseData(workspace.id);
        await this.syncWorkspaceToCloud(workspace, databaseData);
        console.log(`Synced workspace ${workspace.name} to cloud`);
      } catch (error) {
        console.warn(`Failed to sync workspace ${workspace.name}:`, error);
      }
    }
  }
}

export const hybridWorkspaceService = new HybridWorkspaceService();