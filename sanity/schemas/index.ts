import { type SchemaTypeDefinition } from "sanity";
import { about } from "./about";
import { localizedString, localizedText } from "./localized";
import { project } from "./project";
import { siteSettings } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [localizedString, localizedText, project, about, siteSettings],
};
