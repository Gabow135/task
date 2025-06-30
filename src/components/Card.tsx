import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType } from '../database/database';
import ImageUpload from './ImageUpload';

interface CardProps {
  card: CardType;
  index: number;
  onUpdateCard: (cardId: number, title: string, description?: string, image?: string) => Promise<void>;
  onDeleteCard: (cardId: number) => Promise<void>;
}

const Card: React.FC<CardProps> = ({ card, index, onUpdateCard, onDeleteCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card?.title || '');
  const [editDescription, setEditDescription] = useState(card?.description || '');
  const [editImage, setEditImage] = useState(card?.image || '');

  // Early validation after hooks
  if (!card || typeof card.id === 'undefined' || typeof card.list_id === 'undefined') {
    return <div className="card-error">Error: Tarjeta no válida</div>;
  }

  const handleSubmit = async () => {
    if (editTitle.trim()) {
      await onUpdateCard(card.id, editTitle.trim(), editDescription.trim(), editImage);
      setIsEditing(false);
    } else {
      alert('El título de la tarjeta no puede estar vacío');
    }
  };

  const handleCancel = () => {
    setEditTitle(card?.title || '');
    setEditDescription(card?.description || '');
    setEditImage(card?.image || '');
    setIsEditing(false);
  };

  const handleImageSelect = (imageData: string) => {
    setEditImage(imageData);
  };

  const handleImageRemove = () => {
    setEditImage('');
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarjeta "${card.title}"?`)) {
      await onDeleteCard(card.id);
    }
  };

  if (isEditing) {
    return (
      <div className="card editing">
        <div className="card-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título de la tarjeta"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={3}
            onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleSubmit()}
          />
          <ImageUpload
            currentImage={editImage}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />
          <div className="card-edit-buttons">
            <button onClick={handleSubmit}>Guardar</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="card-content" onClick={() => setIsEditing(true)}>
            {card.image && (
              <div className="card-image-container">
                <img src={card.image} alt="Card attachment" className="card-image" />
              </div>
            )}
            <h4 className="card-title">{card.title}</h4>
            {card.description && (
              <p className="card-description">{card.description}</p>
            )}
          </div>
          <button 
            className="delete-card-button" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Eliminar tarjeta"
          >
            ×
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Card;