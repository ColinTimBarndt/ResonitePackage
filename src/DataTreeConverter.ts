import { StringDecoder } from "node:string_decoder";
import brotli from "brotli";
import { BSON } from "bson";
import { BinaryReader, END } from "./BinaryReader.js";
import { DataTreeRoot } from "./DataTreeModel/index.js";
import { BinaryWriter } from "./BinaryWriter.js";
import { SERIALIZE } from "./Serializable.js";
import { SerializationContext } from "./SerializationContext.js";

export enum Compression {
  None = 0,
  LZ4 = 1,
  LZMA = 2,
  Brotli = 3,
}

export function loadAuto(reader: BinaryReader): DataTreeRoot | null {
  const header = tryReadHeader(reader);

  if (header === null) return null;
  if (header.version > 0) throw new Error(`Version too new: ${header.version}`);
  switch (header.compression) {
    case Compression.Brotli:
      return fromRawBrson(reader);
    default:
      throw new Error(
        `Compression not supported: ${Compression[header.compression]}`
      );
  }
}

const buf4u8 = new Uint8Array(4);

export function tryReadHeader(
  reader: BinaryReader
): { version: number; compression: Compression } | null {
  reader.readBuffer(buf4u8);
  const magicString = new StringDecoder().write(buf4u8);

  if (magicString !== "FrDT") {
    return null;
  }

  const version = reader.nextInt32();
  if (version === END) return null;
  const compression = reader.next7BitEncodedInt();
  if (compression === END) return null;

  return { version, compression };
}

export function writeHeader(
  writer: BinaryWriter,
  version: number,
  compression: Compression
) {
  writer.pushBuffer(new TextEncoder().encode("FrDT"));
  writer.pushInt32(version);
  writer.push7BitEncodedInt(compression);
}

export function fromRawBrson(reader: BinaryReader): DataTreeRoot {
  const bson = brotli.decompress(Buffer.from(reader.readAll()));
  const json = BSON.deserialize(bson, {
    promoteLongs: false,
    promoteValues: false,
  });
  return DataTreeRoot.schema.parse(json);
}

export function toRawBrson(writer: BinaryWriter, root: DataTreeRoot) {
  writeHeader(writer, 0, Compression.Brotli);
  const bson = BSON.serialize(root[SERIALIZE](new SerializationContext()));
  writer.pushBuffer(brotli.compress(Buffer.from(bson)));
}
