export * from "./Tag.js";
export * from "./DynamicVariables.js";
export * from "./ProtoFluxNodes.js";
export * from "./UnknownComponent.js";

import * as components from "./index.js";
import { ComponentData } from "./ComponentData.js";

ComponentData.subtypes.push(
  ...Object.values(components).filter(
    (it) => it !== components.UnknownComponent
  ),
  components.UnknownComponent
);
