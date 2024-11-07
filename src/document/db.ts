import Dexie, { type EntityTable } from 'dexie';
import { Document } from './types.ts'

const tableName = 'Documents'

type DocumentTable = { documents: EntityTable<Document, 'id'>; };

const db = new Dexie(tableName) as Dexie & DocumentTable;

db.version(1).stores({
  documents: '++id, title, *content'
});

export { db };