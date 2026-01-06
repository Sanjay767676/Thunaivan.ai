// server/storage.ts
import { db } from "./db";

export interface IStorage {
  // Add any DB methods here if needed in future
}

export class DatabaseStorage implements IStorage {
  // Implement methods
}

export const storage = new DatabaseStorage();
