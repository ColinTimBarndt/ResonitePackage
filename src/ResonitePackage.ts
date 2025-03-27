import Zip from "adm-zip";
import path from "node:path";
import { StringDecoder } from "string_decoder";
import { z } from "zod";
import { BinaryWriter, BufferWriter } from "./BinaryWriter.js";

const RecordSchemaVersion = z.object({
  globalVersion: z.number(),
  localVersion: z.number(),
  lastModifyingUserId: z.string().nullable(),
  lastModifyingMachineId: z.string().nullable(),
});

const urlSchema = z
  .string()
  .url()
  .transform((url) => new URL(url));
export const RecordPackageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  assetUri: urlSchema,
  version: RecordSchemaVersion,
  name: z.string(),
  description: z.string().nullable(),
  recordType: z.string(),
  ownerName: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  path: z.string().nullable(),
  thumbnailUri: urlSchema.nullable(),
  lastModificationTime: z.string().pipe(z.coerce.date()),
  creationTime: z.string().pipe(z.coerce.date()).nullable(),
  firstPublishTime: z.string().pipe(z.coerce.date()).nullable(),
  isDeleted: z.boolean(),
  isPublic: z.boolean(),
  isForPatrons: z.boolean(),
  isListed: z.boolean(),
  isReadOnly: z.boolean(),
  visits: z.number(),
  rating: z.number(),
  randomOrder: z.number(),
  submissions: z.unknown(),
  assetManifest: z.array(z.unknown()),
  migrationMetadata: z.unknown(),
});
export type RecordPackage = z.infer<typeof RecordPackageSchema>;

export function emptyRecordPackage(
  id: string,
  ownerId: string,
  assetUri: URL
): RecordPackage {
  const now = new Date();
  return {
    id,
    ownerId,
    assetUri,
    version: {
      globalVersion: 0,
      localVersion: 0,
      lastModifyingUserId: null,
      lastModifyingMachineId: null,
    },
    name: "Resonite Package",
    description: null,
    recordType: "object",
    ownerName: null,
    tags: null,
    path: null,
    thumbnailUri: null,
    lastModificationTime: now,
    creationTime: now,
    firstPublishTime: null,
    isDeleted: false,
    isPublic: false,
    isForPatrons: false,
    isListed: false,
    isReadOnly: false,
    visits: 0,
    rating: 0,
    randomOrder: 0,
    submissions: null,
    assetManifest: [],
    migrationMetadata: null,
  };
}

const RECORD_PATH_REGEX = /^([a-zA-Z\d_-]+)\.record$/;
const ASSET_PATH_REGEX = /^Assets\/([a-z\d]+)$/;

export class ResonitePackage {
  private _archive: Zip;

  private _records = new Map<string, RecordPackage>();
  private _assets = new Map<string, Zip.IZipEntry>();

  constructor(pathOrRawData?: string | Buffer) {
    this._archive = new Zip(pathOrRawData, {});

    if (!pathOrRawData) return;

    for (const entry of this._archive.getEntries()) {
      if (entry.isDirectory) continue;

      let matches: RegExpExecArray | null;

      if ((matches = RECORD_PATH_REGEX.exec(entry.entryName)) !== null) {
        const json = JSON.parse(new StringDecoder().write(entry.getData()));
        const result = RecordPackageSchema.safeParse(json);
        if (result.success) {
          this._records.set(matches[1], Object.freeze(result.data));
        }
        continue;
      }

      if ((matches = ASSET_PATH_REGEX.exec(entry.entryName)) !== null) {
        this._assets.set(matches[1], entry);
      }
    }
  }

  savePackage(path: string) {
    return this._archive.writeZipPromise(path);
  }

  get mainRecord() {
    return this._records.get("R-Main");
  }

  getRecord(key: string): RecordPackage | null {
    return this._records.get(key) ?? null;
  }

  writeMainRecord(record: RecordPackage) {
    return this.writeRecord("R-Main", record);
  }

  writeRecord(key: string, record: RecordPackage) {
    if (this._records.has(key))
      throw new Error(`Record ${key} has already been written`);
    this._archive.addFile(
      `${key}.record`,
      Buffer.from(JSON.stringify(record), "utf8")
    );
    this._records.set(key, Object.freeze(record));
  }

  static getAssetSignature(url: URL): string | null {
    if (url.protocol !== "packdb:" || url.hostname !== "")
      throw new Error("Uri is not a package asset URL");
    return path.basename(url.pathname);
  }

  static getAssetURL(signature: string): URL {
    return new URL(`packdb:///${signature}`);
  }

  readAsset(signature: string): Uint8Array {
    const entry = this._assets.get(signature.toLowerCase());
    if (!entry) throw new ReferenceError("Entry for signature does not exist");
    const buf = entry.getData();
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  writeAsset(signature: string, run: (writer: BinaryWriter) => void) {
    signature = signature.toLowerCase();
    if (this._assets.has(signature))
      throw new Error(`Asset ${signature} has already been written`);
    const writer = new BufferWriter();
    run(writer);
    const entry = this._archive.addFile(
      "Assets/" + signature,
      Buffer.from(writer.buffer)
    );
    this._assets.set(signature, entry);
  }
}
