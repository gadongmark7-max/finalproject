"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inventoryInterfaceInput,
  inventoryInterface,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from "@/app/types/inventory.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import useUserStore from "@/app/store/useUserStore";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import { useZodForm } from "@/lib/validation/useZodForm";
import { addItemSchema } from "@/lib/validation/schemas/inventory";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";

export function AddItemModal({
  setInventory,
}: {
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
  } = useZodForm(addItemSchema, {
    defaultValues: {
      item: "",
      category: "",
      type: "",
      stocks: "",
      safeStock: "0",
      expences: "0",
    },
  });

  const getPricePerItem = (expenses: number, stocks: number) => {
    if (!stocks || stocks === 0) return 0;
    return expenses / stocks;
  };

  const mutation = useMutation({
    mutationFn: (data: {
      inventory: inventoryInterfaceInput;
      expences: number;
      recordedBy: string;
    }) =>
      axiosInstance.post("/inventory", {
        inventory: data.inventory,
        expences: data.expences,
        recordedBy: data.recordedBy,
      }),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("item added");
      reset();
      setOpen(false);
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const addItemHandler = handleSubmit((values) => {
    if (!user) return errorAlert("empty field");
    const recordedBy = user.name;
    const inventory = {
      account: user._id,
      item: values.item,
      stocks: values.stocks,
      category: values.category,
      type: values.type,
      safeStock: values.safeStock,
      price: getPricePerItem(values.expences, values.stocks),
    };
    mutation.mutate({ inventory, expences: values.expences, recordedBy });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)} asChild>
        <Button>
          {" "}
          <Plus /> Add Item
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Item</SheetTitle>
          <SheetDescription>add item to inventory</SheetDescription>
        </SheetHeader>
        <div className=" rounded-lg  shadow-sm w-full m-auto h-[800px] overflow-auto p-3 ">
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

          <div className="flex gap-3 mt-3">
            <div className="space-y-2">
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
                      {INVENTORY_CATEGORIES.map((category) => (
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

            <div className="space-y-2">
              <Label>types / units</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className=" w-full">
                      <SelectValue placeholder="Select " />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_UNITS.map((unit) => (
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
          </div>

          <div className="flex gap-3">
            <div className="mt-3 w-full">
              <h1 className="font-bold text-stone-600"> Stocks </h1>
              <Input
                {...register("stocks")}
                inputMode="decimal"
                aria-invalid={!!errors.stocks}
                placeholder="initial stocks"
                className="w-full"
              />
              <FieldError>{errors.stocks?.message}</FieldError>
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
          </div>

          <div className="mt-3 w-full">
            <h1 className="font-bold text-stone-600"> Expences </h1>
            <Controller
              control={control}
              name="expences"
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.expences}
                  placeholder="0.00"
                />
              )}
            />
            <FieldError>{errors.expences?.message}</FieldError>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={addItemHandler}
            disabled={!isValid || mutation.isPending}
          >
            Add Item
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
