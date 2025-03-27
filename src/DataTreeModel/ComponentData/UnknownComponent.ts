import { z } from "zod";
import { SERIALIZE } from "../../Serializable.js";
import { SerializationContext } from "../../SerializationContext.js";
import { ComponentData } from "./ComponentData.js";

export class UnknownComponent extends ComponentData {
  static isType(_type: string): true {
    return true;
  }

  static readonly paramsSchema = z.record(z.unknown()).transform((data) => ({
    unknownProperties: new Map(Object.entries(data)),
  }));

  unknownProperties: Map<string, unknown>;

  constructor(
    params: ComponentData.ConstructorParams & {
      unknownProperties: Map<string, unknown>;
    }
  ) {
    super(params);
    this.unknownProperties = params.unknownProperties;
  }

  [SERIALIZE](ctx: SerializationContext) {
    const json = super[SERIALIZE](ctx);
    for (const [key, value] of this.unknownProperties) {
      json.Data[key] = value;
    }
    return json;
  }
}
