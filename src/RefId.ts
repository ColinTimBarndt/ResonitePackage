import {
  DeserializationContext,
  SerializationContext,
} from "./SerializationContext.js";
import { Guid } from "./Guid.js";
import { Serializable, SERIALIZE } from "./Serializable.js";

export class RefId implements Serializable {
  static readonly schema = Guid.schema.transform((guid) =>
    DeserializationContext.current.getRefId(guid)
  );

  toString() {
    return "RefID";
  }

  [SERIALIZE](ctx: SerializationContext): string {
    return ctx.getReferenceGuid(this)[SERIALIZE](ctx);
  }
}
