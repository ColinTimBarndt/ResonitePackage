import { Type } from "./CSharpType.js";
import { Guid } from "./Guid.js";
import { RefId } from "./RefId.js";

export class DeserializationContext {
  private _types: Type[];
  private _refIds = new Map<bigint, RefId>();

  constructor(types: Type[]) {
    this._types = types;
  }

  getType(id: number): Type | null {
    return this._types[id] ?? null;
  }

  getRefId(guid: Guid): RefId {
    let refId = this._refIds.get(guid.value);
    if (refId) return refId;
    refId = new RefId();
    this._refIds.set(guid.value, refId);
    return refId;
  }

  private static _ctx: DeserializationContext | null = null;

  static get current() {
    if (this._ctx === null) throw new Error("No current parsing context");
    return this._ctx;
  }

  static with<R>(ctx: DeserializationContext, run: () => R): R {
    const prev = this._ctx;
    try {
      this._ctx = ctx;
      return run();
    } finally {
      this._ctx = prev;
    }
  }
}

export class SerializationContext {
  private _types = new Map<string, number>();
  private _guids = new Map<object, Guid>();
  private _currentGuid = 0n;

  getTypeId(type: Type) {
    const typeName = type.toString();
    let id = this._types.get(typeName);
    if (id !== undefined) return id;
    id = this._types.size;
    this._types.set(typeName, id);
    return id;
  }

  getReferenceGuid(ref: object): Guid {
    let guid = this._guids.get(ref);
    if (guid) return guid;
    guid = new Guid(this._currentGuid++);
    this._guids.set(ref, guid);
    return guid;
  }

  get types() {
    return Array.of(...this._types.keys());
  }
}
