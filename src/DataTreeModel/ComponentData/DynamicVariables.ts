import { z } from "zod";
import { ComponentData } from "./ComponentData.js";
import { FieldData, FieldParams } from "../Field.js";
import { Type } from "../../CSharpType.js";
import { newField } from "../helpers.js";
import { SerializationContext } from "../../SerializationContext.js";
import { SERIALIZE } from "../../Serializable.js";

export namespace DynamicVariableSpace {
  export interface ConstructorParams
    extends ComponentData.ConstructorParamsNoType {
    spaceName?: FieldParams.String;
    onlyDirectBinding?: FieldParams.Bool;
  }
}

export class DynamicVariableSpace extends ComponentData {
  static readonly type = new Type("FrooxEngine.DynamicVariableSpace", {
    namespace: "FrooxEngine",
  });

  static isType(typeName: string) {
    return typeName === "[FrooxEngine]FrooxEngine.DynamicVariableSpace";
  }

  static readonly paramsSchema = z
    .strictObject({
      SpaceName: FieldData.stringSchema,
      OnlyDirectBinding: FieldData.booleanSchema,
    })
    .transform((data) => ({
      spaceName: data.SpaceName,
      onlyDirectBinding: data.OnlyDirectBinding,
    }));

  spaceName: FieldData.String;
  onlyDirectBinding: FieldData.Bool;

  constructor(params: DynamicVariableSpace.ConstructorParams = {}) {
    super({ ...params, type: DynamicVariableSpace.type });

    this.spaceName = newField(params.spaceName, null);
    this.onlyDirectBinding = newField(params.onlyDirectBinding, false);
  }

  [SERIALIZE](ctx: SerializationContext) {
    const json = super[SERIALIZE](ctx);
    json.Data.SpaceName = this.spaceName[SERIALIZE](ctx);
    json.Data.OnlyDirectBinding = this.onlyDirectBinding[SERIALIZE](ctx);
    return json;
  }
}

export namespace DynamicReferenceVariable {
  interface ConstructorParamsNoType
    extends ComponentData.ConstructorParamsNoType {
    variableName?: FieldParams.String;
    reference?: FieldParams.RefId;
    overrideOnLink?: FieldParams.Bool;
  }

  export type ConstructorParams = ConstructorParamsNoType &
    (
      | { type: Type | string; innerType?: never }
      | { innerType: Type | string; type?: never }
    );
}

export class DynamicReferenceVariable extends ComponentData {
  static isType(_typeName: string, type: Type) {
    return (
      type.namespace === "FrooxEngine" &&
      type.name === "FrooxEngine.DynamicReferenceVariable" &&
      type.generics.length === 1
    );
  }

  static getType(type: Type | string): Type {
    if (typeof type === "string") {
      const parsed = Type.parse(type);
      if (parsed === null) throw new Error("Invalid type: " + type);
      type = parsed;
    }
    return new Type("FrooxEngine.DynamicReferenceVariable", {
      namespace: "FrooxEngine",
      generics: [type],
    });
  }

  static readonly paramsSchema = z
    .strictObject({
      VariableName: FieldData.stringSchema,
      Reference: FieldData.refIdSchema,
      OverrideOnLink: FieldData.booleanSchema,
    })
    .transform((data) => ({
      variableName: data.VariableName,
      reference: data.Reference,
      overrideOnLink: data.OverrideOnLink,
    }));

  variableName: FieldData.String;
  reference: FieldData.RefId;
  overrideOnLink: FieldData.Bool;

  constructor(params: DynamicReferenceVariable.ConstructorParams) {
    super(
      !params.type
        ? {
            ...params,
            type: DynamicReferenceVariable.getType(params.innerType!),
          }
        : params
    );

    this.variableName = newField(params.variableName, null);
    this.reference = newField(params.reference, null);
    this.overrideOnLink = newField(params.overrideOnLink, false);
  }

  [SERIALIZE](ctx: SerializationContext) {
    const json = super[SERIALIZE](ctx);
    json.Data.VariableName = this.variableName[SERIALIZE](ctx);
    json.Data.Reference = this.reference[SERIALIZE](ctx);
    json.Data.OverrideOnLink = this.overrideOnLink[SERIALIZE](ctx);
    return json;
  }
}

export namespace DynamicValueVariable {
  interface ConstructorParamsNoType
    extends ComponentData.ConstructorParamsNoType {
    variableName?: FieldParams.String;
    value?: FieldParams.Unknown;
    overrideOnLink?: FieldParams.Bool;
  }

  export type ConstructorParams = ConstructorParamsNoType &
    (
      | { type: Type | string; innerType?: never }
      | { innerType: Type | string; type?: never }
    );
}

export class DynamicValueVariable extends ComponentData {
  static isType(_typeName: string, type: Type) {
    return (
      type.namespace === "FrooxEngine" &&
      type.name === "FrooxEngine.DynamicValueVariable" &&
      type.generics.length === 1
    );
  }

  static getType(type: Type | string): Type {
    if (typeof type === "string") {
      const parsed = Type.parse(type);
      if (parsed === null) throw new Error("Invalid type: " + type);
      type = parsed;
    }
    return new Type("FrooxEngine.DynamicValueVariable", {
      namespace: "FrooxEngine",
      generics: [type],
    });
  }

  static readonly paramsSchema = z
    .strictObject({
      VariableName: FieldData.stringSchema,
      Value: FieldData.unknownSchema,
      OverrideOnLink: FieldData.booleanSchema,
    })
    .transform((data) => ({
      variableName: data.VariableName,
      value: data.Value,
      overrideOnLink: data.OverrideOnLink,
    }));

  variableName: FieldData.String;
  value: FieldData.Unknown;
  overrideOnLink: FieldData.Bool;

  constructor(params: DynamicValueVariable.ConstructorParams) {
    super(
      !params.type
        ? {
            ...params,
            type: DynamicValueVariable.getType(params.innerType!),
          }
        : params
    );

    this.variableName = newField(params.variableName, null);
    this.value = newField(params.value, undefined);
    this.overrideOnLink = newField(params.overrideOnLink, false);
  }

  [SERIALIZE](ctx: SerializationContext) {
    const json = super[SERIALIZE](ctx);
    json.Data.VariableName = this.variableName[SERIALIZE](ctx);
    json.Data.Value = this.value[SERIALIZE](ctx);
    json.Data.OverrideOnLink = this.overrideOnLink[SERIALIZE](ctx);
    return json;
  }
}
