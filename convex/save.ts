import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const protoDef = mutation({
  args: {
    protoDef: v.string(),
    fqPath: v.string(),
    unserialized: v.string(),
    serialized: v.union(v.string(), v.null()),
  },
  handler: async (
    { db },
    { protoDef, fqPath, unserialized, serialized }
  ): Promise<void> => {
    const latest = await db.query('protoDefs').order('desc').first()
    const proposed = { protoDef, fqPath, unserialized, serialized }
    if (latest !== proposed) {
      await db.insert('protoDefs', proposed)
    }
  },
})

