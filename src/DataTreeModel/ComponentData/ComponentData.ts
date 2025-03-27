import { z } from "zod";
import { Type } from "../../CSharpType.js";
import { FieldData, FieldParams } from "../Field.js";
import { newField } from "../helpers.js";
import { RefId } from "../../RefId.js";
import { SerializationContext } from "../../SerializationContext.js";
import { Serializable, SERIALIZE } from "../../Serializable.js";
import { Int } from "../../Scalar.js";

export namespace ComponentData {
  export interface ConstructorParamsNoType {
    id?: RefId;
    persistentId?: RefId;
    updateOrder?: FieldParams.Int;
    enabled?: FieldParams.Bool;
  }

  export interface ConstructorParams extends ConstructorParamsNoType {
    type: Type | string;
  }

  export interface Subtype<S extends z.Schema = z.Schema> {
    isType(typeName: string, type: Type): boolean;
    readonly paramsSchema: S;
    new (params: ConstructorParams & z.infer<S>): ComponentData;
  }
}

export abstract class ComponentData implements Serializable {
  static readonly schema = z
    .strictObject({
      Type: Type.schema,
      Data: z
        .object({
          ID: RefId.schema,
          "persistent-ID": RefId.schema,
          UpdateOrder: FieldData.intSchema,
          Enabled: FieldData.booleanSchema,
        })
        .passthrough(),
    })
    .transform((data, ctx) => {
      const {
        ID: id,
        "persistent-ID": persistentId,
        UpdateOrder: updateOrder,
        Enabled: enabled,
        ...innerData
      } = data.Data;

      const params = {
        type: data.Type,
        id,
        persistentId,
        updateOrder,
        enabled,
      };

      const typeName = params.type.toString();
      for (const Subtype of this.subtypes) {
        if (!Subtype.isType(typeName, params.type)) continue;
        const result = Subtype.paramsSchema.safeParse(innerData);
        if (result.success) {
          return new Subtype({ ...result.data, ...params });
        } else {
          result.error.issues.forEach((issue) => ctx.addIssue(issue));
          return z.NEVER;
        }
      }

      ctx.addIssue({
        code: "custom",
        fatal: true,
        message: "No matching component type found.",
      });
      return z.NEVER;
    });
  static readonly subtypes: ComponentData.Subtype[] = [];

  type: Type;
  id: RefId;
  persistentId: RefId;
  updateOrder: FieldData.Int;
  enabled: FieldData.Bool;

  constructor(params: ComponentData.ConstructorParams) {
    if (typeof params.type === "string") {
      const parsed = Type.parse(params.type);
      if (parsed === null) throw new Error("Invalid type: " + params.type);
      params.type = parsed;
    }

    this.type = params.type;
    this.id = params.id ?? new RefId();
    this.persistentId = params.persistentId ?? new RefId();
    this.updateOrder = newField(params.updateOrder, () => new Int(0));
    this.enabled = newField(params.enabled, true);
  }

  [SERIALIZE](ctx: SerializationContext) {
    return {
      Type: this.type[SERIALIZE](ctx),
      Data: {
        ID: this.id[SERIALIZE](ctx),
        "persistent-ID": this.persistentId[SERIALIZE](ctx),
        UpdateOrder: this.updateOrder[SERIALIZE](ctx),
        Enabled: this.enabled[SERIALIZE](ctx),
      } as Record<string, unknown>,
    };
  }
}
