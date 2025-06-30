import initSqlJs from 'sql.js';
import { getCurrentWorkspace, getWorkspaceDbKey } from '../utils/workspace';

export interface Board {
  id: number;
  name: string;
  created_at: string;
}

export interface List {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: number;
  list_id: number;
  title: string;
  description?: string;
  image?: string; // Base64 encoded image or blob URL
  position: number;
  created_at: string;
}

class Database {
  private db: any = null;
  private currentWorkspaceId: string | null = null;

  async init(workspaceId?: string) {
    // Initialize SQL.js with correct path for task subdirectory
    const SQL = await initSqlJs({
      locateFile: (file) => {
        console.log('SQL.js requesting file:', file);
        
        // Build the correct path considering the /task subdirectory
        const basePath = process.env.PUBLIC_URL || '';
        const fullPath = `${basePath}/${file}`;
        
        console.log('Serving from:', fullPath);
        console.log('Current location:', window.location.href);
        
        return fullPath;
      }
    });

    // Set current workspace
    if (workspaceId) {
      this.currentWorkspaceId = workspaceId;
    } else {
      const currentWorkspace = getCurrentWorkspace();
      this.currentWorkspaceId = currentWorkspace?.id || null;
    }

    // Check if we have saved data in localStorage for this workspace
    const dbKey = this.currentWorkspaceId ? getWorkspaceDbKey(this.currentWorkspaceId) : 'trello-db';
    const savedData = localStorage.getItem(dbKey);
    if (savedData) {
      const binaryArray = new Uint8Array(JSON.parse(savedData));
      this.db = new SQL.Database(binaryArray);
      this.runMigrations(); // Run migrations on existing database
    } else {
      this.db = new SQL.Database();
      this.createTables();
    }
  }

