"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { Gallery, type GalleryFile } from "@/components/ui/gallery";
import { UploadImageModal } from "./uploadImageModal";

export default function ImgCard({
  files,
  type,
  addImg,
}: {
  files: GalleryFile[];
  type: string;
  addImg: boolean;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) =>
      axiosInstance.delete(`/account/artistInfo/gallery/${imageId}`),
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["artist_profile"],
        (old: { data: unknown } | undefined) =>
          old ? { ...old, data: response.data } : old,
      );
      successAlert("Image deleted");
    },
    onError: () => errorAlert("Failed to delete image"),
  });

  return (
    <Gallery
      files={files}
      extraItem={addImg ? <UploadImageModal type={type} /> : undefined}
      onDelete={(file) =>
        file._id
          ? deleteMutation.mutateAsync(file._id)
          : Promise.reject(new Error("missing image id"))
      }
    />
  );
}
