import type { SerializationContext } from "./SerializationContext.js";

export const SERIALIZE = Symbol("serialize");

export interface Serializable {
  [SERIALIZE](ctx: SerializationContext): unknown;
}
