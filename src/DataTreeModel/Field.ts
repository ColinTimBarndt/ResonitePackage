import { z } from "zod";
import * as scalar from "../Scalar.js";
import { SerializationContext } from "../SerializationContext.js";
import { Serializable, SERIALIZE } from "../Serializable.js";
import { RefId } from "../RefId.js";

type RefIdOuter = RefId;

export namespace FieldData {
  export type Unknown = FieldData<unknown>;
  export type String = FieldData<string | null>;
  export type Int = FieldData<scalar.Int>;
  export type Long = FieldData<scalar.Long>;
  export type Double = FieldData<scalar.Double>;
  export type Double2 = FieldData<scalar.Double2>;
  export type Double3 = FieldData<scalar.Double3>;
  export type Double4 = FieldData<scalar.Double4>;
  export type Bool = FieldData<boolean>;
  export type RefId = FieldData<RefIdOuter | null>;
}

export namespace FieldParams {
  type Param<T> = FieldData<T> | T;

  export type Unknown = Param<unknown>;
  export type String = Param<string | null>;
  export type Int = Param<scalar.Int>;
  export type Long = Param<scalar.Long>;
  export type Double = Param<scalar.Double>;
  export type Double2 = Param<scalar.Double2>;
  export type Double3 = Param<scalar.Double3>;
  export type Double4 = Param<scalar.Double4>;
  export type Bool = Param<boolean>;
  export type RefId = Param<RefIdOuter | null>;
}

export class FieldData<T> implements Serializable {
  static readonly unknownSchema = this.schema(z.unknown());
  static readonly stringSchema = this.schema(z.string().nullable());
  static readonly intSchema = this.schema(z.instanceof(scalar.Int));
  static readonly longSchema = this.schema(scalar.Long.schema);
  static readonly doubleSchema = this.schema(scalar.doubleSchema);
  static readonly double2Schema = this.schema(scalar.Double2.schema);
  static readonly double3Schema = this.schema(scalar.Double3.schema);
  static readonly double4Schema = this.schema(scalar.Double4.schema);
  static readonly booleanSchema = this.schema(z.boolean());
  static readonly refIdSchema = this.schema(RefId.schema.nullable());

  static schema<S extends z.Schema>(
    T: S
  ): z.Schema<FieldData<z.infer<S>>, z.ZodTypeDef, any> {
    return z
      .object({ ID: RefId.schema, Data: T })
      .transform((data) => new FieldData(data.Data, data.ID));
  }

  id: RefId;

  constructor(public data: T, id?: RefId) {
    this.id = id ?? new RefId();
  }

  [SERIALIZE](ctx: SerializationContext): {
    ID: string;
    Data: T extends { [SERIALIZE](...args: any): infer R } ? R : T;
  } {
    const data: any = this.data;
    return {
      ID: this.id[SERIALIZE](ctx),
      Data: data?.[SERIALIZE] ? data[SERIALIZE](ctx) : data,
    };
  }
}

export class FieldListData<T> implements Serializable {
  static schema<S extends z.Schema>(
    T: S
  ): z.Schema<FieldListData<z.infer<S>>, z.ZodTypeDef, any> {
    return z
      .object({ ID: RefId.schema, Data: T.array() })
      .transform((data) => new FieldListData(data.Data, data.ID));
  }

  id: RefId;

  constructor(public data: T[], id?: RefId) {
    this.id = id ?? new RefId();
  }

  [SERIALIZE](ctx: SerializationContext): {
    ID: string;
    Data: (T extends { serialize(...args: any): infer R } ? R : T)[];
  } {
    return {
      ID: this.id[SERIALIZE](ctx),
      Data: this.data.map((data: any) =>
        data?.[SERIALIZE] ? data[SERIALIZE](ctx) : data
      ),
    };
  }
}
