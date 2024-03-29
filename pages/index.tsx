import { FormEvent, useEffect, useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

export default function App() {
  const [protoText, setProtoText] = useState<string | undefined>(undefined)
  const [unserializedText, setUnserializedText] = useState<string | undefined>(
    undefined
  )
  const [serializedText, setSerializedText] = useState<string | undefined>(
    undefined
  )
  const [fqPath, setFqPath] = useState<string | undefined>(undefined)
  const [resultText, setResultText] = useState<string | undefined>(undefined)
  const serializeProto = useAction(api.sendProto.serialize)
  const deserializeProto = useAction(api.sendProto.deserialize)
  const serverProtoDef = useQuery(api.latest.protoDef)

  useEffect(() => {
    if (serverProtoDef) {
      if (protoText === undefined) {
        setProtoText(serverProtoDef!.protoDef)
      }
      if (fqPath === undefined) {
        setFqPath(serverProtoDef!.fqPath)
      }
      if (unserializedText === undefined) {
        setUnserializedText(serverProtoDef!.unserialized)
      }
      if (serializedText === undefined) {
        setSerializedText(serverProtoDef!.serialized || undefined)
      }
    }
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setResultText('Processing...')
    try {
      if (
        unserializedText === serverProtoDef?.unserialized &&
        serializedText &&
        serializedText !== serverProtoDef?.serialized
      ) {
        const err = await deserializeProto({
          protoContents: protoText!,
          fqPath: fqPath || '',
          serialized: serializedText || '',
        })
        setResultText(err)
        setUnserializedText(undefined)
      } else {
        const err = await serializeProto({
          protoContents: protoText!,
          fqPath: fqPath || '',
          unserialized: unserializedText || serverProtoDef?.unserialized || '',
        })
        setResultText(err)
        setSerializedText(undefined)
      }
    } catch (e) {
      setResultText(`Failed: ${(e as Error).toString().split('\n')[0]}`)
    }
  }

  return (
    <main>
      <h1>Protobuf Playground</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <span style={{ alignSelf: 'center' }}>input.proto</span>
            <textarea
              style={{ height: '200px', width: '800px' }}
              value={protoText || ''}
              onChange={(event) => setProtoText(event.target.value)}
              placeholder={
                serverProtoDef === undefined
                  ? 'Loading...'
                  : '.proto file contents…'
              }
            />
            <span style={{ alignSelf: 'center' }}>
              Fully Qualified path to Message
            </span>
            <input
              value={fqPath || ''}
              onChange={(event) => setFqPath(event.target.value)}
              placeholder={
                serverProtoDef === undefined ? 'Loading...' : 'FQ Path…'
              }
            />
            <span style={{ alignSelf: 'center' }}>Unserialized (as JSON)</span>
            <textarea
              style={{ height: '200px', width: '800px' }}
              value={unserializedText || ''}
              onChange={(event) => setUnserializedText(event.target.value)}
              placeholder={
                serverProtoDef === undefined
                  ? 'Loading...'
                  : 'Unserialized representation…'
              }
            />
            <span style={{ alignSelf: 'center' }}>Serialized</span>
            <textarea
              style={{ height: '200px', width: '800px' }}
              value={serializedText || ''}
              onChange={(event) => setSerializedText(event.target.value)}
              placeholder={
                serverProtoDef === undefined
                  ? 'Loading...'
                  : 'Serialized representation…'
              }
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ alignSelf: 'center' }}>Result</span>
            <span>{resultText}</span>
          </div>
        </div>
        <input type="submit" value="Send" disabled={!protoText} />
      </form>
    </main>
  )
}
