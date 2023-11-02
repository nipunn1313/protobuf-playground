'use node'
import { action } from './_generated/server'
import { api } from './_generated/api'
import { writeFile } from 'node:fs/promises'
import protobuf from 'protobufjs'
import { temporaryFile } from 'tempy'
import camelcaseKeys from 'camelcase-keys'
import { v } from 'convex/values'

const getMessageDef = async (
  protoContents: string,
  fqPath: string
): Promise<string | protobuf.Type> => {
  const t = temporaryFile({ name: 'input.proto' })
  await writeFile(t, protoContents)

  let loaded
  try {
    loaded = await protobuf.load(t)
  } catch (eUntyped) {
    const e = eUntyped as Error
    return e.message.replace(t, 'input.proto')
  }

  if (!fqPath) {
    return 'input.proto compiled'
  }

  let messageDef
  try {
    messageDef = loaded.lookupType(fqPath)
  } catch (e) {
    return `input.proto compiled. ${fqPath} not found in definition.`
  }

  return messageDef
}

export const serialize = action({
  args: {
    protoContents: v.string(),
    fqPath: v.string(),
    unserialized: v.string(),
  },
  handler: async (
    { runMutation },
    { protoContents, fqPath, unserialized }
  ): Promise<string> => {
    console.log('Serializing', unserialized)
    await runMutation(api.save.protoDef, {
      protoDef: protoContents,
      fqPath,
      unserialized,
      serialized: null,
    })
    const messageDef = await getMessageDef(protoContents, fqPath)
    if (typeof messageDef === 'string') {
      return messageDef
    }

    let unserializedParsed
    try {
      unserializedParsed = camelcaseKeys(JSON.parse(unserialized))
    } catch (e) {
      return `Invalid JSON: ${e}`
    }

    const message = messageDef.create(unserializedParsed)
    const encoded = messageDef.encode(message).finish()

    const hex = [...encoded]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ')
    console.log(`buffer = ${hex}`)

    await runMutation(api.save.protoDef, {
      protoDef: protoContents,
      fqPath,
      unserialized,
      serialized: hex,
    })
    return 'Successfully serialized'
  },
})

export const deserialize = action({
  args: {
    protoContents: v.string(),
    fqPath: v.string(),
    serialized: v.string(),
  },
  handler: async (
    { runMutation },
    { protoContents, fqPath, serialized }
  ): Promise<string> => {
    console.log('Deserializing')
    const messageDef = await getMessageDef(protoContents, fqPath)
    if (typeof messageDef === 'string') {
      return messageDef
    }
    const bytesarray = new Uint8Array(
      serialized.split(' ').map((hex) => parseInt(hex, 16))
    )
    console.log(bytesarray)
    const decoded = messageDef.decode(bytesarray)
    const unserialized = JSON.stringify(decoded)
    console.log(unserialized)
    await runMutation(api.save.protoDef, {
      protoDef: protoContents,
      fqPath,
      unserialized,
      serialized,
    })
    return 'Successfully deserialized'
  },
})

