import {
  DataTreeConverter,
  ResonitePackage,
  BufferReader,
} from "resonitepackage";

const rPackage = new ResonitePackage(
  "../test_data/ValueRelay_int.resonitepackage"
  //"relays.resonitepackage"
);

const asset = rPackage.readAsset(
  ResonitePackage.getAssetSignature(rPackage.mainRecord!.assetUri)!
);

const reader = new BufferReader(asset);
const data = DataTreeConverter.loadAuto(reader);
console.dir(data, { depth: 10 });
