import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  protoDefs: defineTable({
    protoDef: s.string(),
    fqPath: s.string(),
    unserialized: s.string(),
    serialized: s.union(s.string(), s.null()),
  }),
})
