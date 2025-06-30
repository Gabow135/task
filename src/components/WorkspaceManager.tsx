import { useState, useEffect } from 'react';
import { Workspace, isValidWorkspaceKey } from '../utils/workspace';
import { hybridWorkspaceService } from '../utils/hybridWorkspace';
import { FIREBASE_ENABLED } from '../config/firebase-config';

interface WorkspaceManagerProps {
  onWorkspaceChange: (workspace: Workspace) => void;
}

function WorkspaceManager({ onWorkspaceChange }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [joinKey, setJoinKey] = useState('');
  const [error, setError] = useState('');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  useEffect(() => {
    loadWorkspaces();
    checkCloudConnection();
  }, []);

  const loadWorkspaces = () => {
    const savedWorkspaces = hybridWorkspaceService.getSavedWorkspaces();
    const current = hybridWorkspaceService.getCurrentWorkspace();
    setWorkspaces(savedWorkspaces);
    setCurrentWorkspaceState(current);
  };

  const checkCloudConnection = async () => {
    if (FIREBASE_ENABLED) {
      try {
        const connected = await hybridWorkspaceService.isCloudAvailable();
        setIsCloudConnected(connected);
        
        if (!connected) {
          setFirebaseError('No se pudo conectar a Firebase. Revisa la consola para más detalles.');
        } else {
          setFirebaseError('');
        }
      } catch (error: any) {
        setIsCloudConnected(false);
        if (error?.code === 'permission-denied') {
          setFirebaseError('Error de permisos en Firebase. Las reglas de Firestore necesitan ser configuradas.');
        } else {
          setFirebaseError('Error de conexión con Firebase.');
        }
      }
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setError('Por favor ingresa un nombre para el workspace');
      return;
    }

    setLoading(true);
    try {
      const workspace = await hybridWorkspaceService.createWorkspace(newWorkspaceName.trim());
      hybridWorkspaceService.setCurrentWorkspace(workspace);
      setCurrentWorkspaceState(workspace);
      onWorkspaceChange(workspace);
      loadWorkspaces();
      setShowCreateForm(false);
      setNewWorkspaceName('');
      setError('');
    } catch (err) {
      setError('Error al crear el workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!joinKey.trim()) {
      setError('Por favor ingresa una clave de workspace');
      return;
    }

    if (!isValidWorkspaceKey(joinKey.trim())) {
      setError('La clave debe tener 8 caracteres alfanuméricos');
      return;
    }

    setLoading(true);
    try {
      const workspace = await hybridWorkspaceService.findWorkspaceByKey(joinKey.trim());
      if (!workspace) {
        setError('No se encontró un workspace con esa clave');
        return;
      }

      hybridWorkspaceService.setCurrentWorkspace(workspace);
      setCurrentWorkspaceState(workspace);
      onWorkspaceChange(workspace);
      loadWorkspaces();
      setShowJoinForm(false);
      setJoinKey('');
      setError('');
    } catch (err) {
      setError('Error al unirse al workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchWorkspace = (workspace: Workspace) => {
    hybridWorkspaceService.setCurrentWorkspace(workspace);
    setCurrentWorkspaceState(workspace);
    onWorkspaceChange(workspace);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este workspace? Se perderán todos los datos.')) {
      setLoading(true);
      try {
        await hybridWorkspaceService.removeWorkspace(workspaceId);
        loadWorkspaces();
        
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspaceState(null);
          const remaining = hybridWorkspaceService.getSavedWorkspaces();
          if (remaining.length > 0) {
            handleSwitchWorkspace(remaining[0]);
          }
        }
      } catch (err) {
        setError('Error al eliminar el workspace');
      } finally {
        setLoading(false);
      }
    }
  };

  const copyWorkspaceKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      alert('Clave copiada al portapapeles');
    });
  };

  return (
    <div className="workspace-manager">
      <div className="workspace-header">
        <h2>Gestión de Workspaces</h2>
        <div className="cloud-status">
          {FIREBASE_ENABLED ? (
            <span className={`cloud-indicator ${isCloudConnected ? 'connected' : 'disconnected'}`}>
              {isCloudConnected ? '☁️ Conectado' : '❌ Sin conexión'}
            </span>
          ) : (
            <span className="cloud-indicator disabled">
              📱 Solo local
            </span>
          )}
        </div>
        {currentWorkspace && (
          <div className="current-workspace">
            <span>Workspace actual: <strong>{currentWorkspace.name}</strong></span>
            <button 
              className="copy-key-btn"
              onClick={() => copyWorkspaceKey(currentWorkspace.key)}
              title="Copiar clave para compartir"
            >
              📋 {currentWorkspace.key}
            </button>
          </div>
        )}
      </div>

      <div className="workspace-actions">
        <button 
          className="create-workspace-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={loading}
        >
          {loading ? '⏳ Creando...' : '+ Crear Workspace'}
        </button>
        <button 
          className="join-workspace-btn"
          onClick={() => setShowJoinForm(!showJoinForm)}
          disabled={loading}
        >
          {loading ? '⏳ Buscando...' : '🔗 Unirse a Workspace'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {firebaseError && (
        <div className="error-message">
          <h4>🚨 Error de Firebase:</h4>
          <p>{firebaseError}</p>
          {firebaseError.includes('permisos') && (
            <details style={{marginTop: '10px'}}>
              <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>Ver solución</summary>
              <div style={{marginTop: '10px', fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px'}}>
                <p><strong>1. Ve a Firebase Console → Firestore Database → Reglas</strong></p>
                <p><strong>2. Reemplaza las reglas con:</strong></p>
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{document} {
      allow read, write: if true;
    }
  }
}`}</pre>
                <p><strong>3. Haz clic en "Publicar" y recarga la app</strong></p>
              </div>
            </details>
          )}
        </div>
      )}

      {!FIREBASE_ENABLED && (
        <div className="info-message">
          <h4>💡 Para colaboración en tiempo real:</h4>
          <p>Configure Firebase en <code>src/config/firebase-config.ts</code> para permitir que múltiples usuarios colaboren usando la misma clave de workspace.</p>
          <p>Actualmente solo funciona en modo local.</p>
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h3>Crear Nuevo Workspace</h3>
          <input
            type="text"
            placeholder="Nombre del workspace"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
          />
          <div className="form-actions">
            <button onClick={handleCreateWorkspace}>Crear</button>
            <button onClick={() => {setShowCreateForm(false); setError('');}}>Cancelar</button>
          </div>
        </div>
      )}

      {showJoinForm && (
        <div className="join-form">
          <h3>Unirse a Workspace</h3>
          <input
            type="text"
            placeholder="Clave del workspace (8 caracteres)"
            value={joinKey}
            onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinWorkspace()}
            maxLength={8}
          />
          <div className="form-actions">
            <button onClick={handleJoinWorkspace}>Unirse</button>
            <button onClick={() => {setShowJoinForm(false); setError('');}}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="workspace-list">
        <h3>Tus Workspaces</h3>
        {workspaces.length === 0 ? (
          <p>No tienes workspaces guardados. Crea uno nuevo o únete a uno existente.</p>
        ) : (
          <div className="workspaces">
            {workspaces.map((workspace) => (
              <div 
                key={workspace.id} 
                className={`workspace-item ${currentWorkspace?.id === workspace.id ? 'active' : ''}`}
              >
                <div className="workspace-info">
                  <h4>{workspace.name}</h4>
                  <p>Clave: {workspace.key}</p>
                  <small>Último acceso: {new Date(workspace.last_accessed).toLocaleDateString()}</small>
                </div>
                <div className="workspace-actions-item">
                  {currentWorkspace?.id !== workspace.id && (
                    <button onClick={() => handleSwitchWorkspace(workspace)}>
                      Cambiar
                    </button>
                  )}
                  <button onClick={() => copyWorkspaceKey(workspace.key)}>
                    Copiar Clave
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceManager;