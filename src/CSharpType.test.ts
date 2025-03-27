import { describe, it, assert } from "vitest";
import { Type } from "./CSharpType.js";

describe("CSharpType", () => {
  it("Parses valid types", () => {
    assert.deepEqual(
      Type.parse(
        "[ProtoFluxBindings]FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ValueRelay<bool>"
      ),
      new Type("FrooxEngine.ProtoFlux.Runtimes.Execution.Nodes.ValueRelay", {
        namespace: "ProtoFluxBindings",
        generics: [new Type("bool")],
      })
    );

    assert.deepEqual(
      Type.parse(
        "[Namespace]ComplexGenericType<Param$1,[OtherNamespace]Param$2,Param$3<int,bool>,Param$4<int>>"
      ),
      new Type("ComplexGenericType", {
        namespace: "Namespace",
        generics: [
          new Type("Param$1"),
          new Type("Param$2", { namespace: "OtherNamespace" }),
          new Type("Param$3", {
            generics: [new Type("int"), new Type("bool")],
          }),
          new Type("Param$4", {
            generics: [new Type("int")],
          }),
        ],
      })
    );
  });

  it("Does not parse invalid types", () => {
    assert.isNull(Type.parse(""));
    assert.isNull(Type.parse("[asdf]"));
    assert.isNull(Type.parse(".Name"));
    assert.isNull(Type.parse("Name<"));
    assert.isNull(Type.parse("Name<>"));
    assert.isNull(Type.parse("Name<A>>"));
    assert.isNull(Type.parse("Name<A,>"));
  });
});
