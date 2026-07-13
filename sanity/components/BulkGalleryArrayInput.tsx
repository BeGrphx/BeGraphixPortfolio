"use client";

import { UploadIcon } from "@sanity/icons";
import { Box, Card, Flex, Spinner, Stack, Text, useToast } from "@sanity/ui";
import { useCallback, useRef, useState } from "react";
import {
  type ArrayOfObjectsInputProps,
  set,
  useClient,
} from "sanity";
import { randomKey } from "@sanity/util/content";

export function BulkGalleryArrayInput(props: ArrayOfObjectsInputProps) {
  const { onChange, value = [], readOnly, renderDefault } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const batch = Array.from(files).filter(
        (file) =>
          file.type.startsWith("image/") ||
          file.type.startsWith("video/") ||
          /\.(mp4|webm|mov)$/i.test(file.name),
      );
      if (!batch.length || readOnly) return;

      setUploading(true);
      try {
        const newItems = await Promise.all(
          batch.map(async (file) => {
            if (file.type.startsWith("image/")) {
              const asset = await client.assets.upload("image", file, {
                filename: file.name,
              });

              return {
                _type: "image" as const,
                _key: randomKey(),
                asset: {
                  _type: "reference" as const,
                  _ref: asset._id,
                },
              };
            }

            const asset = await client.assets.upload("file", file, {
              filename: file.name,
              contentType: file.type || "video/mp4",
            });

            return {
              _type: "galleryLoopItem" as const,
              _key: randomKey(),
              videoFile: {
                _type: "file" as const,
                asset: {
                  _type: "reference" as const,
                  _ref: asset._id,
                },
              },
            };
          }),
        );

        onChange(set([...(value ?? []), ...newItems]));

        const videoCount = newItems.filter(
          (item) => item._type === "galleryLoopItem",
        ).length;
        if (videoCount > 0) {
          toast.push({
            status: "success",
            title: `${videoCount} loop${videoCount > 1 ? "s" : ""} ajoutée${videoCount > 1 ? "s" : ""}`,
            description:
              "Publiez le projet : la compression et la mise en ligne R2 se feront automatiquement.",
          });
        }
      } finally {
        setUploading(false);
        setDragging(false);
      }
    },
    [client, onChange, readOnly, toast, value],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);
      void uploadFiles(event.dataTransfer.files);
    },
    [uploadFiles],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
  }, []);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        void uploadFiles(event.target.files);
        event.target.value = "";
      }
    },
    [uploadFiles],
  );

  return (
    <Stack space={4}>
      {!readOnly && (
        <Card
          padding={4}
          radius={2}
          tone={dragging ? "primary" : "transparent"}
          border
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{
            cursor: uploading ? "wait" : "pointer",
            borderStyle: "dashed",
          }}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            multiple
            hidden
            onChange={onFileChange}
          />
          <Flex align="center" justify="center" gap={3} padding={3}>
            {uploading ? (
              <>
                <Spinner muted />
                <Text size={1}>Upload en cours…</Text>
              </>
            ) : (
              <>
                <Text size={1}>
                  <UploadIcon />
                </Text>
                <Box>
                  <Text size={1} weight="semibold">
                    Glissez-déposez images et loops MP4 ici
                  </Text>
                  <Text size={1} muted>
                    Réordonnez ensuite la grille ci-dessous pour choisir l&apos;ordre
                  </Text>
                </Box>
              </>
            )}
          </Flex>
        </Card>
      )}

      {renderDefault(props)}
    </Stack>
  );
}
