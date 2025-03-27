import { describe, it, assert } from "vitest";
import { readFileSync } from "fs";
import { DataTreeRoot, SlotData } from "./index.js";
import {
  DynamicReferenceVariable,
  DynamicVariableSpace,
  ProtoFluxDataRelay,
  Tag,
} from "./ComponentData/index.js";
import { SerializationContext } from "../SerializationContext.js";
import { SERIALIZE } from "../Serializable.js";
import { BSON } from "bson";

describe("DataTreeModel", () => {
  const exampleData = Object.freeze(
    BSON.deserialize(readFileSync("test_data/DataTree.bson"), {
      promoteLongs: false,
      promoteValues: false,
    })
  );

  let exampleTree: Readonly<DataTreeRoot>;
  {
    let relay: ProtoFluxDataRelay;
    exampleTree = new DataTreeRoot({
      versionNumber: "2025.3.25.1348",
      object: new SlotData({
        name: "ValueRelay<<color=#00E900>int</color>>",
        active: false,
        components: [
          Tag.DestroyBlock(),
          Tag.DuplicateBlock(),
          (relay = new ProtoFluxDataRelay({
            type: ProtoFluxDataRelay.ValueRelay("int"),
          })),
          new DynamicVariableSpace(),
          new DynamicReferenceVariable({
            innerType: "[FrooxEngine]FrooxEngine.ProtoFlux.INodeOutput",
            variableName: "Output",
            reference: relay.id,
          }),
          new DynamicReferenceVariable({
            innerType: "[FrooxEngine]FrooxEngine.ISyncRef",
            variableName: "Input",
            reference: relay.input.id,
          }),
          new DynamicReferenceVariable({
            innerType: "[FrooxEngine]FrooxEngine.ProtoFlux.ProtoFluxNode",
            variableName: "Node",
            reference: relay.id,
          }),
        ],
      }),
    });
    relay.input.data = relay.id;
    Object.freeze(exampleTree);
  }

  it("Parses", () => {
    const result = DataTreeRoot.schema.safeParse(exampleData);
    assert.isUndefined(result.error, "No Error");
    assert.isTrue(result.success, "Success");

    assert.deepEqual(
      result.data[SERIALIZE](new SerializationContext()),
      exampleData
    );
  });

  it("Serializes", () => {
    const json = exampleTree[SERIALIZE](new SerializationContext());

    assert.deepEqual(json, exampleData);
  });
});
