import { type SchemaTypeDefinition } from "sanity";
import { about } from "./about";
import { localizedString, localizedText } from "./localized";
import { project } from "./project";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [localizedString, localizedText, project, about],
};
