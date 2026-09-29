"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
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
  INVENTORY_UNITS,
  formatQuantity,
  isMeasuredUnit,
  itemCountOf,
  quantityInputMode,
  totalFromItems,
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
import { updateItemWithPriceSchemaFor } from "@/lib/validation/schemas/inventory";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";

const formValues = (inventory: inventoryInterface) => ({
  item: inventory.item,
  category: inventory.category,
  type: inventory.type,
  stocks: String(inventory.stocks ?? ""),
  itemCount: inventory.quantityPerItem ? String(itemCountOf(inventory)) : "",
  quantityPerItem: inventory.quantityPerItem
    ? String(inventory.quantityPerItem)
    : "",
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

  const schema = useMemo(
    () =>
      updateItemWithPriceSchemaFor({
        type: inventory.type,
        stocks: inventory.stocks,
        safeStock: inventory.safeStock,
        quantityPerItem: inventory.quantityPerItem ?? null,
      }),
    [
      inventory.type,
      inventory.stocks,
      inventory.safeStock,
      inventory.quantityPerItem,
    ],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useZodForm(schema, {
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

  const unitOptions: string[] = (INVENTORY_UNITS as readonly string[]).includes(
    inventory.type,
  )
    ? [...INVENTORY_UNITS]
    : [inventory.type, ...INVENTORY_UNITS];

  const selectedUnit = watch("type") || inventory.type;
  const [watchedStocks, watchedItemCount, watchedPerItem, watchedPrice] = watch([
    "stocks",
    "itemCount",
    "quantityPerItem",
    "price",
  ]);
  const measured = isMeasuredUnit(selectedUnit);
  const usesItems = measured && (watchedPerItem ?? "").trim() !== "";
  const perItemNum = Number(watchedPerItem) || 0;
  const itemCountNum = Number(watchedItemCount) || 0;
  const previewTotal = usesItems
    ? totalFromItems(itemCountNum, perItemNum)
    : Number(watchedStocks) || 0;

  const updateMutation = useMutation({
    mutationFn: (inventory: inventoryInterface & { itemCount?: number }) =>
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
      itemCount: values.itemCount,
      stocks: values.stocks,
      quantityPerItem: values.quantityPerItem,
      category: values.category,
      type: values.type,
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
            <h1 className="font-bold text-text"> Item Name </h1>
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

          <div className="space-y-2 mt-2">
            <Label>Unit</Label>
            <Controller
              control={control}
              name="type"
              rules={{
                deps: ["stocks", "safeStock", "itemCount", "quantityPerItem"],
              }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className=" w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.type?.message}</FieldError>
          </div>

          {measured && (
            <div className="mt-3 w-full">
              <h1 className="font-bold text-text"> Amount per Item </h1>
              <div className="flex items-center gap-2">
                <Input
                  {...register("quantityPerItem", {
                    deps: ["itemCount", "stocks"],
                  })}
                  inputMode="decimal"
                  aria-invalid={!!errors.quantityPerItem}
                  placeholder="e.g. 50"
                  className="w-full"
                />
                <span className="text-sm text-text-muted whitespace-nowrap">
                  {selectedUnit}
                </span>
              </div>
              <FieldError>{errors.quantityPerItem?.message}</FieldError>
              {!usesItems && (
                <p className="text-[11px] text-text-muted mt-1">
                  How much one bottle/container holds. Leave empty to enter the
                  total amount instead.
                </p>
              )}
            </div>
          )}

          {usesItems ? (
            <div className="mt-3 w-full">
              <h1 className="font-bold text-text"> Number of Items </h1>
              <Input
                {...register("itemCount", { deps: ["quantityPerItem"] })}
                inputMode="decimal"
                aria-invalid={!!errors.itemCount}
                placeholder="e.g. 10"
                className="w-full"
              />
              <FieldError>{errors.itemCount?.message}</FieldError>
            </div>
          ) : (
            <div className="mt-3 w-full">
              <h1 className="font-bold text-text">
                {" "}
                {measured ? "Total Quantity" : "Quantity"}{" "}
              </h1>
              <div className="flex items-center gap-2">
                <Input
                  {...register("stocks")}
                  inputMode={quantityInputMode(selectedUnit)}
                  aria-invalid={!!errors.stocks}
                  placeholder="amount on hand"
                  className="w-full"
                />
                <span className="text-sm text-text-muted whitespace-nowrap">
                  {selectedUnit}
                </span>
              </div>
              <FieldError>{errors.stocks?.message}</FieldError>
            </div>
          )}

          {usesItems && (
            <div className="mt-3 flex items-center justify-between gap-3 border border-border bg-surface-alt px-3 py-2">
              <span className="text-xs text-text-muted">Total Quantity</span>
              <span className="text-sm text-text" aria-live="polite">
                {formatQuantity(itemCountNum)} × {formatQuantity(perItemNum)}{" "}
                {selectedUnit} ={" "}
                <span className="text-gold">
                  {formatQuantity(previewTotal)} {selectedUnit}
                </span>
              </span>
            </div>
          )}

          <div className="mt-3 w-full">
            <h1 className="font-bold text-text">
              {" "}
              Price per {selectedUnit}{" "}
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
            {usesItems && perItemNum > 0 && (
              <p className="text-[11px] text-text-muted mt-1">
                ≈ ₱
                {((Number(watchedPrice) || 0) * perItemNum).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}{" "}
                per item ({formatQuantity(perItemNum)} {selectedUnit})
              </p>
            )}
          </div>

          <div className="mt-3 w-full">
            <h1 className="font-bold text-text"> Safe Stocks </h1>
            <div className="flex items-center gap-2">
              <Input
                {...register("safeStock")}
                inputMode={quantityInputMode(selectedUnit)}
                aria-invalid={!!errors.safeStock}
                placeholder="safe stock level"
                className="w-full"
              />
              <span className="text-sm text-text-muted whitespace-nowrap">
                {selectedUnit}
              </span>
            </div>
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
