import { ComponentData } from "./ComponentData/ComponentData.js";
import { FieldData, FieldListData, FieldParams } from "./Field.js";
import { z } from "zod";
import { newField, newFieldList } from "./helpers.js";
import {
  DeserializationContext,
  SerializationContext,
} from "../SerializationContext.js";
import { Serializable, SERIALIZE } from "../Serializable.js";
import { Type } from "../CSharpType.js";
import { RefId } from "../RefId.js";
import { Double3, Double4, Int, Long } from "../Scalar.js";
import "./ComponentData/index.js"; // Initialize subtypes

export * from "./Field.js";

const intSchema = z.instanceof(Int).transform((v) => v.valueOf());

export class FeatureFlags implements Serializable {
  static readonly schema = z
    .object({
      ColorManagement: intSchema,
      ResetGUID: intSchema,
      ProtoFlux: intSchema,
      TEXTURE_QUALITY: intSchema,
      TypeManagement: intSchema,
      ALIGNER_FILTERING: intSchema,
      PhotonDust: intSchema,
    })
    .transform((data): FeatureFlags => new FeatureFlags(data));

  ColorManagement = 0;
  ResetGUID = 0;
  ProtoFlux = 0;
  TEXTURE_QUALITY = 0;
  TypeManagement = 0;
  ALIGNER_FILTERING = 0;
  PhotonDust = 0;

  constructor(
    params: Partial<
      Record<keyof z.infer<typeof FeatureFlags.schema>, number>
    > = {}
  ) {
    for (const [k, v] of Object.entries(params)) {
      (this as any)[k] = v;
    }
  }

  [SERIALIZE](ctx: SerializationContext): Record<string, Int> {
    const json: Record<string, Int> = {};
    for (const [k, v] of Object.entries(this)) {
      if (typeof v === "number") json[k] = new Int(v);
    }
    return json;
  }
}

export type Vector2<T = number> = [T, T];
export type Vector3<T = number> = [T, T, T];
export type Vector4<T = number> = [T, T, T, T];

namespace SlotData {
  export interface ConstructorParams {
    id?: RefId;
    components?: FieldListData<ComponentData> | ComponentData[];
    name?: FieldParams.String;
    tag?: FieldParams.String;
    active?: FieldParams.Bool;
    persistentId?: RefId;
    position?: FieldParams.Double3;
    rotation?: FieldParams.Double4;
    scale?: FieldParams.Double3;
    orderOffset?: FieldParams.Long;
    parentReference?: RefId;
    children?: SlotData[];
  }
}

export class SlotData implements Serializable {
  static readonly schema: z.Schema<SlotData, z.ZodTypeDef, any> = z
    .strictObject(
      (() => {
        const params = {
          ID: RefId.schema,
          Components: FieldListData.schema(ComponentData.schema),
          Name: FieldData.stringSchema,
          Tag: FieldData.stringSchema,
          Active: FieldData.booleanSchema,
          "Persistent-ID": RefId.schema,
          Position: FieldData.double3Schema,
          Rotation: FieldData.double4Schema,
          Scale: FieldData.double3Schema,
          OrderOffset: FieldData.longSchema,
          ParentReference: RefId.schema,
          Children: null! as z.ZodArray<typeof this.schema>,
        } satisfies z.ZodRawShape;

        // Hack for recursive types
        Object.defineProperty(params, "Children", {
          enumerable: true,
          get: () => {
            const value = this.schema.array();
            Object.defineProperty(params, "Children", {
              enumerable: true,
              value,
            });
            return value;
          },
        });

        return params;
      })()
    )
    .transform(
      (data) =>
        new SlotData({
          id: data.ID,
          components: data.Components,
          name: data.Name,
          tag: data.Tag,
          active: data.Active,
          persistentId: data["Persistent-ID"],
          position: data.Position,
          rotation: data.Rotation,
          scale: data.Scale,
          orderOffset: data.OrderOffset,
          parentReference: data.ParentReference,
          children: data.Children,
        })
    );

