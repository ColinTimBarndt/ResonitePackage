import {
  ResonitePackage,
  emptyRecordPackage,
  DataTreeConverter,
  RefId,
  Type,
} from "resonitepackage";
import {
  DynamicReferenceVariable,
  DynamicVariableSpace,
} from "resonitepackage/components";
import {
  DataTreeRoot,
  SlotData,
  FieldListData,
} from "resonitepackage/datatree";

const bagId = new RefId();
const root = new DataTreeRoot({
  versionNumber: "2025.3.25.1348",
  object: new SlotData({
    name: "Component Bag Exposed",
    components: new FieldListData([], bagId),
    children: [
      new SlotData({
        name: "<color=hero.cyan>Variables</color>",
        components: [
          new DynamicVariableSpace(),
          new DynamicReferenceVariable({
            innerType: Type.WorkerBag(Type.Component),
            variableName: "Bag",
            reference: bagId,
          }),
        ],
      }),
    ],
  }),
});

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
  name: "Component Bag Exposed",
});

rPack.savePackage("ComponentBag.resonitepackage");
