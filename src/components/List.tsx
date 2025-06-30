import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { List as ListType, Card as CardType } from '../database/database';
import CardComponent from './Card';

interface ListProps {
  list: ListType;
  cards: CardType[];
  onUpdateList: (listId: number, name: string) => Promise<void>;
  onDeleteList: (listId: number) => Promise<void>;
  onAddCard: (listId: number, title: string, description?: string) => Promise<void>;
  onUpdateCard: (cardId: number, title: string, description?: string, image?: string) => Promise<void>;
  onDeleteCard: (cardId: number) => Promise<void>;
}

const List: React.FC<ListProps> = ({
  list,
  cards,
  onUpdateList,
  onDeleteList,
  onAddCard,
  onUpdateCard,
  onDeleteCard
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list?.name || '');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Early return if list is not properly defined
  if (!list || typeof list.id === 'undefined') {
    return <div className="list-error">Error: Lista no válida</div>;
  }

  const handleTitleSubmit = async () => {
    if (editTitle.trim() && editTitle !== list.name) {
      await onUpdateList(list.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await onAddCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la lista "${list.name}"?`)) {
      await onDeleteList(list.id);
    }
  };

  return (
    <div className="list">
      <div className="list-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="list-title-input"
          />
        ) : (
          <h3 
            className="list-title" 
            onClick={() => setIsEditingTitle(true)}
          >
            {list.name}
          </h3>
        )}
        <button 
          className="delete-list-button" 
          onClick={handleDeleteList}
          title="Eliminar lista"
        >
          ×
        </button>
      </div>

      <Droppable droppableId={list.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`cards-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {cards && cards.map((card, index) => (
              card && typeof card.id !== 'undefined' ? (
                <CardComponent
                  key={card.id}
                  card={card}
                  index={index}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                />
              ) : null
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="add-card-container">
        {isAddingCard ? (
          <div className="add-card-form">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Introduce un título para esta tarjeta..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddCard()}
              autoFocus
            />
            <div className="add-card-buttons">
              <button onClick={handleAddCard}>Añadir tarjeta</button>
              <button onClick={() => setIsAddingCard(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button 
            className="add-card-button" 
            onClick={() => setIsAddingCard(true)}
          >
            + Añadir una tarjeta
          </button>
        )}
      </div>
    </div>
  );
};

export default List;