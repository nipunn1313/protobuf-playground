import { query } from './_generated/server'
import { Doc } from './_generated/dataModel'

export const protoDef = query(
  async ({ db }): Promise<Doc<'protoDefs'> | null> => {
    return await db.query('protoDefs').order('desc').first()
  }
)

