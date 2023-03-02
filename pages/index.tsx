import { FormEvent, useEffect, useState } from 'react'
import { useAction, useQuery } from '../convex/_generated/react'

export default function App() {
  const [protoText, setProtoText] = useState<string | undefined>(undefined)
  const [unserializedText, setUnserializedText] = useState<string | undefined>(undefined)
  const [serializedText, setSerializedText] = useState<string | undefined>(undefined)
  const [fqPath, setFqPath] = useState<string | undefined>(undefined)
  const [resultText, setResultText] = useState<string | undefined>(undefined)
  const sendProto = useAction('actions/sendProto:serialize')
  const serverProtoDef = useQuery('latest:protoDef')
  
  useEffect(() => {
    if (protoText === undefined && serverProtoDef) {
      setProtoText(serverProtoDef!.protoDef);
      setFqPath(serverProtoDef!.fqPath);
      setUnserializedText(serverProtoDef!.unserialized);
      sendProto(serverProtoDef!.protoDef, serverProtoDef!.fqPath, serverProtoDef.unserialized).then(setResultText);
    }
  })

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault()
    const err = await sendProto(protoText!, fqPath || "", unserializedText || "");
    setResultText(err);
    setSerializedText(undefined);
  }

  return (
    <main>
      <h1>Protobuf Playground</h1>
      <form onSubmit={handleSendMessage}>
        <div style={{display:"flex"}}>
          <div style={{display:"flex", flexDirection:"column", justifyContent:"flex-start"}}>
            <span style={{alignSelf:"center"}}>input.proto</span>
            <textarea
              style={{height: "200px", width: "800px"}}
              value={protoText || ""}
              onChange={(event) => setProtoText(event.target.value)}
              placeholder={ serverProtoDef === undefined ? "Loading..." : ".proto file contents…" }
            />
            <span style={{alignSelf:"center"}}>Fully Qualified path to Message</span>
            <input
              value={fqPath || ""}
              onChange={(event) => setFqPath(event.target.value)}
              placeholder={ serverProtoDef === undefined ? "Loading..." : "FQ Path…" }
            />
            <span style={{alignSelf:"center"}}>Unserialized (as JSON)</span>
            <textarea
              style={{height: "200px", width: "800px"}}
              value={unserializedText || ""}
              onChange={(event) => setUnserializedText(event.target.value)}
              placeholder={ serverProtoDef === undefined ? "Loading..." : "Unserialized representation…" }
            />
            <span style={{alignSelf:"center"}}>Serialized</span>
            <textarea
              style={{height: "200px", width: "800px"}}
              value={serializedText || serverProtoDef?.serialized || ""}
              onChange={(event) => setSerializedText(event.target.value)}
              placeholder={ serverProtoDef === undefined ? "Loading..." : "Serialized representation…" }
            />
          </div>
          <div style={{display:"flex", flexDirection:"column"}}>
            <span style={{alignSelf:"center"}}>Result</span>
            <span>{resultText}</span>
          </div>
        </div>
        <input type="submit" value="Send" disabled={!protoText} />
      </form>
    </main>
  )
}
