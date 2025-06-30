import { useState, useEffect } from 'react';
import './App.css';
import { database, Board as BoardType } from './database/database';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';
import WorkspaceManager from './components/WorkspaceManager';
import { Workspace } from './utils/workspace';
import { hybridWorkspaceService } from './utils/hybridWorkspace';

type AppView = 'workspace' | 'boards' | 'board';

function App() {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [currentBoard, setCurrentBoard] = useState<BoardType | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('workspace');
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if we have a current workspace
      let workspace = hybridWorkspaceService.getCurrentWorkspace();
      
      // If no workspace exists, create a default one
      if (!workspace) {
        workspace = await hybridWorkspaceService.createWorkspace('Mi Workspace');
        hybridWorkspaceService.setCurrentWorkspace(workspace);
      }
      
      setCurrentWorkspaceState(workspace);
      
      // Initialize database with the current workspace
      await database.init(workspace.id);
      const allBoards = database.getBoards();
      setBoards(allBoards);
      setCurrentView('boards');
    } catch (error) {
      console.error('Error initializing database:', error);
      // If there's an error, it might be due to schema changes
      if (error instanceof Error && error.message && error.message.includes('no such column')) {
        console.log('Schema error detected, resetting database...');
        database.resetDatabase();
        const allBoards = database.getBoards();
        setBoards(allBoards);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoard = (board: BoardType) => {
    setCurrentBoard(board);
    setCurrentView('board');
  };

  const handleCreateBoard = async (name: string) => {
    try {
      const newBoard = database.createBoard(name);
      const updatedBoards = database.getBoards();
      setBoards(updatedBoards);
      setCurrentBoard(newBoard);
      setCurrentView('board');
    } catch (error) {
      console.error('Error creating board:', error);
      // Re-initialize database if needed
      await database.init();
    }
  };

  const handleDeleteBoard = (boardId: number) => {
    database.deleteBoard(boardId);
    const updatedBoards = database.getBoards();
    setBoards(updatedBoards);
    
    if (currentBoard && currentBoard.id === boardId) {
      setCurrentBoard(null);
      setCurrentView('boards');
    }
  };

  const handleEditBoard = (boardId: number, name: string) => {
    database.updateBoard(boardId, name);
    const updatedBoards = database.getBoards();
    setBoards(updatedBoards);
    
    if (currentBoard && currentBoard.id === boardId) {
      setCurrentBoard({ ...currentBoard, name });
    }
  };

  const handleBackToBoards = () => {
    setCurrentView('boards');
    setCurrentBoard(null);
  };

  const handleWorkspaceChange = async (workspace: Workspace) => {
    try {
      setLoading(true);
      setCurrentWorkspaceState(workspace);
      hybridWorkspaceService.setCurrentWorkspace(workspace);
      
      // Switch database to new workspace
      await database.switchWorkspace(workspace.id);
      const allBoards = database.getBoards();
      setBoards(allBoards);
      
      // Sync workspace data to cloud if available
      try {
        const databaseData = hybridWorkspaceService.getWorkspaceDatabaseData(workspace.id);
        await hybridWorkspaceService.syncWorkspaceToCloud(workspace, databaseData);
      } catch (syncError) {
        console.warn('Failed to sync workspace to cloud:', syncError);
      }
      
      setCurrentView('boards');
      setCurrentBoard(null);
    } catch (error) {
      console.error('Error switching workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowWorkspaceManager = () => {
    setCurrentView('workspace');
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (currentView === 'workspace') {
    return (
      <div className="App">
        <WorkspaceManager onWorkspaceChange={handleWorkspaceChange} />
      </div>
    );
  }

  if (currentView === 'boards') {
    return (
      <div className="App">
        <div className="workspace-header">
          <div className="workspace-info">
            <span>Workspace: <strong>{currentWorkspace?.name}</strong></span>
            <span className="workspace-key">Clave: {currentWorkspace?.key}</span>
          </div>
          <button className="workspace-manager-btn" onClick={handleShowWorkspaceManager}>
            ⚙️ Gestionar Workspaces
          </button>
        </div>
        <BoardSelector
          boards={boards}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onEditBoard={handleEditBoard}
        />
      </div>
    );
  }

  if (currentView === 'board' && currentBoard) {
    return (
      <div className="App">
        <div className="board-header">
          <button className="back-to-boards-btn" onClick={handleBackToBoards}>
            ← Volver a tableros
          </button>
          <div className="workspace-info">
            <span>Workspace: <strong>{currentWorkspace?.name}</strong></span>
            <button className="workspace-manager-btn" onClick={handleShowWorkspaceManager}>
              ⚙️ Workspaces
            </button>
          </div>
        </div>
        <Board board={currentBoard} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="no-boards">Error: Estado inválido</div>
    </div>
  );
}

export default App;
