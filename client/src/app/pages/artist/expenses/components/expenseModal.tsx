"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
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

import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { useZodForm } from "@/lib/validation/useZodForm";
import { expenseSchema } from "@/lib/validation/schemas/expense";
import {
  AUTO_EXPENSE_CATEGORY,
  EXPENSE_CATEGORIES,
  expenseInterface,
} from "@/app/types/artist.type";

const toDateInputValue = (d: Date) => d.toISOString().slice(0, 10);

export function ExpenseModal({ expense }: { expense?: expenseInterface }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!expense;
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useZodForm(expenseSchema, {
    defaultValues: {
      category: expense?.category || "",
      description: expense?.description || "",
      cost: expense ? String(expense.cost) : "",
      date: expense?.date && /^\d{4}-\d{2}-\d{2}$/.test(expense.date)
        ? expense.date
        : toDateInputValue(new Date()),
      notes: expense?.notes || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: {
      category: string;
      description: string;
      cost: number;
      date: string;
      notes?: string;
    }) =>
      isEdit
        ? axiosInstance.put(`/artist/expenses/${expense!._id}`, values)
        : axiosInstance.post("/artist/expenses", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist_expenses"] });
      successAlert(isEdit ? "Expense updated" : "Expense added");
      if (!isEdit) reset();
      setOpen(false);
    },
    onError: (err: { request?: { response?: string } }) =>
      errorAlert(err?.request?.response || "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/artist/expenses/${expense!._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist_expenses"] });
      successAlert("Expense deleted");
      setOpen(false);
    },
    onError: () => errorAlert("Something went wrong"),
  });

  const submitHandler = handleSubmit((values) => {
    saveMutation.mutate(values);
  });

  const deleteHandler = () => {
    setOpen(false);
    confirmAlert("You want to delete this expense?", "Delete", () => {
      deleteMutation.mutate();
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)} asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        ) : (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Update Expense" : "Add Expense"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update this business expense." : "Record a new business expense."}
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-lg shadow-sm w-full m-auto overflow-auto p-3 space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.filter(
                      // Reserved for automatic booking expenses.
                      (c) =>
                        c !== AUTO_EXPENSE_CATEGORY ||
                        expense?.category === AUTO_EXPENSE_CATEGORY,
                    ).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.category?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              {...register("description")}
              aria-invalid={!!errors.description}
              placeholder="e.g. Tattoo ink restock"
            />
            <FieldError>{errors.description?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Controller
                control={control}
                name="cost"
                render={({ field }) => (
                  <MoneyInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={!!errors.cost}
                    placeholder="0.00"
                  />
                )}
              />
              <FieldError>{errors.cost?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("date")} aria-invalid={!!errors.date} />
              <FieldError>{errors.date?.message}</FieldError>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              placeholder="Any additional details..."
              rows={3}
            />
            <FieldError>{errors.notes?.message}</FieldError>
          </div>

          {isEdit && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-danger-border text-danger-light hover:bg-danger-muted"
              onClick={deleteHandler}
              disabled={deleteMutation.isPending}
            >
              Delete Expense
            </Button>
          )}
        </div>

        <SheetFooter>
          <Button onClick={submitHandler} disabled={!isValid || saveMutation.isPending}>
            {isEdit ? "Save Changes" : "Add Expense"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
