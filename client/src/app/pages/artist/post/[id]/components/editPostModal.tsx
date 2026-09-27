"use client";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import { priceField } from "@/lib/validation/schemas/booking";
import { firstError, percentField, countField } from "@/lib/validation/fields";
import {
  aiSizeHeightSchema,
  aiSizeWidthSchema,
} from "@/app/hooks/artistAiAnalysisHooks";
import { apiErrorMessage } from "@/app/utils/customFunction";

const downPaymentSchema = percentField("Down payment");
const sessionHrsSchema = countField("Session hours", { min: 1, max: 24 });
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImageIcon,
  Plus,
  X,
  Clock,
  Layers,
  Tag,
  Edit,
  Ruler,
} from "lucide-react";
import { useState, useEffect } from "react";
import { postInterface } from "@/app/types/post.type";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";

interface dataInterface {
  tags: string[];
  category: string;
  sessions: number[];
  price: number;
  downPercentage: number;
  sizeWidthCm?: number;
  sizeHeightCm?: number;
}

const initialSize = (value?: number | null) =>
  typeof value === "number" && value > 0 ? String(value) : "";

export function EditPostmodal({
  post,
  setPost,
}: {
  post: postInterface;
  setPost: (data: postInterface) => void;
}) {
  const [open, setOpen] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post.tags);
  const [category, setCategory] = useState(post.category);
  const [price, setPrice] = useState(String(post.price ?? ""));
  const [downpayment, setDownpayment] = useState(
    String(post.downPercentage ?? ""),
  );
  const [sessionInput, setSessionInput] = useState("");
  const [sessions, setSessions] = useState<number[]>(
    post.sessions.map((s) => Math.max(1, Math.floor(s))),
  );
  const [sizeWidthCm, setSizeWidthCm] = useState(
    initialSize(post.sizeWidthCm ?? post.aiEstimate?.sizeWidthCm),
  );
  const [sizeHeightCm, setSizeHeightCm] = useState(
    initialSize(post.sizeHeightCm ?? post.aiEstimate?.sizeHeightCm),
  );

  const addTag = () => {
    if (tags.length >= 5) return errorAlert("the maximum tags is 5");
    if (!tagInput.trim() || tags.includes(tagInput.trim()))
      return errorAlert("invalid");
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addSession = () => {
    const parsed = sessionHrsSchema.safeParse(sessionInput);
    if (!parsed.success)
      return errorAlert(
        parsed.error.issues[0]?.message ?? "Enter valid session hours",
      );
    setSessions([...sessions, parsed.data]);
    setSessionInput("");
  };

  // Remove a session
  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const updateMutation = useMutation({
    mutationFn: (data: dataInterface) =>
      axiosInstance.put(`/post/${post._id}`, data),
    onSuccess: (response) => {
      setPost(response.data);
      successAlert("saved Changes");
      setOpen(false);
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const hasSize = !!sizeWidthCm || !!sizeHeightCm;
  const sizeWidthError = hasSize
    ? firstError(aiSizeWidthSchema, sizeWidthCm, { showWhenEmpty: true })
    : undefined;
  const sizeHeightError = hasSize
    ? firstError(aiSizeHeightSchema, sizeHeightCm, { showWhenEmpty: true })
    : undefined;

  const priceError = firstError(priceField, price);
  const downPaymentError = firstError(downPaymentSchema, downpayment);

  const handleSave = () => {
    const parsedPrice = priceField.safeParse(price);
    const parsedDown = downPaymentSchema.safeParse(downpayment);
    if (!category || sessions.length === 0)
      return errorAlert("Please add at least one session");
    const parsedWidth = aiSizeWidthSchema.safeParse(sizeWidthCm);
    const parsedHeight = aiSizeHeightSchema.safeParse(sizeHeightCm);
    if (hasSize && (!parsedWidth.success || !parsedHeight.success))
      return errorAlert("Please enter a valid tattoo width and height");
    if (!parsedPrice.success)
      return errorAlert(
        parsedPrice.error.issues[0]?.message ?? "Please enter a valid price",
      );
    if (!parsedDown.success)
      return errorAlert(
        parsedDown.error.issues[0]?.message ??
          "Please enter a valid down payment",
      );
    updateMutation.mutate({
      tags,
      sessions,
      category,
      price: parsedPrice.data,
      downPercentage: parsedDown.data,
      ...(parsedWidth.success && parsedHeight.success
        ? { sizeWidthCm: parsedWidth.data, sizeHeightCm: parsedHeight.data }
        : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" text-lg " onClick={() => setOpen(true)}>
          <Edit /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className=" gap-6 mb-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className=" w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realism">Realism</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="blackwork">Blackwork</SelectItem>
                <SelectItem value="traditional">Traditional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mt-3">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Price
            </Label>

            <div className="flex flex-col gap-1">
              <MoneyInput
                placeholder="Final price"
                value={price}
                onChange={setPrice}
                aria-invalid={!!priceError}
              />
              <FieldError>{priceError}</FieldError>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Tattoo Size (cm)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Width"
                  inputMode="decimal"
                  value={sizeWidthCm}
                  aria-invalid={!!sizeWidthError}
                  onChange={(e) =>
                    setSizeWidthCm(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <FieldError>{sizeWidthError}</FieldError>
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Height"
                  inputMode="decimal"
                  value={sizeHeightCm}
                  aria-invalid={!!sizeHeightError}
                  onChange={(e) =>
                    setSizeHeightCm(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <FieldError>{sizeHeightError}</FieldError>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Down payment Percentage
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                placeholder="0 - 100"
                value={downpayment}
                inputMode="decimal"
                aria-invalid={!!downPaymentError}
                onChange={(e) => setDownpayment(e.target.value)}
              />
              <FieldError>{downPaymentError}</FieldError>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Sessions (Input Time per Secssion)
            </Label>

            <div className="flex gap-2">
              <Input
                placeholder="Hours per session (e.g. 2)"
                value={sessionInput}
                inputMode="numeric"
                onChange={(e) =>
                  setSessionInput(e.target.value.replace(/\D/g, ""))
                }
              />
              <Button type="button" onClick={addSession}>
                <Plus />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {sessions.map((session, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="shadow flex items-center gap-1 hover:text-red-500 cursor-pointer"
                  onClick={() => removeSession(index)}
                >
                  Session {index + 1} ({session} {session != 1 ? "hrs" : "hr"})
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2 mt-5">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>

            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <Button type="button" onClick={addTag}>
                <Plus />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="shadow  flex items-center gap-1  hover:text-red-500"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" className="w-full" onClick={handleSave}>
            {" "}
            Save Changes{" "}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