  private createTables() {
    const createBoardsTable = `
      CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createListsTable = `
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
      );
    `;

    const createCardsTable = `
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image TEXT,
        position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
      );
    `;

    this.db.run(createBoardsTable);
    this.db.run(createListsTable);
    this.db.run(createCardsTable);

    // Insert a default board
    this.db.run("INSERT INTO boards (name) VALUES ('Mi Tablero')", []);
    
    this.saveToLocalStorage();
  }

  private runMigrations() {
    try {
      // Check current table structure
      const result = this.db.exec("PRAGMA table_info(cards)");
      if (result.length > 0) {
        const columns = result[0].values;
        const hasImageColumn = columns.some((row: any[]) => row[1] === 'image');
        
        if (!hasImageColumn) {
          // Migration 1: Add image column to cards table
          this.db.run("ALTER TABLE cards ADD COLUMN image TEXT DEFAULT ''");
          console.log('Migration: Added image column to cards table');
          this.saveToLocalStorage();
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
      // For now, let users know they need to refresh to reset the database
      alert('Se necesita actualizar la base de datos. Recarga la página para continuar.');
    }
  }

  // Method to reset database (for development/troubleshooting)
  resetDatabase(): void {
    const dbKey = this.currentWorkspaceId ? getWorkspaceDbKey(this.currentWorkspaceId) : 'trello-db';
    localStorage.removeItem(dbKey);
    this.db = new (this.db.constructor)();
    this.createTables();
    console.log('Database reset successfully');
  }

  private saveToLocalStorage() {
    if (!this.db) {
      console.warn('Cannot save to localStorage: database not initialized');
      return;
    }
    const data = this.db.export();
    const buffer = new Uint8Array(data);
    const dbKey = this.currentWorkspaceId ? getWorkspaceDbKey(this.currentWorkspaceId) : 'trello-db';
    localStorage.setItem(dbKey, JSON.stringify(Array.from(buffer)));
  }

  // Switch to a different workspace
  async switchWorkspace(workspaceId: string) {
    await this.init(workspaceId);
  }

  // Board operations
  createBoard(name: string): Board {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    if (!name || name.trim() === '') {
      throw new Error('Board name cannot be empty');
    }
    const stmt = this.db.prepare("INSERT INTO boards (name) VALUES (?)");
    const result = stmt.run([name.trim()]);
    stmt.free();
    this.saveToLocalStorage();
    
    return {
      id: result.lastInsertId,
      name: name.trim(),
      created_at: new Date().toISOString()
    };
  }

  getBoards(): Board[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const results = this.db.exec("SELECT * FROM boards ORDER BY created_at DESC");
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    const values = results[0].values;
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj as Board;
    });
  }

  updateBoard(id: number, name: string): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    if (!name || name.trim() === '') {
      throw new Error('Board name cannot be empty');
    }
    if (typeof id !== 'number') {
      throw new Error('Board id must be a number');
    }
    const stmt = this.db.prepare("UPDATE boards SET name = ? WHERE id = ?");
    stmt.run([name.trim(), id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  deleteBoard(id: number): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    if (typeof id !== 'number') {
      throw new Error('Board id must be a number');
    }
    const stmt = this.db.prepare("DELETE FROM boards WHERE id = ?");
    stmt.run([id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  // List operations
  createList(boardId: number, name: string, position: number): List {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    if (!name || name.trim() === '') {
      throw new Error('List name cannot be empty');
    }
    if (typeof boardId !== 'number' || typeof position !== 'number') {
      throw new Error('BoardId and position must be numbers');
    }
    const stmt = this.db.prepare("INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)");
    const result = stmt.run([boardId, name.trim(), position]);
    stmt.free();
    this.saveToLocalStorage();
    
    return {
      id: result.lastInsertId,
      board_id: boardId,
      name: name.trim(),
      position,
      created_at: new Date().toISOString()
    };
  }

  getListsByBoard(boardId: number): List[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const results = this.db.exec("SELECT * FROM lists WHERE board_id = ? ORDER BY position", [boardId]);
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    const values = results[0].values;
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj as List;
    });
  }

  updateList(id: number, name: string): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare("UPDATE lists SET name = ? WHERE id = ?");
    stmt.run([name, id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  updateListPosition(id: number, position: number): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare("UPDATE lists SET position = ? WHERE id = ?");
    stmt.run([position, id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  deleteList(id: number): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare("DELETE FROM lists WHERE id = ?");
    stmt.run([id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  // Card operations
  createCard(listId: number, title: string, description: string = '', position: number, image: string = ''): Card {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    if (!title || title.trim() === '') {
      throw new Error('Card title cannot be empty');
    }
    if (typeof listId !== 'number' || typeof position !== 'number') {
      throw new Error('ListId and position must be numbers');
    }
    const safeDescription = description || '';
    const safeImage = image || '';
    const stmt = this.db.prepare("INSERT INTO cards (list_id, title, description, image, position) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run([listId, title.trim(), safeDescription, safeImage, position]);
    stmt.free();
    this.saveToLocalStorage();
    
    return {
      id: result.lastInsertId,
      list_id: listId,
      title: title.trim(),
      description: safeDescription,
      image: safeImage,
      position,
      created_at: new Date().toISOString()
    };
  }

  getCardsByList(listId: number): Card[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const results = this.db.exec("SELECT * FROM cards WHERE list_id = ? ORDER BY position", [listId]);
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    const values = results[0].values;
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj as Card;
    });
  }

  updateCard(id: number, title: string, description: string = '', image: string = ''): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const safeDescription = description || '';
    const safeImage = image || '';
    const stmt = this.db.prepare("UPDATE cards SET title = ?, description = ?, image = ? WHERE id = ?");
    stmt.run([title, safeDescription, safeImage, id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  updateCardPosition(id: number, listId: number, position: number): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare("UPDATE cards SET list_id = ?, position = ? WHERE id = ?");
    stmt.run([listId, position, id]);
    stmt.free();
    this.saveToLocalStorage();
  }

  deleteCard(id: number): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare("DELETE FROM cards WHERE id = ?");
    stmt.run([id]);
    stmt.free();
    this.saveToLocalStorage();
  }
}

export const database = new Database();