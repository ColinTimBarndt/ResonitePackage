import { z } from "zod";
import {
  DeserializationContext,
  SerializationContext,
} from "./SerializationContext.js";
import { Serializable, SERIALIZE } from "./Serializable.js";
import { Int32 } from "bson";

export class Type implements Serializable {
  static readonly stringSchema = z.string().transform((str, ctx) => {
    const result = Type.parse(str);
    if (result === null) {
      ctx.addIssue({
        path: ctx.path,
        code: "custom",
        fatal: true,
        message: "Invalid Type",
      });
      return z.NEVER;
    }
    return result;
  });

  static readonly schema = z.instanceof(Int32).transform((i32, ctx) => {
    const type = DeserializationContext.current.getType(i32.valueOf());
    if (type === null) {
      ctx.addIssue({
        code: "custom",
        fatal: true,
        message: "Type index out of bounds",
      });
      return z.NEVER;
    }
    return type;
  });

  namespace: string | null;
  name: string;
  generics: Type[];

  constructor(
    name: string,
    params: { namespace?: string | null; generics?: Type[] } = {}
  ) {
    this.name = name;
    this.generics = params.generics ?? [];
    this.namespace = params.namespace ?? null;
  }

  toString() {
    let str = "";
    if (this.namespace) str += "[" + this.namespace + "]";
    str += this.name;
    if (this.generics.length !== 0) str += "<" + this.generics.join() + ">";
    return str;
  }

  niceTypeName() {
    let str = this.name.substring(this.name.lastIndexOf(".") + 1);
    if (this.generics.length !== 0)
      str +=
        "<" + this.generics.map((type) => type.niceTypeName()).join() + ">";
    return str;
  }

  [SERIALIZE](ctx: SerializationContext): Int32 {
    return new Int32(ctx.getTypeId(this));
  }

  static parse(str: string): Type | null {
    const parsed = parseType(str);
    if (parsed === null || parsed[1].length !== 0) return null;
    return parsed[0];
  }

  static equals(a: Type, b: Type): boolean {
    if (
      a.namespace !== b.namespace ||
      a.name !== b.name ||
      a.generics.length !== b.generics.length
    )
      return false;
    for (let i = 0; i < a.generics.length; i++) {
      if (!Type.equals(a.generics[i], b.generics[i])) return false;
    }

    return true;
  }
}

const TYPE_NAME_REGEX = /^[a-z_$][a-z_$\d]*(?:\.[a-z_$][a-z_$\d]*)*\??/i;
function parseType(str: string): [Type, string] | null {
  if (str.length === 0) return null;
  let namespace: string | null = null;
  if (str[0] === "[") {
    const end = str.indexOf("]");
    if (end === -1) return null;
    namespace = str.substring(1, end);
    str = str.substring(end + 1);
  }
  const nameMatch = TYPE_NAME_REGEX.exec(str);
  if (nameMatch === null) return null;
  const name = nameMatch[0];
  const generics: Type[] = [];
  if (str[name.length] === "<") {
    str = str.substring(name.length + 1);
    let gen = parseType(str);
    if (gen === null) return null;
    generics.push(gen[0]);
    str = gen[1];
    while (str[0] !== ">") {
      if (str[0] !== ",") return null;
      str = str.substring(1);
      gen = parseType(str);
      if (gen === null) return null;
      generics.push(gen[0]);
      str = gen[1];
    }
    str = str.substring(1);
  } else {
    str = str.substring(name.length);
  }
  return [new Type(name, { namespace, generics }), str];
}

export namespace Type {
  const frooxEngine = { namespace: "FrooxEngine" };

  export const Slot = new Type("FrooxEngine.Slot", frooxEngine);
  export const User = new Type("FrooxEngine.User", frooxEngine);

  // Assets
  export function IAssetProvider(type: Type): Type {
    return new Type("FrooxEngine.IAssetProvider", {
      namespace: "FrooxEngine",
      generics: [type],
    });
  }
  export const AudioClip = new Type("FrooxEngine.AudioClip", frooxEngine);
  export const Cubemap = new Type("FrooxEngine.Cubemap", frooxEngine);
  export const Font = new Type("FrooxEngine.Font", frooxEngine);
  export const GaussianSplat = new Type(
    "FrooxEngine.GaussianSplat",
    frooxEngine
  );
  export const ITexture = new Type("FrooxEngine.ITexture", frooxEngine);
  export const ITexture2D = new Type("FrooxEngine.ITexture2D", frooxEngine);
  export const Mesh = new Type("FrooxEngine.Mesh", frooxEngine);
  export const Sprite = new Type("FrooxEngine.Sprite", frooxEngine);

  // Misc
  export const IDestroyable = new Type("FrooxEngine.IDestroyable", frooxEngine);
  export const ITool = new Type("FrooxEngine.ITool", frooxEngine);
  export const RawDataTool = new Type("FrooxEngine.RawDataTool", frooxEngine);
  export const ISyncRef = new Type("FrooxEngine.ISyncRef", frooxEngine);

  // ProtoFlux
  export const ProtoFluxNode = new Type(
    "FrooxEngine.ProtoFlux.ProtoFluxNode",
    frooxEngine
  );
  export const INodeOutput = new Type(
    "FrooxEngine.ProtoFlux.INodeOutput",
    frooxEngine
  );
}