  id: RefId;
  components: FieldListData<ComponentData>;
  name: FieldData.String;
  tag: FieldData.String;
  active: FieldData.Bool;
  persistentId: RefId;
  position: FieldData.Double3;
  rotation: FieldData.Double4;
  scale: FieldData.Double3;
  orderOffset: FieldData.Long;
  parentReference: RefId;
  children: SlotData[];

  constructor(params: SlotData.ConstructorParams = {}) {
    this.id = params.id ?? new RefId();
    this.components = newFieldList(params.components);
    this.name = newField(params.name, "Slot");
    this.tag = newField(params.tag, null);
    this.active = newField(params.active, true);
    this.persistentId = params.persistentId ?? new RefId();
    this.position = newField(params.position, () => new Double3(0, 0, 0));
    this.rotation = newField(params.rotation, () => new Double4(0, 0, 0, 1));
    this.scale = newField(params.scale, () => new Double3(1, 1, 1));
    this.orderOffset = newField(params.orderOffset, () => new Long(0n));
    this.parentReference = params.parentReference ?? new RefId();
    this.children = params.children ?? [];
  }

  [SERIALIZE](ctx: SerializationContext): Record<string, unknown> {
    return {
      ID: this.id[SERIALIZE](ctx),
      Components: this.components[SERIALIZE](ctx),
      Name: this.name[SERIALIZE](ctx),
      Tag: this.tag[SERIALIZE](ctx),
      Active: this.active[SERIALIZE](ctx),
      "Persistent-ID": this.persistentId[SERIALIZE](ctx),
      Position: this.position[SERIALIZE](ctx),
      Rotation: this.rotation[SERIALIZE](ctx),
      Scale: this.scale[SERIALIZE](ctx),
      OrderOffset: this.orderOffset[SERIALIZE](ctx),
      ParentReference: this.parentReference[SERIALIZE](ctx),
      Children: this.children.map((child) => child[SERIALIZE](ctx)),
    };
  }
}

namespace DataTreeRoot {
  export interface ConstructorParams {
    versionNumber: string;
    featureFlags?: FeatureFlags;
    typeVersions?: Partial<Record<string, unknown>>;
    object: SlotData;
  }
}

export class DataTreeRoot implements Serializable {
  static readonly schema = z
    .strictObject({
      VersionNumber: z.string(),
      FeatureFlags: FeatureFlags.schema,
      Types: Type.stringSchema.array(),
      TypeVersions: z.any(),
      Object: z.any(),
    })
    .transform((data, ctx) => {
      return DeserializationContext.with(
        new DeserializationContext(data.Types),
        () => {
          const result = SlotData.schema.safeParse(data.Object);
          if (result.success) {
            return new DataTreeRoot({
              versionNumber: data.VersionNumber,
              featureFlags: data.FeatureFlags,
              typeVersions: data.TypeVersions,
              object: result.data,
            });
          } else {
            result.error.issues.forEach((issue) => ctx.addIssue(issue));
            return z.NEVER;
          }
        }
      );
    });

  versionNumber: string;
  featureFlags: FeatureFlags;
  typeVersions: Partial<Record<string, unknown>>;
  object: SlotData;

  constructor(params: DataTreeRoot.ConstructorParams) {
    this.versionNumber = params.versionNumber;
    this.featureFlags = params.featureFlags ?? new FeatureFlags();
    this.typeVersions = params.typeVersions ?? {};
    this.object = params.object;
  }

  [SERIALIZE](ctx: SerializationContext) {
    const obj = this.object[SERIALIZE](ctx);

    return {
      VersionNumber: this.versionNumber,
      FeatureFlags: this.featureFlags[SERIALIZE](ctx),
      Types: ctx.types,
      TypeVersions: this.typeVersions,
      Object: obj,
    };
  }
}
