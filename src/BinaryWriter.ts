import { Writable } from "stream";

export abstract class BinaryWriter {
  abstract pushBuffer(buf: Uint8Array): void;
  abstract pushUint8(num: number): void;
  abstract pushInt32(num: number): void;

  push7BitEncodedInt(num: number): void {
    do {
      let byte = num & 0x7f;
      num >>= 7;
      byte |= num !== 0 ? 0x80 : 0;
      this.pushUint8(byte);
    } while (num !== 0);
  }
}

export class BufferWriter extends BinaryWriter {
  private _buf = new Uint8Array(1024);
  private _view = new DataView(this._buf.buffer, this._buf.byteOffset);
  private _size = 0;

  pushBuffer(buf: Uint8Array): void {
    if (buf.byteLength + this._size > this._buf.byteLength) {
      this._resize(buf.byteLength + this._size);
    }
    this._buf.set(buf, this._size);
    this._size += buf.byteLength;
  }

  pushUint8(num: number): void {
    if (this._size === this._buf.byteLength) {
      this._resize(this._size + 1);
    }
    this._view.setUint8(this._size++, num);
  }

  pushInt32(num: number): void {
    if (this._size + 4 > this._buf.byteLength) {
      this._resize(this._size + 4);
    }
    this._view.setInt32(this._size, num);
    this._size += 4;
  }

  get buffer() {
    return new Uint8Array(this._buf.buffer, 0, this._size);
  }

  private _resize(minCap: number) {
    let newSize = this._buf.byteLength;
    while (newSize < minCap && newSize) newSize <<= 1;
    if (!newSize) throw new RangeError("New size out of 32-bit range.");
    const newBuf = new Uint8Array(newSize);
    newBuf.set(this._buf);
    this._buf = newBuf;
    this._view = new DataView(newBuf.buffer, newBuf.byteOffset);
  }
}

export class NodeStreamWriter extends BinaryWriter {
  private static readonly _int32Buffer = new DataView(new ArrayBuffer(4));

  constructor(private _writable: Writable) {
    super();
  }

  pushBuffer(buf: Uint8Array): void {
    this._writable.write(buf);
  }

  pushUint8(num: number): void {
    this._writable.write(num);
  }

  pushInt32(num: number): void {
    NodeStreamWriter._int32Buffer.setInt32(0, num);
    this._writable.write(
      new Uint8Array(NodeStreamWriter._int32Buffer.buffer.slice(0))
    );
  }
}
