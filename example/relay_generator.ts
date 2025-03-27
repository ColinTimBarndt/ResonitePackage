import {
  ResonitePackage,
  emptyRecordPackage,
  DataTreeConverter,
  Type,
  RefId,
} from "resonitepackage";
import {
  DynamicReferenceVariable,
  DynamicValueVariable,
  DynamicVariableSpace,
  ProtoFluxDataRelay,
  Tag,
} from "resonitepackage/components";
import { FieldData, DataTreeRoot, SlotData } from "resonitepackage/datatree";

const rootId = new RefId();

const valueTypes = [
  "bool",
  "bool2",
  "bool3",
  "bool4",
  "int",
  "int2",
  "int3",
  "int4",
  "uint",
  "uint2",
  "uint3",
  "uint4",
  "long",
  "long2",
  "long3",
  "long4",
  "ulong",
  "ulong2",
  "ulong3",
  "ulong4",
  "float",
  "float2",
  "float3",
  "float4",
  "float2x2",
  "float3x3",
  "float4x4",
  "floatQ",
  "double",
  "double2",
  "double3",
  "double4",
  "double2x2",
  "double3x3",
  "double4x4",
  "doubleQ",
  "short",
  "ushort",
  "byte",
  "half",
  "decimal",
  "color",
  "colorX",
  "char",
  "DateTime",
  "TimeSpan",
  "RefID",
].map((it) => new Type(it));

const objectTypes = [
  new Type("object"),
  Type.User,
  Type.Slot,
  ...[
    Type.AudioClip,
    Type.Cubemap,
    Type.Font,
    Type.GaussianSplat,
    Type.ITexture,
    Type.ITexture2D,
    Type.Mesh,
    Type.Sprite,
  ].map(Type.IAssetProvider),
];

const root = new DataTreeRoot({
  versionNumber: "2025.3.25.1348",
  object: new SlotData({
    id: rootId,
    name: "Data Relays",
    components: [
      new DynamicReferenceVariable({
        innerType: Type.Slot,
        variableName: "Module/Templates.Relay",
        reference: rootId,
      }),
      new DynamicVariableSpace({
        spaceName: "Template",
        onlyDirectBinding: true,
      }),
    ],
    children: [
      ...valueTypes.map((type) => createTemplateSlot(type, false)),
      ...objectTypes.map((type) => createTemplateSlot(type, true)),
    ],
  }),
});

function createTemplateSlot(type: Type, isObject: boolean): SlotData {
  const templateId = new RefId();
  const nodeId = new RefId();
  const inputId = new RefId();
  return new SlotData({
    id: templateId,
    name: `${isObject ? "Object" : "Value"}Relay<${type.niceTypeName()}>`,
    components: [
      new DynamicReferenceVariable({
        innerType: Type.Slot,
        variableName:
          "Template/" +
          type
            .toString()
            .replace(
              /[<>\[\]]/g,
              (ch) =>
                ({ "<": "_LT_", ">": "_GT_", "[": "_LB_", "]": "_RB_" }[ch]!)
            ),
        reference: templateId,
      }),
      new DynamicVariableSpace(),
      new ProtoFluxDataRelay({
        type: isObject
          ? ProtoFluxDataRelay.ObjectRelay(type)
          : ProtoFluxDataRelay.ValueRelay(type),
        id: nodeId,
        input: new FieldData(null, inputId),
      }),
      new DynamicReferenceVariable({
        innerType: Type.ProtoFluxNode,
        variableName: "Node",
        reference: nodeId,
      }),
      new DynamicReferenceVariable({
        innerType: Type.INodeOutput,
        variableName: "Output",
        reference: nodeId,
      }),
      new DynamicReferenceVariable({
        innerType: Type.ISyncRef,
        variableName: "Input",
        reference: inputId,
      }),
      Tag.DestroyBlock(),
      Tag.DuplicateBlock(),
    ],
  });
}

const rPack = new ResonitePackage();

rPack.writeAsset("main", (writer) =>
  DataTreeConverter.toRawBrson(writer, root)
);

rPack.writeMainRecord({
  ...emptyRecordPackage(
    "R-Main",
    "U-1QbdepR26LI",
    ResonitePackage.getAssetURL("main")
  ),
  name: "Data Relay Templates",
});

rPack.savePackage("relays.resonitepackage");
