import { query } from './_generated/server'
import { Document } from './_generated/dataModel'

export const protoDef = query(async ({ db }): Promise<Document<"protoDefs"> | null> => {
  return await db.query("protoDefs").order("desc").first();
})