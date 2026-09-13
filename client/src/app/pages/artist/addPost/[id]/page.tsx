"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import { priceField } from "@/lib/validation/schemas/booking";
import {
  firstError,
  moneyField,
  percentField,
  countField,
  selectField,
} from "@/lib/validation/fields";

const rateSchema = moneyField({ label: "Rate" });
const downPaymentSchema = percentField("Down payment");
const qtySchema = countField("Quantity", { min: 1 });
const categorySchema = selectField("an art style", [""]);
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
  LoaderCircle,
  DollarSign,
  Replace,
  Brush,
  Cpu,
  Brain,
  Zap,
  UserCheck,
  UserX,
  Check,
  CheckCircle,
} from "lucide-react";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { convoInterface } from "@/app/types/convo.type";
import useUserStore from "@/app/store/useUserStore";
import { getChatIndex } from "@/app/utils/customFunction";
import {
  artistInfoInterface,
  bussinessInfoInterface,
} from "@/app/types/accounts.type";
import { inventoryInterface } from "@/app/types/inventory.type";
import {
  getInventoryName,
  getInventoryPrice,
  getInventoryType,
} from "@/app/utils/customFunction";
import { TattooDataInterface } from "@/app/types/threejs.type";
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal";
import { smartPricing } from "@/app/utils/smartPricing";
import { ArtStyleSelect } from "@/components/ui/artStyleSelect";
import { tattooAreaCm2 } from "@/app/utils/customFunction";
import { BodyPartSelect } from "@/components/ui/bodyPartSelect";
import { BackButton } from "@/components/ui/back-button";

