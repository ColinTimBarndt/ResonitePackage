import { z } from "zod";
import { Type } from "../../CSharpType.js";
import { ComponentData } from "./ComponentData.js";

const destroyBlockType = new Type("FrooxEngine.DestroyBlock", {
  namespace: "FrooxEngine",
});

const duplicateBlockType = new Type("FrooxEngine.DuplicateBlock", {
  namespace: "FrooxEngine",
});

export class Tag extends ComponentData {
  static readonly fullTypeNames = new Set<string>([
    "[FrooxEngine]FrooxEngine.DestroyBlock",
    "[FrooxEngine]FrooxEngine.DuplicateBlock",
  ]);

  static DestroyBlock() {
    return new this(destroyBlockType);
  }
  static DuplicateBlock() {
    return new this(duplicateBlockType);
  }

  static isType(typeName: string) {
    return this.fullTypeNames.has(typeName);
  }

  static readonly paramsSchema = z.strictObject({});

  constructor(params: ComponentData.ConstructorParams | Type | string) {
    super(
      typeof params === "string" || params instanceof Type
        ? { type: params }
        : params
    );
  }
}
