// Workspace utilities for user isolation

export interface Workspace {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_accessed: string;
}

// Generate a unique workspace key
export const generateWorkspaceKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate a unique workspace ID
export const generateWorkspaceId = (): string => {
  return 'ws_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate workspace key format
export const isValidWorkspaceKey = (key: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(key);
};

// Get current workspace from localStorage
export const getCurrentWorkspace = (): Workspace | null => {
  const workspace = localStorage.getItem('current-workspace');
  if (workspace) {
    try {
      return JSON.parse(workspace);
    } catch {
      return null;
    }
  }
  return null;
};

// Set current workspace in localStorage
export const setCurrentWorkspace = (workspace: Workspace): void => {
  const updatedWorkspace = {
    ...workspace,
    last_accessed: new Date().toISOString()
  };
  localStorage.setItem('current-workspace', JSON.stringify(updatedWorkspace));
};

// Get all saved workspaces
export const getSavedWorkspaces = (): Workspace[] => {
  const workspaces = localStorage.getItem('saved-workspaces');
  if (workspaces) {
    try {
      return JSON.parse(workspaces);
    } catch {
      return [];
    }
  }
  return [];
};

// Save workspace to the list
export const saveWorkspace = (workspace: Workspace): void => {
  const workspaces = getSavedWorkspaces();
  const existingIndex = workspaces.findIndex(w => w.id === workspace.id);
  
  if (existingIndex >= 0) {
    workspaces[existingIndex] = workspace;
  } else {
    workspaces.push(workspace);
  }
  
  localStorage.setItem('saved-workspaces', JSON.stringify(workspaces));
};

// Remove workspace from saved list
export const removeWorkspace = (workspaceId: string): void => {
  const workspaces = getSavedWorkspaces();
  const filtered = workspaces.filter(w => w.id !== workspaceId);
  localStorage.setItem('saved-workspaces', JSON.stringify(filtered));
  
  // Clear workspace data
  localStorage.removeItem(`trello-db-${workspaceId}`);
};

// Create a new workspace
export const createWorkspace = (name: string, customKey?: string): Workspace => {
  const workspace: Workspace = {
    id: generateWorkspaceId(),
    name: name.trim(),
    key: customKey || generateWorkspaceKey(),
    created_at: new Date().toISOString(),
    last_accessed: new Date().toISOString()
  };
  
  saveWorkspace(workspace);
  return workspace;
};

// Find workspace by key
export const findWorkspaceByKey = (key: string): Workspace | null => {
  const workspaces = getSavedWorkspaces();
  return workspaces.find(w => w.key.toLowerCase() === key.toLowerCase()) || null;
};

// Get database key for workspace isolation
export const getWorkspaceDbKey = (workspaceId: string): string => {
  return `trello-db-${workspaceId}`;
};