export default function Page() {
  const [type, setType] = useState("newPost");

  const { user } = useUserStore();

  const params = useParams();
  const paramsId = params.id as string;

  const { data } = useQuery({
    queryKey: ["work_post"],
    queryFn: () => axiosInstance.get(`/works/${paramsId}`),
    enabled: paramsId !== "new",
  });

  useEffect(() => {
    if (paramsId != "new" && data?.data) {
      setType("workPost");
      setPreview(data.data.screenShot);
    }
  }, [data]);

  const [step, setStep] = useState(1);

  const { data: inventoryData } = useQuery({
    queryKey: ["inventoryData"],
    queryFn: async (): Promise<inventoryInterface[]> => {
      const response = await axiosInstance.get(`/inventory/${user?._id}`);
      return response.data;
    },
  });

  const [itemUsed, setItemUsed] = useState<
    { item: string; qty: number; itemId: string; price: number }[]
  >([]);
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("Quantity");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState(0);
  const itemQtyNum = Number(itemQty) || 0;

  const selectItemHanlder = (value: string) => {
    setItemId(value);
    setItemType(getInventoryType(value, inventoryData || []));
    setItemName(getInventoryName(value, inventoryData || []));
    setItemPrice(getInventoryPrice(value, inventoryData || []));
  };

  const addInventoryItem = () => {
    if (!itemId) return errorAlert("no selected item");
    if (!qtySchema.safeParse(itemQty).success)
      return errorAlert("Enter a valid quantity");
    setItemUsed((prev) => {
      const existingItem = prev.find((item) => item.itemId === itemId);
      if (existingItem) {
        return prev.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                qty: item.qty + itemQtyNum,
                item: itemName,
                price: itemPrice,
              }
            : item,
        );
      }

      return [
        ...prev,
        { itemId: itemId, qty: itemQtyNum, item: itemName, price: itemPrice },
      ];
    });
    setItemQty("1");
    setItemPrice(0);
  };

  const removeInventoryItem = (id: string) => {
    setItemUsed((prev) => prev.filter((item) => item.itemId != id));
  };

  const router = useRouter();

  const [postImg, setPostImg] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [artStyle, setArtStyle] = useState("");
  const [price, setPrice] = useState("");
  const [downPercentage, setDownPercentage] = useState("");

  const [sessions, setSessions] = useState<number[]>([1]);

  const [tattooData, setTatooData] = useState<TattooDataInterface | null>(null);

  const [category, setCategory] = useState("");
  const [complexity, setComplexity] = useState(0);
  const [perHour, setPerHour] = useState("50");
  const perHourNum = Number(perHour) || 0;
  const [isColored, setIsColored] = useState(false);
  const [bodyPart, setBodyPart] = useState(tattooData?.meshName || "");

  const [editField, setEditField] = useState(false);

  useEffect(() => {
    if (tattooData) setBodyPart(tattooData.meshName);
  }, [tattooData]);

  const EstimatedPrice = () => {
    if (!tattooData || !category || !perHourNum || !complexity) return false;
    const totalSessionHrs = sessions.reduce((total, item) => total + item, 0);
    const artistRate = totalSessionHrs * perHourNum - perHourNum;
    const itemUsedPrice = itemUsed.reduce(
      (total, item) => total + item.price * item.qty,
      0,
    );
    const sizeCm2 = tattooAreaCm2(tattooData.size);

    const estimatedPrice = smartPricing({
      category: category,
      artistRate: artistRate,
      size: sizeCm2,
      itemUsed: itemUsedPrice,
      designComplexity: complexity,
      isColored: isColored,
      bodyPart: bodyPart,
    });

    return estimatedPrice;
  };

  const postMutation = useMutation({
    mutationFn: (data: FormData) => axiosInstance.post("/post", data),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Post created",
        text: "Your post was added successfully",
      }).then(() => {
        router.push("/pages/artist/myPost");
      });
    },
    onError: () => errorAlert("error accour"),
  });

  const aiMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post("/account/aiAutoFill", data),
    onSuccess: (response) => {
      setCategory(response.data.category);
      setComplexity(response.data.complexity);
      setIsColored(response.data.isColored);
      successAlert("Ai Responded");
    },
    onError: () => errorAlert("error accour"),
  });

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

  const updateSession = (index: number, value: number) => {
    const updated = [...sessions];
    updated[index] = value;
    setSessions(updated);
  };

  const addSession = () => {
    setSessions([...sessions, 1]);
  };

  // Remove a session
  const removeSession = (index: number) => {
    if (sessions.length === 1) return;
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleImageChange = (file: File | null) => {
    setPostImg(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setTatooData(null);
      setEditField(false);
      setCategory("");
      setComplexity(0);
      setIsColored(false);
      setBodyPart("");
    }
  };

  const AiAutoFillHanlder = () => {
    if (!postImg) return errorAlert("Feature Not Available");

    const formData = new FormData();

    formData.append("file", postImg || "none");

    aiMutation.mutate(formData);
  };

  // Field errors are hidden on a pristine, never-submitted form; once the
  // artist tries to upload, every invalid/empty required field lights up at
  // once and clears itself the moment it's fixed — no toast needed for these.
  const [triedSubmit, setTriedSubmit] = useState(false);

  const priceError = firstError(priceField, price, { showWhenEmpty: triedSubmit });
  const rateError = firstError(rateSchema, perHour, { showWhenEmpty: triedSubmit });
  const downPaymentError = firstError(downPaymentSchema, downPercentage, {
    showWhenEmpty: triedSubmit,
  });
  const categoryError = firstError(categorySchema, category, { showWhenEmpty: triedSubmit });
  const tagsError =
    triedSubmit && tags.length === 0 ? "Please enter at least one tag." : undefined;
  const imageError =
    triedSubmit && !postImg && type === "newPost"
      ? "Please select an image."
      : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    const parsedPrice = priceField.safeParse(price);
    const parsedDown = downPaymentSchema.safeParse(downPercentage);
    const parsedCategory = categorySchema.safeParse(category);
    const hasTags = tags.length > 0;
    const hasImage = !!postImg || type !== "newPost";

    if (
      !parsedPrice.success ||
      !parsedDown.success ||
      !parsedCategory.success ||
      !hasTags ||
      !hasImage
    ) {
      setTriedSubmit(true);
      return;
    }

    const formData = new FormData();

    formData.append("file", postImg || "none");
    formData.append("tags", JSON.stringify(tags));
    formData.append("category", category);
    formData.append("price", String(parsedPrice.data));
    formData.append("sessions", JSON.stringify(sessions));
    formData.append("itemUsed", JSON.stringify(itemUsed));
    formData.append("downPercentage", String(parsedDown.data));

    formData.append("size", tattooData?.size.toString() || (0.3).toString());

    formData.append("type", type);
    formData.append("link", preview || "none");

    postMutation.mutate(formData);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-3xl mx-auto">
        {/* Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

        {/* Page Title */}
        <div className="flex items-center justify-between gap-2">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                New Entry
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Add Post
            </h1>
          </div>
          <BackButton />
        </div>
        <div className="w-full space-y-5 mb-8">
          {/* ── TWO-COLUMN: Image + Pricing ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* LEFT — Tattoo Image */}
            <div className="bg-surface border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-gold" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                    Tattoo Image
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                  Required
                </span>
              </div>

              <div className="relative border border-border bg-primary w-full h-[260px] overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-dim">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-[0.18em]">
                      No image selected
                    </span>
                  </div>
                )}
              </div>

              {type === "newPost" && (
                <div className="space-y-1">
                  <Input
                    type="file"
                    className="w-full"
                    accept="image/*"
                    aria-invalid={!!imageError}
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                  <FieldError>{imageError}</FieldError>
                </div>
              )}

              {preview && (
                <SetTattoo3DModal
                  key={preview}
                  tattooData={tattooData}
                  setTatooData={setTatooData}
                  img={preview}
                  fixSize={null}
                />
              )}

              {/* Art Style */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Art Style</Label>
                  <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                    Required
                  </span>
                </div>
                <ArtStyleSelect onChange={setCategory} value={category} />
                <FieldError>{categoryError}</FieldError>
              </div>
            </div>

            {/* RIGHT — Smart Pricing + Price Fields */}
            <div className="space-y-4">
              {/* Smart Pricing Toggle */}
              {tattooData && !editField && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditField(true)}
                >
                  <Zap className="w-4 h-4" /> Smart Pricing
                </Button>
              )}

              {editField && (
                <div className="border border-border bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-6 bg-gold" />
                      <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                        AI Pricing
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={AiAutoFillHanlder}
                        disabled={aiMutation.isPending}
                        size="sm"
                      >
                        <Cpu className="w-4 h-4" />
                        {aiMutation.isPending && (
                          <LoaderCircle className="h-3 w-3 animate-spin" />
                        )}
                        {aiMutation.isPending ? "Analyzing…" : "Auto-Fill"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditField(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Hour Rate</Label>
                      <MoneyInput
                        placeholder="Rate"
                        value={perHour}
                        onChange={setPerHour}
                        aria-invalid={!!rateError}
                      />
                      <FieldError>{rateError}</FieldError>
                    </div>
                    <div className="space-y-2">
                      <Label>Body Part</Label>
                      <BodyPartSelect onChange={setBodyPart} value={bodyPart} />
                    </div>
                    <div className="space-y-2">
                      <Label>Art Style</Label>
                      <ArtStyleSelect onChange={setCategory} value={category} />
                    </div>
                    <div className="space-y-2">
                      <Label>Is Colored</Label>
                      <div className="flex gap-4 pt-2">
                        {[
                          { val: true, label: "Yes" },
                          { val: false, label: "No" },
                        ].map(({ val, label }) => (
                          <label
                            key={label}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="isColored"
                              checked={isColored === val}
                              onChange={() => setIsColored(val)}
                              className="accent-gold"
                            />
                            <span className="text-sm text-text">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Design Complexity</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <button
                          key={item}
                          onClick={() => setComplexity(item)}
                          className={`w-10 h-10 border text-sm font-light transition-all duration-300 ${
                            complexity === item
                              ? "bg-gold border-gold text-primary"
                              : "bg-surface border-border text-text-muted hover:border-border-gold"
                          }`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Price */}
              {EstimatedPrice() && (
                <div className="relative border border-gold-dim bg-surface p-4 overflow-hidden">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">
                    Estimated Price
                  </p>
                  <h2
                    key={EstimatedPrice() || "none"}
                    className="text-3xl font-light text-gold price-pop"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {EstimatedPrice()}
                  </h2>
                </div>
              )}

              {/* Price + Down Payment */}
              <div className="bg-surface border border-border p-4 space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-px w-6 bg-gold" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                    Pricing
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price</Label>
                    <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                      Required
                    </span>
                  </div>
                  <MoneyInput
                    placeholder="Price"
                    value={price}
                    onChange={setPrice}
                    aria-invalid={!!priceError}
                  />
                  <FieldError>{priceError}</FieldError>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Down Payment %</Label>
                    <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                      Required
                    </span>
                  </div>
                  <Input
                    placeholder="0 - 100"
                    value={downPercentage}
                    inputMode="decimal"
                    aria-invalid={!!downPaymentError}
                    onChange={(e) => setDownPercentage(e.target.value)}
                  />
                  <FieldError>{downPaymentError}</FieldError>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-surface border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-gold" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                    Tags
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={tagInput}
                    aria-invalid={!!tagsError}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FieldError>{tagsError}</FieldError>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <X className="h-3 w-3 ml-0.5" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── ITEMS USED ── */}
          <div className="bg-surface border border-border p-5 space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Items Used
                </span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed mt-1">
                Items will automatically deduct from{" "}
                <span className="text-text font-medium">your</span> inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-2 sm:col-span-2">
                <Label>Item</Label>
                <Select onValueChange={selectItemHanlder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryData?.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{itemType}</Label>
                <Input
                  inputMode="numeric"
                  value={itemQty}
                  onChange={(e) =>
                    setItemQty(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <Button
                onClick={addInventoryItem}
                disabled={!itemId || !qtySchema.safeParse(itemQty).success}
                className="w-full"
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>

            {itemUsed.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {itemUsed.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center gap-2 border border-border bg-surface-alt px-3 py-1.5 text-xs text-text"
                  >
                    <span className="font-medium">{item.item}</span>
                    <span className="text-text-muted">× {item.qty}</span>
                    <button
                      onClick={() => removeInventoryItem(item.itemId)}
                      className="ml-1 text-text-muted hover:text-danger-light transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SESSIONS ── */}
          <div className="bg-surface border border-border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Sessions
                </span>
              </div>
              <Button type="button" onClick={addSession} size="sm">
                <Plus className="w-4 h-4" /> Add Session
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-border bg-surface-alt p-4 hover:border-border-gold transition-all duration-300"
                >
                  <div className="flex items-center gap-2 min-w-[110px]">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted whitespace-nowrap">
                      Session {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      type="number"
                      min={1}
                      value={session}
                      onChange={(e) =>
                        updateSession(index, Number(e.target.value))
                      }
                      className="flex-1"
                      placeholder="0"
                    />
                    <div className="h-10 px-4 flex items-center justify-center border border-border bg-surface min-w-[64px]">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        {session === 1 ? "Hour" : "Hours"}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSession(index)}
                    disabled={sessions.length === 1}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <div className="pt-2">
            <Button
              className="w-full"
              disabled={postMutation.isPending}
              onClick={handleSubmit}
            >
              {postMutation.isPending && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              Upload Post
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Ink Of Baphomet Atelier
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Post Studio
          </span>
        </div>
      </div>
    </div>
  );
}
