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

function getVideoFiles(fileList: FileList | File[] | null | undefined): File[] {
  if (!fileList) return [];
  return Array.from(fileList).filter(
    (file) =>
      file.type.startsWith("video/") ||
      /\.(mp4|webm|mov)$/i.test(file.name),
  );
}

interface BulkVideoInputOptions {
  itemType: string;
  dropTitle: string;
  dropSubtitle: string;
}

export function createBulkVideoArrayInput({
  itemType,
  dropTitle,
  dropSubtitle,
}: BulkVideoInputOptions) {
  return function BulkVideoArrayInput(props: ArrayOfObjectsInputProps) {
    const { onChange, value = [], readOnly, renderDefault } = props;
    const client = useClient({ apiVersion: "2024-01-01" });
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const uploadFiles = useCallback(
      async (files: FileList | File[]) => {
        const videos = getVideoFiles(files);
        if (!videos.length || readOnly) return;

        setUploading(true);
        try {
          const uploaded = await Promise.all(
            videos.map((file) =>
              client.assets.upload("file", file, {
                filename: file.name,
                contentType: file.type || "video/mp4",
              }),
            ),
          );

          const newItems = uploaded.map((asset, index) => ({
            _type: itemType,
            _key: randomKey(),
            title: videos[index]?.name.replace(/\.[^.]+$/, "") || "Vidéo",
            videoFile: {
              _type: "file" as const,
              asset: {
                _type: "reference" as const,
                _ref: asset._id,
              },
            },
          }));

          onChange(set([...(value ?? []), ...newItems]));
        } catch (error) {
          toast.push({
            status: "error",
            title: "Upload vidéo impossible",
            description:
              error instanceof Error
                ? error.message
                : "Réessayez ou uploadez via le champ « Fichier vidéo ».",
          });
        } finally {
          setUploading(false);
          setDragging(false);
        }
      },
      [client, itemType, onChange, readOnly, toast, value],
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
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
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
                      {dropTitle}
                    </Text>
                    <Text size={1} muted>
                      {dropSubtitle}
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
  };
}

export const BulkVideoArrayInput = createBulkVideoArrayInput({
  itemType: "videoItem",
  dropTitle: "Glissez-déposez vos vidéos MP4/WebM ici",
  dropSubtitle: "Lecteur complet en bas de la page projet",
});

export const BulkLoopVideoArrayInput = createBulkVideoArrayInput({
  itemType: "loopVideoItem",
  dropTitle: "Glissez-déposez vos loops MP4/WebM ici",
  dropSubtitle: "Grille en boucle en haut — comme les images",
});
