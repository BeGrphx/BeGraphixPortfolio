import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./env";
import { schema } from "./schemas";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenu")
          .items([
            S.listItem()
              .title("Projets")
              .child(
                S.documentTypeList("project").title("Projets").defaultOrdering([
                  { field: "order", direction: "asc" },
                ]),
              ),
            S.listItem()
              .title("À propos")
              .child(
                S.document().schemaType("about").documentId("about"),
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
