import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  protoDefs: defineTable({
    protoDef: v.string(),
    fqPath: v.string(),
    unserialized: v.string(),
    serialized: v.union(v.string(), v.null()),
  }),
})
