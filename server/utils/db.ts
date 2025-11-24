import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

// Use absolute path - works in Docker and local
const dbPath = process.env.DB_PATH || resolve(process.cwd(), 'data/database/contacts.sqlite');

// Ensure directory exists
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Initialize table with security features
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for duplicate detection queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_email_created 
  ON contacts(email, created_at)
`);

export const useDb = () => db;
