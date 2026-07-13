import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { translateDocumentAction } from "./actions/translateDocumentAction";
import { mediaOptimizationBadge } from "./badges/mediaOptimizationBadge";
import { apiVersion, dataset, projectId } from "./env";
import { schema } from "./schemas";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "project" || context.schemaType === "about") {
        return [...prev, translateDocumentAction];
      }
      return prev;
    },
    badges: (prev, context) => {
      if (
        context.schemaType === "project" ||
        context.schemaType === "siteSettings"
      ) {
        return [mediaOptimizationBadge, ...prev];
      }
      return prev;
    },
  },
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
                  { field: "completedAt", direction: "desc" },
                ]),
              ),
            S.listItem()
              .title("À propos")
              .child(
                S.document().schemaType("about").documentId("about"),
              ),
            S.listItem()
              .title("Paramètres du site")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
