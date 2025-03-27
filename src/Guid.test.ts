import { describe, it, assert } from "vitest";
import { Guid } from "./Guid.js";

describe("Guid", () => {
  const getGuidBytes = () =>
    new Uint8Array([
      0xde, 0xad, 0xbe, 0xef, 0xc0, 0xfe, 0x13, 0x37, 0x01, 0x23, 0x45, 0x67,
      0x89, 0xab, 0xcd, 0xef,
    ]);
  const GUID_STRING = "efbeadde-fec0-3713-0123-456789abcdef";

  it("Stringifies", () => {
    const result = new Guid(getGuidBytes()).toString();
    assert.strictEqual(result, GUID_STRING);
  });

  it("Parses", () => {
    const result = Guid.parse(GUID_STRING);
    assert.deepEqual(result.toBytes(), getGuidBytes());
  });
});
