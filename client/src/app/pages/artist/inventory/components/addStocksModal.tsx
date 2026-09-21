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
import { inventoryInterface } from "@/app/types/inventory.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import useUserStore from "@/app/store/useUserStore";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useZodForm } from "@/lib/validation/useZodForm";
import { addStocksSchema } from "@/lib/validation/schemas/inventory";
import { FieldError } from "@/components/ui/field-error";

export function AddStocksModal({
  setInventory,
  inventory,
}: {
  inventory: inventoryInterface;
  setInventory: (data: inventoryInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const { user } = useUserStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useZodForm(addStocksSchema, { defaultValues: { stocks: "" } });

  const mutation = useMutation({
    mutationFn: (data: {
      inventoryId: string;
      stocks: number;
      expences: number;
      recordedBy: string;
    }) => axiosInstance.post("/inventory/addStocks", data),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("Stocks Added");
      reset();
      setOpen(false);
    },
    onError: () => errorAlert("error occur"),
  });

  const addStocksHandler = handleSubmit((values) => {
    if (!user) return errorAlert("empty field");
    const recordedBy = "none";
    mutation.mutate({
      inventoryId: inventory._id,
      stocks: values.stocks,
      expences: 0,
      recordedBy,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" " onClick={() => setOpen(true)}>
          <Plus /> Stocks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>

        <div className=" gap-6 mb-6">
          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600"> Stocks </h1>
            <Input
              {...register("stocks")}
              inputMode="numeric"
              aria-invalid={!!errors.stocks}
              placeholder="stocks to add"
              className="w-full"
            />
            <FieldError>{errors.stocks?.message}</FieldError>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            className="w-full"
            onClick={addStocksHandler}
            disabled={!isValid || mutation.isPending}
          >
            {" "}
            Add Stock{" "}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
