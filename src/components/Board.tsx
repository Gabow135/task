import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { database, Board as BoardType, List as ListType, Card as CardType } from '../database/database';
import ListComponent from './List';

interface BoardProps {
  board: BoardType;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [cards, setCards] = useState<{ [listId: number]: CardType[] }>({});
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  useEffect(() => {
    loadLists();
  }, [board.id]);

  const loadLists = async () => {
    const boardLists = database.getListsByBoard(board.id);
    setLists(boardLists);
    
    const allCards: { [listId: number]: CardType[] } = {};
    boardLists.forEach(list => {
      allCards[list.id] = database.getCardsByList(list.id);
    });
    setCards(allCards);
  };

  const addList = async () => {
    if (newListName.trim()) {
      database.createList(board.id, newListName.trim(), lists.length);
      setNewListName('');
      setIsAddingList(false);
      await loadLists(); // Reload from database
    }
  };

  const updateList = async (listId: number, name: string) => {
    database.updateList(listId, name);
    await loadLists(); // Reload from database
  };

  const deleteList = async (listId: number) => {
    database.deleteList(listId);
    await loadLists(); // Reload from database
  };

  const addCard = async (listId: number, title: string, description: string = '') => {
    const listCards = cards[listId] || [];
    database.createCard(listId, title, description, listCards.length, '');
    await loadLists(); // Reload from database
  };

  const updateCard = async (cardId: number, title: string, description: string = '', image: string = '') => {
    database.updateCard(cardId, title, description, image);
    await loadLists(); // Reload from database
  };

  const deleteCard = async (cardId: number) => {
    database.deleteCard(cardId);
    await loadLists(); // Reload from database
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceListId = parseInt(source.droppableId);
    const destListId = parseInt(destination.droppableId);
    const cardId = parseInt(draggableId);

    const sourceCards = Array.from(cards[sourceListId]);
    const destCards = sourceListId === destListId ? sourceCards : Array.from(cards[destListId]);

    const [movedCard] = sourceCards.splice(source.index, 1);
    destCards.splice(destination.index, 0, movedCard);

    database.updateCardPosition(cardId, destListId, destination.index);

    if (sourceListId === destListId) {
      setCards({
        ...cards,
        [sourceListId]: destCards
      });
    } else {
      setCards({
        ...cards,
        [sourceListId]: sourceCards,
        [destListId]: destCards
      });
    }

    // Update positions in database
    destCards.forEach((card, index) => {
      if (card.position !== index) {
        database.updateCardPosition(card.id, destListId, index);
      }
    });

    if (sourceListId !== destListId) {
      sourceCards.forEach((card, index) => {
        if (card.position !== index) {
          database.updateCardPosition(card.id, sourceListId, index);
        }
      });
    }
  };

  return (
    <div className="board">
      <h1 className="board-title">{board.name}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="lists-container">
          {lists.map(list => (
            <ListComponent
              key={list.id}
              list={list}
              cards={cards[list.id] || []}
              onUpdateList={updateList}
              onDeleteList={deleteList}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          ))}
          
          <div className="add-list-container">
            {isAddingList ? (
              <div className="add-list-form">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nombre de la lista"
                  onKeyDown={(e) => e.key === 'Enter' && addList()}
                  autoFocus
                />
                <div className="add-list-buttons">
                  <button onClick={addList}>Agregar lista</button>
                  <button onClick={() => setIsAddingList(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="add-list-button" onClick={() => setIsAddingList(true)}>
                + Agregar otra lista
              </button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;