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
  percentField,
  countField,
  selectField,
} from "@/lib/validation/fields";
import {
  useArtistAiAnalysis,
  distributeSessionHours,
  aiSizeWidthSchema,
  aiSizeHeightSchema,
} from "@/app/hooks/artistAiAnalysisHooks";

const downPaymentSchema = percentField("Down payment");
const qtySchema = countField("Quantity", { min: 1 });
const categorySchema = selectField("an art style", [""]);
const sizeWidthSchema = aiSizeWidthSchema;
const sizeHeightSchema = aiSizeHeightSchema;
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
  Brain,
  Settings,
  UserCheck,
  UserX,
  Check,
  CheckCircle,
} from "lucide-react";
import { errorAlert } from "@/app/utils/alert";
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
import { ArtStyleSelect } from "@/components/ui/artStyleSelect";
import { formatPeso } from "@/app/utils/customFunction";
import { tattooSizeCmFromScene } from "@/app/utils/tattooScale";
import { BackButton } from "@/components/ui/back-button";
import {
  sessionHoursFromInput,
  sessionHoursSchema,
  sessionsSchema,
} from "@/lib/validation/schemas/post";
import { aiAnalysisResultInterface } from "@/app/types/aiAnalysis.type";
import { AiAnalysisCard, profitAtPrice } from "@/components/ui/ai-analysis-card";
import { useArtistSettings } from "@/app/hooks/artistSettingsHooks";
import Link from "next/link";

