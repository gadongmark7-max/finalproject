"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, LoaderCircle, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import { inventoryInterface } from "@/app/types/inventory.type";
import { firstError } from "@/lib/validation/fields";
import { inventoryPriceSchema } from "@/lib/validation/schemas/inventory";

const formatUnitPrice = (n: number) =>
  `₱${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function EditPriceCell({
  inventory,
  setInventory,
}: {
  inventory: inventoryInterface;
  setInventory: (data: inventoryInterface[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const mutation = useMutation({
    mutationFn: (price: number) =>
      axiosInstance.put("/inventory", {
        inventory: { _id: inventory._id, price },
        recordedBy: "none",
      }),
    onSuccess: (response) => {
      setInventory(response.data);
      successAlert("price updated");
      setEditing(false);
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not update the price")),
  });

  const error = firstError(inventoryPriceSchema, value, {
    showWhenEmpty: true,
  });

  const startEditing = () => {
    setValue(String(inventory.price ?? 0));
    setEditing(true);
  };

  const save = () => {
    const parsed = inventoryPriceSchema.safeParse(value);
    if (!parsed.success) return;
    if (parsed.data === inventory.price) return setEditing(false);
    mutation.mutate(parsed.data);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-text">
          {formatUnitPrice(inventory.price ?? 0)}
          <span className="text-text-dim"> / {inventory.type}</span>
        </span>
        <button
          onClick={startEditing}
          aria-label={`Edit price of ${inventory.item}`}
          className="text-text-dim hover:text-gold transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-[180px] space-y-1">
      <div className="flex items-center gap-1.5">
        <MoneyInput
          autoFocus
          value={value}
          onChange={setValue}
          aria-invalid={!!error}
          aria-label={`Price per ${inventory.type}`}
          className="h-8 w-28"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <Button
          size="icon"
          className="h-8 w-8"
          onClick={save}
          disabled={!!error || mutation.isPending}
          aria-label="Save price"
        >
          {mutation.isPending ? (
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => setEditing(false)}
          disabled={mutation.isPending}
          aria-label="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}
