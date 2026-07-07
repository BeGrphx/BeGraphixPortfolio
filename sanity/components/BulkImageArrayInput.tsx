"use client";

import { UploadIcon } from "@sanity/icons";
import { Box, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { useCallback, useRef, useState } from "react";
import {
  type ArrayOfObjectsInputProps,
  set,
  useClient,
} from "sanity";
import { randomKey } from "@sanity/util/content";

function getImageFiles(fileList: FileList | File[] | null | undefined): File[] {
  if (!fileList) return [];
  return Array.from(fileList).filter((file) => file.type.startsWith("image/"));
}

export function BulkImageArrayInput(props: ArrayOfObjectsInputProps) {
  const { onChange, value = [], readOnly, renderDefault } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const images = getImageFiles(files);
      if (!images.length || readOnly) return;

      setUploading(true);
      try {
        const uploaded = await Promise.all(
          images.map((file) =>
            client.assets.upload("image", file, { filename: file.name }),
          ),
        );

        const newItems = uploaded.map((asset) => ({
          _type: "image" as const,
          _key: randomKey(),
          asset: {
            _type: "reference" as const,
            _ref: asset._id,
          },
        }));

        onChange(set([...(value ?? []), ...newItems]));
      } finally {
        setUploading(false);
        setDragging(false);
      }
    },
    [client, onChange, readOnly, value],
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
            accept="image/*"
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
                    Glissez-déposez plusieurs images ici
                  </Text>
                  <Text size={1} muted>
                    ou cliquez pour en sélectionner plusieurs d&apos;un coup
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
