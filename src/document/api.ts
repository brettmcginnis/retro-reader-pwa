import { db } from "./db";
import { liveQuery } from "dexie";

export async function add(title: string, content: string[]): Promise<number | null> {
  try {
    return await db.documents.add({ title, content });
  } catch (error) {
    console.debug({ error })
    return null
  }
}

export const all = liveQuery(async () => await db.documents.toArray());

