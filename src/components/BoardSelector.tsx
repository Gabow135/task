import React, { useState } from 'react';
import { Board as BoardType } from '../database/database';

interface BoardSelectorProps {
  boards: BoardType[];
  onSelectBoard: (board: BoardType) => void;
  onCreateBoard: (name: string) => Promise<void>;
  onDeleteBoard: (boardId: number) => void;
  onEditBoard: (boardId: number, name: string) => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onEditBoard
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editBoardName, setEditBoardName] = useState('');

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      await onCreateBoard(newBoardName.trim());
      setNewBoardName('');
      setIsCreating(false);
    }
  };

  const handleEditBoard = (board: BoardType) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const handleSaveEdit = () => {
    if (editingBoardId && editBoardName.trim()) {
      onEditBoard(editingBoardId, editBoardName.trim());
      setEditingBoardId(null);
      setEditBoardName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditBoardName('');
  };

  const handleDeleteBoard = (board: BoardType) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tablero "${board.name}"?`)) {
      onDeleteBoard(board.id);
    }
  };

  return (
    <div className="board-selector">
      <div className="board-selector-header">
        <h1>Mis Tableros</h1>
        <button 
          className="create-board-btn"
          onClick={() => setIsCreating(true)}
        >
          + Crear nuevo tablero
        </button>
      </div>

      {isCreating && (
        <div className="create-board-form">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Nombre del tablero"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
            autoFocus
          />
          <div className="create-board-buttons">
            <button onClick={handleCreateBoard}>Crear tablero</button>
            <button onClick={() => setIsCreating(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="boards-grid">
        {boards.map(board => (
          <div key={board.id} className="board-card">
            {editingBoardId === board.id ? (
              <div className="board-edit-form">
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  autoFocus
                />
                <div className="board-edit-buttons">
                  <button onClick={handleSaveEdit}>Guardar</button>
                  <button onClick={handleCancelEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="board-card-content" onClick={() => onSelectBoard(board)}>
                  <h3>{board.name}</h3>
                  <p>Creado: {new Date(board.created_at).toLocaleDateString()}</p>
                </div>
                <div className="board-card-actions">
                  <button 
                    className="edit-board-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBoard(board);
                    }}
                    title="Editar tablero"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-board-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(board);
                    }}
                    title="Eliminar tablero"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {boards.length === 0 && !isCreating && (
        <div className="no-boards-message">
          <p>No tienes tableros creados aún.</p>
          <p>¡Crea tu primer tablero para comenzar!</p>
        </div>
      )}
    </div>
  );
};

export default BoardSelector;