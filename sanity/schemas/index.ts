import { type SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { about } from "./about";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, about],
};