export default function Page() {
  const [type, setType] = useState("newPost");

  const { user } = useUserStore();

  const params = useParams();
  const paramsId = params.id as string;

  const { data } = useQuery({
    queryKey: ["work_post", paramsId],
    queryFn: () => axiosInstance.get(`/works/${paramsId}`),
    enabled: paramsId !== "new",
  });

  const workScreenShot: string | null =
    typeof data?.data?.screenShot === "string" && data.data.screenShot
      ? data.data.screenShot
      : null;

  const [isLoadingWorkImage, setIsLoadingWorkImage] = useState(false);

  useEffect(() => {
    if (!workScreenShot) return;

    let cancelled = false;
    setType("workPost");
    setPreview(workScreenShot);
    setPostImg(null);
    setIsLoadingWorkImage(true);

    const loadExistingImage = async () => {
      try {
        const response = await fetch(workScreenShot);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch existing image (${response.status})`,
          );
        }

        const blob = await response.blob();
        if (cancelled) return;

        const fileName =
          workScreenShot.split("/").pop()?.split("?")[0] ||
          "existing-tattoo-image.png";

        setPostImg(
          new File([blob], fileName, { type: blob.type || "image/png" }),
        );
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load existing image:", error);
        setPostImg(null);
      } finally {
        if (!cancelled) setIsLoadingWorkImage(false);
      }
    };

    loadExistingImage();
    return () => {
      cancelled = true;
    };
  }, [workScreenShot]);

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
  const [isColored, setIsColored] = useState(false);
  const [bodyPart, setBodyPart] = useState(tattooData?.meshName || "");
  const [sizeWidthCm, setSizeWidthCm] = useState("");
  const [sizeHeightCm, setSizeHeightCm] = useState("");
  // True while width/height mirror the 3D placement; false once edited by hand.
  const [sizeFromScene, setSizeFromScene] = useState(false);

  // The artist's rate from Settings — read-only on this page; the server
  // prices AI estimates with the stored value.
  const settings = useArtistSettings();
  const hourlyRate = settings.data?.hourlyRate ?? null;

  // The 3D body model is the trusted source for body part and size: each
  // time the artist saves a placement, mirror it into the form (the artist
  // can still override the fields by hand).
  useEffect(() => {
    if (!tattooData) return;
    setBodyPart(tattooData.meshName);
    const { widthCm, heightCm } = tattooSizeCmFromScene(tattooData);
    setSizeWidthCm(String(widthCm));
    setSizeHeightCm(String(heightCm));
    setSizeFromScene(true);
  }, [tattooData]);

  const [duplicateImageError, setDuplicateImageError] = useState<
    string | undefined
  >(undefined);

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
    onError: (error: any) => {
      if (error?.response?.data?.code === "DUPLICATE_IMAGE") {
        setDuplicateImageError(
          "This tattoo image already exists. Please choose a different image.",
        );
        return;
      }
      errorAlert("error occur");
    },
  });

  const applyAiEstimate = (result: aiAnalysisResultInterface) => {
    setSessions(
      distributeSessionHours(
        result.analysis.estimatedHours,
        result.analysis.estimatedSessions,
      ),
    );
    setItemUsed(
      result.materials.map((m) => ({
        itemId: m.inventoryItemId,
        item: m.name,
        qty: m.estimatedQuantity,
        price: m.unitCost,
      })),
    );
    setPrice(String(Math.round(result.pricing.suggestedPrice)));
  };

  const ai = useArtistAiAnalysis(
    {
      postImg,
      bodyPart,
      hourlyRate,
      sizeWidthCm,
      sizeHeightCm,
      category,
      complexity,
      isColored,
    },
    {
      onAnalyzed: (result) => {
        setCategory(result.analysis.category);
        setComplexity(result.analysis.complexity);
        setIsColored(result.analysis.isColored);
        applyAiEstimate(result);
      },
    },
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
    setDuplicateImageError(undefined);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setTatooData(null);
      setCategory("");
      setComplexity(0);
      setIsColored(false);
      setBodyPart("");
      setSizeWidthCm("");
      setSizeHeightCm("");
      setSizeFromScene(false);
      ai.reset();
    }
  };

  const analyzeDisabledReason = isLoadingWorkImage
    ? "Loading the work image…"
    : !postImg
      ? type === "workPost"
        ? "Could not load this work's image for AI analysis."
        : "Select a tattoo image first."
      : !bodyPart
        ? "Place the tattoo on the 3D body or select a body part."
        : settings.isLoading
          ? "Loading your hourly rate…"
          : hourlyRate === null
            ? "Set your hourly rate in Settings first."
            : !sizeWidthSchema.safeParse(sizeWidthCm).success ||
              !sizeHeightSchema.safeParse(sizeHeightCm).success
            ? "Enter the tattoo width and height (cm)."
            : undefined;

  const aiSizeLabel =
    sizeWidthSchema.safeParse(sizeWidthCm).success &&
    sizeHeightSchema.safeParse(sizeHeightCm).success
      ? `${Number(sizeWidthCm)} × ${Number(sizeHeightCm)} cm`
      : null;

  // Field errors are hidden on a pristine, never-submitted form; once the
  // artist tries to upload, every invalid/empty required field lights up at
  // once and clears itself the moment it's fixed — no toast needed for these.
  const [triedSubmit, setTriedSubmit] = useState(false);

  const priceError = firstError(priceField, price, {
    showWhenEmpty: triedSubmit,
  });
  const downPaymentError = firstError(downPaymentSchema, downPercentage, {
    showWhenEmpty: triedSubmit,
  });
  const categoryError = firstError(categorySchema, category, {
    showWhenEmpty: triedSubmit,
  });
  const sizeWidthError = firstError(sizeWidthSchema, sizeWidthCm, {
    showWhenEmpty: triedSubmit,
  });
  const sizeHeightError = firstError(sizeHeightSchema, sizeHeightCm, {
    showWhenEmpty: triedSubmit,
  });
  const sessionsError = triedSubmit
    ? firstError(sessionsSchema, sessions)
    : undefined;
  const tagsError =
    triedSubmit && tags.length === 0
      ? "Please enter at least one tag."
      : undefined;
  const imageError =
    triedSubmit && !postImg && type === "newPost"
      ? "Please select an image."
      : undefined;

  // Reference snapshot of the latest AI estimate, saved alongside the post.
  // The post's real price is always the artist-entered `price`.
  const buildAiEstimatePayload = () => {
    const result = ai.result;
    if (!result) return null;
    return {
      category: result.analysis.category,
      complexity: result.analysis.complexity,
      isColored: result.analysis.isColored,
      bodyPart: result.analysis.bodyPart,
      sizeWidthCm: result.size.widthCm,
      sizeHeightCm: result.size.heightCm,
      hourlyRate: result.pricing.hourlyRate,
      estimatedHours: result.analysis.estimatedHours,
      estimatedSessions: result.analysis.estimatedSessions,
      materials: result.materials.map((m) => ({
        inventoryItemId: m.inventoryItemId,
        name: m.name,
        estimatedQuantity: m.estimatedQuantity,
        unitCost: m.unitCost,
        estimatedCost: m.estimatedCost,
      })),
      laborCost: result.pricing.laborCost,
      materialCost: result.pricing.materialCost,
      totalCost: result.pricing.totalCost,
      suggestedPrice: result.pricing.suggestedPrice,
      estimatedProfit: result.pricing.estimatedProfit,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    setDuplicateImageError(undefined);
    const parsedPrice = priceField.safeParse(price);
    const parsedDown = downPaymentSchema.safeParse(downPercentage);
    const parsedCategory = categorySchema.safeParse(category);
    const parsedWidth = sizeWidthSchema.safeParse(sizeWidthCm);
    const parsedHeight = sizeHeightSchema.safeParse(sizeHeightCm);
    const hasTags = tags.length > 0;
    const hasImage = !!postImg || type !== "newPost";

    if (
      !parsedPrice.success ||
      !parsedDown.success ||
      !parsedCategory.success ||
      !parsedWidth.success ||
      !parsedHeight.success ||
      !sessionsSchema.safeParse(sessions).success ||
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
    formData.append("sizeWidthCm", String(parsedWidth.data));
    formData.append("sizeHeightCm", String(parsedHeight.data));
    formData.append("bodyPart", bodyPart || "");

    const aiEstimatePayload = buildAiEstimatePayload();
    if (aiEstimatePayload) {
      formData.append("aiEstimate", JSON.stringify(aiEstimatePayload));
    }

    formData.append("type", type);
    formData.append("link", preview || "none");

    postMutation.mutate(formData);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-3xl lg:max-w-6xl mx-auto">
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
        {/* Main form (left) + AI Tattoo Analysis (right, sticky on desktop).
            On mobile the AI card stacks after the form, before Upload. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mb-8 items-start">
          <div className="w-full space-y-5 min-w-0 lg:col-start-1">
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
                      aria-invalid={!!imageError || !!duplicateImageError}
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] || null)
                      }
                    />
                    <FieldError>{imageError}</FieldError>
                  </div>
                )}
                <FieldError>{duplicateImageError}</FieldError>

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

                {/* Tattoo Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tattoo Size (cm)</Label>
                    <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                      Required
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input
                        placeholder="Width"
                        inputMode="decimal"
                        value={sizeWidthCm}
                        aria-invalid={!!sizeWidthError}
                        onChange={(e) => {
                          setSizeWidthCm(
                            e.target.value.replace(/[^0-9.]/g, ""),
                          );
                          setSizeFromScene(false);
                        }}
                      />
                      <FieldError>{sizeWidthError}</FieldError>
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Height"
                        inputMode="decimal"
                        value={sizeHeightCm}
                        aria-invalid={!!sizeHeightError}
                        onChange={(e) => {
                          setSizeHeightCm(
                            e.target.value.replace(/[^0-9.]/g, ""),
                          );
                          setSizeFromScene(false);
                        }}
                      />
                      <FieldError>{sizeHeightError}</FieldError>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-dim">
                    {sizeFromScene
                      ? "Estimated from the 3D placement — resize the tattoo on the body or edit here."
                      : "Tip: placing the tattoo on the 3D body fills this in automatically."}
                  </p>
                </div>
              </div>

              {/* RIGHT — Price Fields */}
              <div className="space-y-4">
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
                    {ai.result && (
                      <p className="text-[11px] text-text-dim" aria-live="polite">
                        Estimated profit{" "}
                        <span
                          className={
                            profitAtPrice(price, ai.result.pricing).profit < 0
                              ? "text-danger-light"
                              : "text-text"
                          }
                        >
                          {formatPeso(profitAtPrice(price, ai.result.pricing).profit)}
                        </span>{" "}
                        · cost {formatPeso(ai.result.pricing.totalCost)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-hourly-rate">Hourly Rate</Label>
                    <MoneyInput
                      id="post-hourly-rate"
                      value={
                        hourlyRate !== null
                          ? `${hourlyRate.toLocaleString()} / hour`
                          : ""
                      }
                      placeholder={settings.isLoading ? "Loading…" : "Not set"}
                      onChange={() => {}}
                      readOnly
                      disabled
                    />
                    <p className="flex items-center gap-1.5 text-[11px] text-text-dim">
                      <Settings className="w-3 h-3 shrink-0" />
                      To change it, go to{" "}
                      <Link
                        href="/pages/artist/settings"
                        className="text-gold hover:underline"
                      >
                        Settings
                      </Link>
                    </p>
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
                        inputMode="numeric"
                        value={session || ""}
                        aria-invalid={!!firstError(sessionHoursSchema, session) && session !== 0}
                        onChange={(e) =>
                          updateSession(index, sessionHoursFromInput(e.target.value))
                        }
                        className="flex-1"
                        placeholder="Hours"
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
              <FieldError>{sessionsError}</FieldError>
            </div>
          </div>

          {/* ── AI TATTOO ANALYSIS ── */}
          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
            <AiAnalysisCard
              result={ai.result}
              isAnalyzing={ai.isAnalyzing}
              isRecalculating={ai.isRecalculating}
              staleReason={ai.staleReason}
              recalcError={ai.recalcError}
              missingMaterialNames={ai.missingMaterialNames}
              bodyPart={bodyPart}
              onBodyPartChange={setBodyPart}
              hourlyRate={hourlyRate}
              hourlyRateLoading={settings.isLoading}
              price={price}
              onPriceChange={setPrice}
              priceError={priceError}
              sizeLabel={aiSizeLabel}
              sizeFromScene={sizeFromScene}
              analyzeDisabledReason={analyzeDisabledReason}
              onAnalyze={ai.analyze}
              onApply={() => ai.result && applyAiEstimate(ai.result)}
            />
          </aside>

          {/* ── SUBMIT ── */}
          <div className="pt-2 lg:col-start-1">
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
