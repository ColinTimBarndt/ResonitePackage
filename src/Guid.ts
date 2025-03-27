import { z } from "zod";
import { SerializationContext } from "./SerializationContext.js";
import { Serializable, SERIALIZE } from "./Serializable.js";

export class Guid implements Serializable {
  private static _dataView = new DataView(new ArrayBuffer(16));
  private static _regex =
    /^[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}$/i;

  static readonly schema: z.Schema<Guid, z.ZodTypeDef, any> = z
    .string()
    .regex(this._regex)
    .transform((str) => this.parse(str));

  readonly value: bigint;

  constructor(value: bigint | ArrayLike<number>) {
    if (typeof value === "bigint") this.value = value;
    else {
      if (value.length !== 16)
        throw new Error(`Byte array for GUID must be exactly 16 bytes long.`);
      for (let i = 0; i < 16; i++) {
        Guid._dataView.setUint8(i, value[i]);
      }
      this.value =
        Guid._dataView.getBigUint64(0, true) |
        (Guid._dataView.getBigUint64(8, true) << 64n);
    }
    Object.freeze(this);
  }

  toBytes(): Uint8Array {
    Guid._dataView.setBigUint64(0, this.value, true);
    Guid._dataView.setBigUint64(8, this.value >> 64n, true);
    return new Uint8Array(Guid._dataView.buffer.slice(0, 16));
  }

  static parse(str: string): Guid {
    if (str.length !== 36 || !this._regex.test(str))
      throw new Error("Invalid GUID: " + str);

    let part = parseInt(str.substring(0, 8), 16);
    Guid._dataView.setUint32(0, part, true);
    part = parseInt(str.substring(9, 13), 16);
    Guid._dataView.setUint16(4, part, true);
    part = parseInt(str.substring(14, 18), 16);
    Guid._dataView.setUint16(6, part, true);
    part = parseInt(str.substring(19, 23), 16);
    Guid._dataView.setUint16(8, part, false);
    part = parseInt(str.substring(24, 32), 16);
    Guid._dataView.setUint32(10, part, false);
    part = parseInt(str.substring(32), 16);
    Guid._dataView.setUint16(14, part, false);

    return new Guid(
      Guid._dataView.getBigUint64(0, true) |
        (Guid._dataView.getBigUint64(8, true) << 64n)
    );
  }

  toString(): string {
    Guid._dataView.setBigUint64(0, this.value, true);
    Guid._dataView.setBigUint64(8, this.value >> 64n, true);
    return (
      hexFormat(Guid._dataView.getUint32(0, true), 8) +
      "-" +
      hexFormat(Guid._dataView.getUint16(4, true), 4) +
      "-" +
      hexFormat(Guid._dataView.getUint16(6, true), 4) +
      "-" +
      hexFormat(Guid._dataView.getUint16(8, false), 4) +
      "-" +
      hexFormat(Guid._dataView.getUint32(10, false), 8) +
      hexFormat(Guid._dataView.getUint16(14, false), 4)
    );
  }

  [SERIALIZE](_ctx: SerializationContext): string {
    return this.toString();
  }

  static equals(a: Guid, b: Guid): boolean {
    return a.value === b.value;
  }
}

function hexFormat(num: number, len: number): string {
  return num.toString(16).padStart(len, "0");
}
