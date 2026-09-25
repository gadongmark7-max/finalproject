"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { useQueryClient } from "@tanstack/react-query";
import { useImageField } from "@/lib/validation/useFileField";
import { FieldError } from "@/components/ui/field-error";

export function ChangeProfile({ profile }: { profile: string }) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const {
    file: img,
    preview,
    error: imgError,
    onSelect,
    reset,
  } = useImageField({ initialPreview: profile });

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/account/changeProfilePic", data),
    onSuccess: () => {
      successAlert("profile changed");
      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["artist_profile"] });
    },
    onError: () => errorAlert("error occur"),
  });

  const handleUploadImg = () => {
    if (!img) return errorAlert(imgError ?? "Please choose an image");
    const formData = new FormData();
    formData.append("file", img);
    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img
          src={profile}
          alt="artist profile"
          className="w-42 h-42 object-cover border cursor-pointer hover:opacity-80 hover:scale-105 transition"
          onClick={() => setOpen(true)}
        />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Change Profile</DialogTitle>
        </DialogHeader>

        {/* CENTER CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
            {/* IMAGE PREVIEW */}
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-[300px]  h-[300px] object-cover rounded-full m-auto"
              />
            ) : (
              <div className="w-[300px]  h-[300px] border rounded-full flex items-center justify-center text-muted-foreground m-auto">
                No image
              </div>
            )}

            {/* FILE INPUT */}
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onSelect(e.target.files?.[0] || null)}
              aria-invalid={!!imgError}
              className="mt-4"
            />
            <FieldError>{imgError}</FieldError>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            disabled={uploadMutation.isPending || !img}
            className="w-full "
            onClick={handleUploadImg}
          >
            {" "}
            {uploadMutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}{" "}
            Change Profile{" "}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
