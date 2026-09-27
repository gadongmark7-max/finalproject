"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  inventoryInterface,
  INVENTORY_CATEGORIES,
} from "@/app/types/inventory.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import useUserStore from "@/app/store/useUserStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useZodForm } from "@/lib/validation/useZodForm";
import { updateItemWithPriceSchema } from "@/lib/validation/schemas/inventory";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";

const formValues = (inventory: inventoryInterface) => ({
  item: inventory.item,
  category: inventory.category,
  stocks: String(inventory.stocks ?? ""),
  safeStock: String(inventory.safeStock ?? ""),
  price: String(inventory.price ?? 0),
});

export function UpdateItemModal({
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
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useZodForm(updateItemWithPriceSchema, {
    defaultValues: formValues(inventory),
  });

  useEffect(() => {
    if (open) reset(formValues(inventory));
  }, [open, inventory, reset]);

  const categoryOptions: string[] = (
    INVENTORY_CATEGORIES as readonly string[]
  ).includes(inventory.category)
    ? [...INVENTORY_CATEGORIES]
    : [inventory.category, ...INVENTORY_CATEGORIES];

  const updateMutation = useMutation({
    mutationFn: (inventory: inventoryInterface) =>
      axiosInstance.put("/inventory", { inventory, recordedBy: "none" }),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("item updated");
      setOpen(false);
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/inventory/${inventory._id}`),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("item deleted");
    },
    onError: () => errorAlert("error occur"),
  });

  const updateHandler = handleSubmit((values) => {
    if (!user) return errorAlert("empty field");
    updateMutation.mutate({
      _id: inventory._id,
      account: user,
      item: values.item,
      stocks: values.stocks,
      category: values.category,
      type: inventory.type,
      safeStock: values.safeStock,
      price: values.price,
    });
  });

  const deleteHandler = () => {
    setOpen(false);
    confirmAlert("you want to delete this Item?", "delete", () => {
      deleteMutation.mutate();
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)} asChild>
        <Button className=""> Edit </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>update Item</SheetTitle>
          <SheetDescription>update item</SheetDescription>
        </SheetHeader>
        <div className=" rounded-lg  shadow-sm w-full m-auto h-[800px] overflow-auto p-2 ">
          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600"> Item Name </h1>
            <Input
              {...register("item")}
              aria-invalid={!!errors.item}
              placeholder="item name"
              className="w-full"
            />
            <FieldError>{errors.item?.message}</FieldError>
          </div>

          <div className="space-y-2 mt-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className=" w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.category?.message}</FieldError>
          </div>

          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600"> Quantity </h1>
            <div className="flex items-center gap-2">
              <Input
                {...register("stocks")}
                inputMode="decimal"
                aria-invalid={!!errors.stocks}
                placeholder="amount on hand"
                className="w-full"
              />
              <span className="text-sm text-text-muted whitespace-nowrap">
                {inventory.type}
              </span>
            </div>
            <FieldError>{errors.stocks?.message}</FieldError>
          </div>

          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600">
              {" "}
              Price per {inventory.type}{" "}
            </h1>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.price}
                  placeholder="0.00"
                />
              )}
            />
            <FieldError>{errors.price?.message}</FieldError>
          </div>

          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600"> Safe Stocks </h1>
            <Input
              {...register("safeStock")}
              inputMode="decimal"
              aria-invalid={!!errors.safeStock}
              placeholder="safe stock level"
              className="w-full"
            />
            <FieldError>{errors.safeStock?.message}</FieldError>
          </div>

          <div className="mt-3 w-full">
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={deleteHandler}
            >
              {" "}
              Delete Item{" "}
            </Button>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={updateHandler}
            disabled={!isValid || updateMutation.isPending}
          >
            Update Item
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
