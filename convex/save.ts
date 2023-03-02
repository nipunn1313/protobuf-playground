import { mutation } from './_generated/server'
import { Document } from './_generated/dataModel'

export const protoDef = mutation(async ({ db }, protoDef: string, fqPath: string, unserialized: string, serialized: string | null): Promise<void> => {
  const latest = await db.query("protoDefs").order("desc").first();
  const proposed = { protoDef, fqPath, unserialized, serialized };
  if (latest !== proposed) {
    await db.insert("protoDefs", proposed);
  }
})