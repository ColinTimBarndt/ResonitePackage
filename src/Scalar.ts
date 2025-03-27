import { Double, Long as BsonLong } from "bson";
import { SerializationContext } from "./SerializationContext.js";
import { Serializable, SERIALIZE } from "./Serializable.js";
import { z } from "zod";

export const doubleSchema = z
  .instanceof(Double)
  .transform((double) => double.valueOf());

export { Double, Int32 as Int } from "bson";

export class Long implements Serializable {
  static readonly schema = z
    .instanceof(BsonLong)
    .transform((data) => new Long(data.toBigInt()));

  constructor(public value: bigint) {}

  [SERIALIZE](ctx: SerializationContext): BsonLong {
    return new BsonLong(this.value);
  }
}

export class Double2 implements Serializable {
  static readonly schema = z
    .tuple([doubleSchema, doubleSchema])
    .transform((data) => new Double2(...data));

  constructor(public x: number, public y: number) {}

  [SERIALIZE](ctx: SerializationContext) {
    return [new Double(this.x), new Double(this.y)];
  }
}

export class Double3 implements Serializable {
  static readonly schema = z
    .tuple([doubleSchema, doubleSchema, doubleSchema])
    .transform((data) => new Double3(...data));

  constructor(public x: number, public y: number, public z: number) {}

  [SERIALIZE](ctx: SerializationContext) {
    return [new Double(this.x), new Double(this.y), new Double(this.z)];
  }
}

export class Double4 implements Serializable {
  static readonly schema = z
    .tuple([doubleSchema, doubleSchema, doubleSchema, doubleSchema])
    .transform((data) => new Double4(...data));

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number
  ) {}

  [SERIALIZE](ctx: SerializationContext) {
    return [
      new Double(this.x),
      new Double(this.y),
      new Double(this.z),
      new Double(this.w),
    ];
  }
}
