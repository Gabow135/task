import { useState, useEffect } from 'react';
import { 
  Workspace, 
  createWorkspace, 
  getSavedWorkspaces, 
  getCurrentWorkspace, 
  setCurrentWorkspace, 
  findWorkspaceByKey,
  removeWorkspace,
  isValidWorkspaceKey 
} from '../utils/workspace';

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

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = () => {
    const savedWorkspaces = getSavedWorkspaces();
    const current = getCurrentWorkspace();
    setWorkspaces(savedWorkspaces);
    setCurrentWorkspaceState(current);
  };

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      setError('Por favor ingresa un nombre para el workspace');
      return;
    }

    try {
      const workspace = createWorkspace(newWorkspaceName.trim());
      setCurrentWorkspace(workspace);
      setCurrentWorkspaceState(workspace);
      onWorkspaceChange(workspace);
      loadWorkspaces();
      setShowCreateForm(false);
      setNewWorkspaceName('');
      setError('');
    } catch (err) {
      setError('Error al crear el workspace');
    }
  };

  const handleJoinWorkspace = () => {
    if (!joinKey.trim()) {
      setError('Por favor ingresa una clave de workspace');
      return;
    }

    if (!isValidWorkspaceKey(joinKey.trim())) {
      setError('La clave debe tener 8 caracteres alfanuméricos');
      return;
    }

    const workspace = findWorkspaceByKey(joinKey.trim());
    if (!workspace) {
      setError('No se encontró un workspace con esa clave');
      return;
    }

    setCurrentWorkspace(workspace);
    setCurrentWorkspaceState(workspace);
    onWorkspaceChange(workspace);
    loadWorkspaces();
    setShowJoinForm(false);
    setJoinKey('');
    setError('');
  };

  const handleSwitchWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentWorkspaceState(workspace);
    onWorkspaceChange(workspace);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este workspace? Se perderán todos los datos.')) {
      removeWorkspace(workspaceId);
      loadWorkspaces();
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspaceState(null);
        const remaining = getSavedWorkspaces();
        if (remaining.length > 0) {
          handleSwitchWorkspace(remaining[0]);
        }
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
        >
          + Crear Workspace
        </button>
        <button 
          className="join-workspace-btn"
          onClick={() => setShowJoinForm(!showJoinForm)}
        >
          🔗 Unirse a Workspace
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-form">
          <h3>Crear Nuevo Workspace</h3>
          <input
            type="text"
            placeholder="Nombre del workspace"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkspace()}
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
            onKeyPress={(e) => e.key === 'Enter' && handleJoinWorkspace()}
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