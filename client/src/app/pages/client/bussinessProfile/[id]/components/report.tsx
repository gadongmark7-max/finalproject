"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useState } from "react"
import { Skull } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert } from "@/app/utils/alert"
import { useImageField } from "@/lib/validation/useFileField"
import { FieldError } from "@/components/ui/field-error"
import { firstError, longText } from "@/lib/validation/fields"

const messageSchema = longText("Message", { min: 10, max: 1000 })

export function ReportButton({ reportedAccount } : { reportedAccount : string }) {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { file, preview, error: fileError, onSelect, reset } = useImageField();

  const messageError = firstError(messageSchema, message);

  const submitMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/account/adminMessage", data),
    onSuccess: () => {
      successAlert("Report Submitted");
      setOpen(false);
      setMessage("");
      reset();
    },
    onError: () => errorAlert("Error occurred"),
  });

  const handleSelect = (value: string) => {
    setMessage(value); // auto fill textarea
  };

  const handleSubmit = () => {
    if (!file)  return errorAlert(fileError ?? "Please attach a proof image")
    const parsedMessage = messageSchema.safeParse(message);
    if (!parsedMessage.success) return errorAlert(parsedMessage.error.issues[0]?.message ?? "Please describe the issue");
    const formData = new FormData();
    formData.append("reportedAccount", reportedAccount);
    formData.append("message", message);
    formData.append("file", file);

    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Skull /> Report
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
          <DialogDescription>
            Describe the issue and attach proof if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          {/* SELECT PRESET */}
          <Select onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select reason..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inappropriate post">
                Inappropriate post
              </SelectItem>
              <SelectItem value="Spam content">
                Spam content
              </SelectItem>
              <SelectItem value="Harassment">
                Harassment
              </SelectItem>
              <SelectItem value="Fake information">
                Fake information
              </SelectItem>
            </SelectContent>
          </Select>

          {/* TEXTAREA */}
          <div>
            <Textarea
              placeholder="Enter message..."
              value={message}
              aria-invalid={!!messageError}
              onChange={(e) => setMessage(e.target.value)}
            />
            <FieldError>{messageError}</FieldError>
          </div>

          {/* FILE INPUT */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gold">Proof (Image)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onSelect(e.target.files?.[0] || null)}
              aria-invalid={!!fileError}
              className="text-sm text-gold"
            />
            <FieldError>{fileError}</FieldError>
          </div>

          {/* IMAGE PREVIEW */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover  rounded-md border"
            />
          )}

        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={submitMutation.isPending || !file || !!messageError}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}