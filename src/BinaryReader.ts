export const END = Symbol("END");
export type END = typeof END;

export abstract class BinaryReader {
  abstract readBuffer(buf: Uint8Array): number | END;
  abstract nextUint8(): number | END;
  abstract nextInt32(): number | END;
  abstract readAll(): Uint8Array;

  next7BitEncodedInt(): number | END {
    let num = 0;
    let more = false;
    let offset = 0;
    do {
      let byte = this.nextUint8();
      if (byte === END) return END;
      more = (byte & 0x80) != 0;
      num |= (byte & 0x7f) << offset;
      offset += 7;
    } while (more);
    return num;
  }
}

export class BufferReader extends BinaryReader {
  private _pos = 0;
  private readonly _view: DataView;
  private readonly _u8: Uint8Array;

  constructor(buf: ArrayBufferLike | Uint8Array) {
    super();
    if (buf instanceof Uint8Array) {
      this._u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      this._view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
      this._view = new DataView(buf);
      this._u8 = new Uint8Array(buf);
    }
  }

  readBuffer(buf: Uint8Array): number | END {
    if (this._pos + buf.length >= this._view.byteLength) return END;
    buf.set(this._u8.subarray(this._pos, this._pos + buf.byteLength));
    this._pos += buf.length;
    return buf.length;
  }

  nextUint8(): number | END {
    if (this._pos >= this._view.byteLength) return END;
    return this._view.getUint8(this._pos++);
  }

  nextInt32(): number | END {
    if (this._pos + 4 >= this._view.byteLength) return END;
    const v = this._view.getInt32(this._pos);
    this._pos += 4;
    return v;
  }

  readAll(): Uint8Array {
    return this._u8.slice(this._pos);
  }
}
