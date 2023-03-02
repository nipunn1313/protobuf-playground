import { action } from '../_generated/server'
import { writeFile } from 'node:fs/promises'
import protobuf from "protobufjs";
import {temporaryFile} from 'tempy';
import camelcaseKeys from 'camelcase-keys';

export default action(async ({runMutation}, protoContents: string, fqPath: string, unserialized: string): Promise<string> => {
  await runMutation("save:protoDef", protoContents, fqPath, unserialized, null);

  const t = temporaryFile({name: "input.proto"});
  await writeFile(t, protoContents);

  let loaded;
  try {
    loaded = await protobuf.load(t);
  } catch (eUntyped) {
    const e = eUntyped as Error;
    return e.message.replace(t, "input.proto");
  }

  if (!fqPath) {
    return "IT COMPILED!";
  }
  const messageDef = loaded.lookupType(fqPath);
  if (!messageDef) {
    return `IT COMPILED! ${fqPath} not found.`;
  }

  let unserializedParsed;
  try {
    unserializedParsed = camelcaseKeys(JSON.parse(unserialized));
  } catch (e) {
    return `Invalid JSON: ${e}`;
  }
  
  const message = messageDef.create(unserializedParsed);

  const encoded = messageDef.encode(message).finish();
  console.log(`buffer = ${Array.prototype.toString.call(encoded)}`);

  const asText = Array.apply([], Array.from(encoded)).join(",");
  console.log(asText);

  await runMutation("save:protoDef", protoContents, fqPath, unserialized, asText);
  return "Successfully serialized";
})
