import { z } from "zod";
import { Type } from "../../CSharpType.js";
import { SERIALIZE } from "../../Serializable.js";
import { SerializationContext } from "../../SerializationContext.js";
import { ComponentData } from "./ComponentData.js";
import { FieldData, FieldParams } from "../Field.js";
import { newField } from "../helpers.js";

export namespace ProtoFluxDataRelay {
  export interface ConstructorParams extends ComponentData.ConstructorParams {
    input?: FieldParams.RefId;
  }
}

export class ProtoFluxDataRelay extends ComponentData {
  static readonly typeNames = new Set<string>([
    "FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ValueRelay",
    "FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ObjectRelay",
  ]);

  static ValueRelay(type: Type | string): Type {
    if (typeof type === "string") type = new Type(type);
    return new Type(
      "FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ValueRelay",
      { namespace: "ProtoFluxBindings", generics: [type] }
    );
  }

  static ObjectRelay(type: Type | string): Type {
    if (typeof type === "string") type = new Type(type);
    return new Type(
      "FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ObjectRelay",
      { namespace: "ProtoFluxBindings", generics: [type] }
    );
  }

  static isType(_typeName: string, type: Type) {
    return (
      type.namespace === "ProtoFluxBindings" &&
      this.typeNames.has(type.name) &&
      type.generics.length === 1
    );
  }

  static readonly paramsSchema = z
    .strictObject({
      Input: FieldData.refIdSchema,
    })
    .transform((data) => ({ input: data.Input }));

  input: FieldData.RefId;

  constructor(params: ProtoFluxDataRelay.ConstructorParams) {
    super(params);

    this.input = newField(params.input, null);
  }

  [SERIALIZE](ctx: SerializationContext) {
    const json = super[SERIALIZE](ctx);
    json.Data.Input = this.input[SERIALIZE](ctx);
    return json;
  }
}
