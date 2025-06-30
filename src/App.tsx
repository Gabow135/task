import { useState, useEffect } from 'react';
import './App.css';
import { database, Board as BoardType } from './database/database';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';

type AppView = 'boards' | 'board';

function App() {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [currentBoard, setCurrentBoard] = useState<BoardType | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('boards');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await database.init();
      const allBoards = database.getBoards();
      setBoards(allBoards);
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

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (currentView === 'boards') {
    return (
      <div className="App">
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
