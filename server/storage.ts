import { db } from "./db.js";

export interface IStorage {
}

export class DatabaseStorage implements IStorage {
}

export const storage = new DatabaseStorage();
