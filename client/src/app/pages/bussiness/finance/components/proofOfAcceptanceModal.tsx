"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { payRollInterface } from "@/app/types/payroll.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { useImageField } from "@/lib/validation/useFileField";
import { FieldError } from "@/components/ui/field-error";
import useUserStore from "@/app/store/useUserStore";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProofModal({
  payroll,
  refetch,
}: {
  payroll: payRollInterface;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [type, setType] = useState("Cash");
  const [employee, setEmployee] = useState("");

  const noProofPayslip = payroll.payroll.filter(
    (item) => !item.proofOfAcceptance,
  );

  const {
    file: img,
    preview,
    error: imgError,
    onSelect,
    reset,
  } = useImageField();

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.put("/account/payroll/proof", data),
    onSuccess: () => {
      successAlert("proof recorded");
      setOpen(false);
      reset();
      refetch();
      setType("Cash");
      setEmployee("");
    },
    onError: () => errorAlert("error occur"),
  });

  const handleUploadImg = () => {
    if (!img) return errorAlert(imgError ?? "Please choose an image");
    if (!employee) return errorAlert("Please select an employee");
    const formData = new FormData();
    formData.append("file", img);
    formData.append("id", payroll._id);
    formData.append("payrollId", employee);
    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          {" "}
          Proof ({noProofPayslip.length}/{payroll.payroll.length}){" "}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="text-center">
          <DialogTitle>Proof of Salary Acceptance </DialogTitle>
          <DialogDescription>
            {" "}
            {payroll.payroll[0].periodFrom} to{" "}
            {payroll.payroll[0].periodTo}{" "}
          </DialogDescription>
        </DialogHeader>

        {/* CENTER CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-[350px] space-y-4">
            {/* IMAGE PREVIEW */}
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full  h-[300px] object-cover  m-auto"
              />
            ) : (
              <div className="w-full  h-[300px] border  flex items-center justify-center text-muted-foreground m-auto">
                No image
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => onSelect(e.target.files?.[0] || null)}
                aria-invalid={!!imgError}
                className=""
              />

              <Select onValueChange={setType} value={type}>
                <SelectTrigger className="">
                  <SelectValue placeholder=" Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"Cash"}> Cash </SelectItem>
                  <SelectItem value={"Gcash"}> Gcash </SelectItem>
                  <SelectItem value={"Paymaya"}> Paymaya </SelectItem>
                  <SelectItem value={"Bank Transfer"}>
                    {" "}
                    Bank Transfer{" "}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select onValueChange={setEmployee} value={employee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {noProofPayslip.map((item) => (
                  //@ts-ignore
                  <SelectItem key={item._id} value={item._id}>
                    {" "}
                    {item.name}{" "}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError>{imgError}</FieldError>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            disabled={uploadMutation.isPending || !img || !employee}
            className="w-full "
            onClick={handleUploadImg}
          >
            {" "}
            {uploadMutation.isPending && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}{" "}
            Submit{" "}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
