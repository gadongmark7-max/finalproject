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
import {
  inventoryInterface,
  formatQuantity,
  quantityInputMode,
  totalFromItems,
} from "@/app/types/inventory.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import useUserStore from "@/app/store/useUserStore";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useZodForm } from "@/lib/validation/useZodForm";
import { addStocksSchemaFor } from "@/lib/validation/schemas/inventory";
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

  const perItem = inventory.quantityPerItem ?? null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useZodForm(addStocksSchemaFor(inventory.type, !!perItem), {
    defaultValues: { stocks: "" },
  });
  const addedItems = Number(watch("stocks")) || 0;

  const mutation = useMutation({
    mutationFn: (data: {
      inventoryId: string;
      stocks?: number;
      itemCount?: number;
      expences: number;
      recordedBy: string;
    }) => axiosInstance.post("/inventory/addStocks", data),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("Stocks Added");
      reset();
      setOpen(false);
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const addStocksHandler = handleSubmit((values) => {
    if (!user) return errorAlert("empty field");
    const recordedBy = "none";
    mutation.mutate({
      inventoryId: inventory._id,
      ...(perItem ? { itemCount: values.stocks } : { stocks: values.stocks }),
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
            <h1 className="font-bold text-text">
              {perItem ? " Items to add " : " Quantity to add "}
            </h1>
            <div className="flex items-center gap-2">
              <Input
                {...register("stocks")}
                inputMode={perItem ? "decimal" : quantityInputMode(inventory.type)}
                aria-invalid={!!errors.stocks}
                placeholder="e.g. 10"
                className="w-full"
              />
              <span className="text-sm text-text-muted whitespace-nowrap">
                {perItem ? `× ${formatQuantity(perItem)} ${inventory.type}` : inventory.type}
              </span>
            </div>
            <FieldError>{errors.stocks?.message}</FieldError>
            {perItem && addedItems > 0 && (
              <p className="text-[11px] text-text-muted mt-1">
                Adds {formatQuantity(totalFromItems(addedItems, perItem))}{" "}
                {inventory.type}
              </p>
            )}
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
