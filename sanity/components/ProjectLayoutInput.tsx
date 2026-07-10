"use client";

import { Box, Button, Card, Flex, Stack, Tab, TabList, TabPanel, Text } from "@sanity/ui";
import { useCallback, useMemo, useState } from "react";
import {
  type ArrayOfObjectsInputProps,
  PatchEvent,
  insert,
  set,
  useFormValue,
} from "sanity";
import {
  DEFAULT_PROJECT_LAYOUT,
  PROJECT_LAYOUT_BLOCK_LABELS,
  type ProjectLayoutBlockType,
} from "@/lib/project-layout";

type LayoutRow = { _key: string; _type: ProjectLayoutBlockType };

function makeBlock(type: ProjectLayoutBlockType): LayoutRow {
  return { _type: type, _key: `${type}-${Math.random().toString(36).slice(2, 9)}` };
}

function countForType(
  type: ProjectLayoutBlockType,
  doc: Record<string, unknown> | null,
): string {
  if (!doc) return "Vide";

  switch (type) {
    case "layoutVideoGallery": {
      const n = (doc.videoGallery as unknown[] | undefined)?.length ?? 0;
      return n ? `${n} vidéo${n > 1 ? "s" : ""}` : "Aucune vidéo";
    }
    case "layoutText": {
      const hasDesc = Boolean((doc.description as { fr?: string })?.fr);
      const hasCredits = Boolean((doc.credits as { fr?: string })?.fr);
      if (hasDesc && hasCredits) return "Description + crédits";
      if (hasDesc) return "Description";
      if (hasCredits) return "Crédits";
      return "Texte vide";
    }
    case "layoutGallery": {
      const n = (doc.gallery as unknown[] | undefined)?.length ?? 0;
      return n ? `${n} élément${n > 1 ? "s" : ""}` : "Galerie vide";
    }
    case "layoutPdf":
      return doc.pdfFile ? "PDF ajouté" : "Pas de PDF";
    case "layoutMedia": {
      const n = (doc.media as unknown[] | undefined)?.length ?? 0;
      return n ? `${n} média${n > 1 ? "s" : ""}` : "Aucun média";
    }
    default:
      return "";
  }
}

function PreviewWireframe({
  rows,
  doc,
}: {
  rows: LayoutRow[];
  doc: Record<string, unknown> | null;
}) {
  const title =
    (doc?.title as { fr?: string } | undefined)?.fr || "Titre du projet";

  return (
    <Card padding={4} radius={3} tone="transparent" border>
      <Stack space={3}>
        <Text size={1} muted>
          Aperçu de la page (brouillon)
        </Text>
        <Box padding={3} style={{ background: "#111", borderRadius: 8 }}>
          <Stack space={3}>
            <Box padding={3} style={{ textAlign: "center" }}>
              <Text size={2} weight="semibold" style={{ color: "#fff" }}>
                {title}
              </Text>
              <Text size={0} muted style={{ marginTop: 6, color: "#888" }}>
                Client · Date · Durée
              </Text>
            </Box>

            {rows.map((row) => (
              <Card
                key={row._key}
                padding={3}
                radius={2}
                tone="primary"
                style={{ opacity: countForType(row._type, doc).includes("vide") || countForType(row._type, doc).startsWith("Aucun") || countForType(row._type, doc) === "Pas de PDF" || countForType(row._type, doc) === "Texte vide" ? 0.35 : 1 }}
              >
                <Text size={1} weight="medium">
                  {PROJECT_LAYOUT_BLOCK_LABELS[row._type]}
                </Text>
                <Text size={0} muted>
                  {countForType(row._type, doc)}
                </Text>
                {row._type === "layoutVideoGallery" && (
                  <Box
                    marginTop={2}
                    style={{
                      height: 72,
                      background: "#222",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: 11,
                    }}
                  >
                    ▶ Lecteur vidéo
                  </Box>
                )}
                {row._type === "layoutGallery" && (
                  <Flex gap={2} marginTop={2}>
                    {[1, 2].map((i) => (
                      <Box
                        key={i}
                        style={{
                          flex: 1,
                          height: 48,
                          background: "#222",
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </Flex>
                )}
              </Card>
            ))}

            <Box
              padding={2}
              style={{
                textAlign: "center",
                background: "#f2f2f2",
                color: "#111",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.15em",
              }}
            >
              HOME
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export function ProjectLayoutInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, readOnly } = props;
  const [tab, setTab] = useState<"blocks" | "preview">("blocks");
  const doc = useFormValue([]) as Record<string, unknown> | null;

  const rows = (value as LayoutRow[]) ?? [];

  const resetDefault = useCallback(() => {
    if (readOnly) return;
    onChange(
      PatchEvent.from(
        set(DEFAULT_PROJECT_LAYOUT.map((type) => makeBlock(type))),
      ),
    );
  }, [onChange, readOnly]);

  const addMissing = useCallback(
    (type: ProjectLayoutBlockType) => {
      if (readOnly || rows.some((r) => r._type === type)) return;
      onChange(PatchEvent.from(insert([makeBlock(type)], "after", [-1])));
    },
    [onChange, readOnly, rows],
  );

  const availableToAdd = useMemo(
    () =>
      DEFAULT_PROJECT_LAYOUT.filter(
        (type) => !rows.some((row) => row._type === type),
      ),
    [rows],
  );

  return (
    <Stack space={4}>
      <TabList space={2}>
        <Tab
          aria-controls="layout-blocks-panel"
          id="layout-blocks-tab"
          label="Ordre des blocs"
          onClick={() => setTab("blocks")}
          selected={tab === "blocks"}
        />
        <Tab
          aria-controls="layout-preview-panel"
          id="layout-preview-tab"
          label="Aperçu"
          onClick={() => setTab("preview")}
          selected={tab === "preview"}
        />
      </TabList>

      {tab === "blocks" ? (
        <TabPanel aria-labelledby="layout-blocks-tab" id="layout-blocks-panel">
          <Stack space={3}>
            <Text size={1} muted>
              Glissez les blocs pour définir l&apos;ordre d&apos;affichage sur
              la page projet. Le contenu de chaque bloc se remplit dans les
              champs ci-dessous.
            </Text>

            {rows.length === 0 && (
              <Card padding={3} tone="caution" radius={2}>
                <Text size={1}>
                  Aucun bloc — utilisez « Ordre par défaut » ou ajoutez des
                  blocs.
                </Text>
              </Card>
            )}

            <Stack space={2}>
              {renderDefault({
                ...props,
                arrayFunctions: () => null,
              })}
            </Stack>

            <Flex gap={2} wrap="wrap">
              <Button
                text="Ordre par défaut"
                mode="ghost"
                tone="primary"
                disabled={readOnly}
                onClick={resetDefault}
              />
              {availableToAdd.map((type) => (
                <Button
                  key={type}
                  text={`+ ${PROJECT_LAYOUT_BLOCK_LABELS[type]}`}
                  mode="bleed"
                  disabled={readOnly}
                  onClick={() => addMissing(type)}
                />
              ))}
            </Flex>
          </Stack>
        </TabPanel>
      ) : (
        <TabPanel aria-labelledby="layout-preview-tab" id="layout-preview-panel">
          <PreviewWireframe rows={rows} doc={doc} />
        </TabPanel>
      )}
    </Stack>
  );
}
