"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserCheck,
  UserX,
  Settings,
} from "lucide-react";
import { errorAlert } from "@/app/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { BookModal } from "./components/bookModal";
import useUserStore from "@/app/store/useUserStore";
import { ClientPicker } from "@/components/ui/client-picker";
import { ClientAccountFields } from "@/components/ui/client-account-fields";
import {
  artistInfoInterface,
  bussinessInfoInterface,
} from "@/app/types/accounts.type";
import { inventoryInterface } from "@/app/types/inventory.type";
import {
  apiErrorMessage,
  formatPeso,
  getInventoryName,
  getInventoryPrice,
  getInventoryType,
} from "@/app/utils/customFunction";
import { TattooDataInterface } from "@/app/types/threejs.type";
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal";
import { ArtStyleSelect } from "@/components/ui/artStyleSelect";
import { tattooSizeCmFromScene } from "@/app/utils/tattooScale";
import { bookingInterface } from "@/app/types/booking.type";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import {
  priceField,
  bookingClientSchema,
  firstError,
} from "@/lib/validation/schemas/booking";
import { countField } from "@/lib/validation/fields";
import { BackButton } from "@/components/ui/back-button";
import {
  sessionHoursFromInput,
  sessionHoursSchema,
  sessionsSchema,
} from "@/lib/validation/schemas/post";
import { aiAnalysisResultInterface } from "@/app/types/aiAnalysis.type";
import {
  useArtistAiAnalysis,
  distributeSessionHours,
  aiSizeWidthSchema,
  aiSizeHeightSchema,
} from "@/app/hooks/artistAiAnalysisHooks";
import { useArtistSettings } from "@/app/hooks/artistSettingsHooks";
import {
  AiAnalysisCard,
  profitAtPrice,
} from "@/components/ui/ai-analysis-card";

const qtySchema = countField("Quantity", { min: 1 });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-6 bg-gold" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
        {children}
      </span>
    </div>
  );
}

function RequiredBadge() {
  return (
    <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
      Required
    </span>
  );
}

export default function Page() {
  const [type, setType] = useState("newPost");
  const [appointment, setAppointment] = useState<bookingInterface | null>(null);

  const { user } = useUserStore();
  const router = useRouter();

  const params = useParams();
  const paramsId = params.id as string;
  const paramsBooking = params.booking as string;

  const [postImg, setPostImg] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoadingWorkImage, setIsLoadingWorkImage] = useState(false);

  const { data } = useQuery({
    queryKey: ["work_post", paramsId],
    queryFn: () => axiosInstance.get(`/works/${paramsId}`),
    enabled: paramsId !== "new",
  });

  const workScreenShot: string | null =
    typeof data?.data?.screenShot === "string" && data.data.screenShot
      ? data.data.screenShot
      : null;

  useEffect(() => {
    if (!workScreenShot) return;

    let cancelled = false;
    setType("workPost");
    setPreview(workScreenShot);
    setPostImg(null);
    setIsLoadingWorkImage(true);

    (async () => {
      try {
        const response = await fetch(workScreenShot);
        if (!response.ok) {
          throw new Error(`Failed to fetch work image (${response.status})`);
        }
        const blob = await response.blob();
        if (cancelled) return;
        const fileName =
          workScreenShot.split("/").pop()?.split("?")[0] ||
          "work-tattoo-image.png";
        setPostImg(
          new File([blob], fileName, { type: blob.type || "image/png" }),
        );
      } catch (error) {
        if (!cancelled) console.error("Failed to load work image:", error);
      } finally {
        if (!cancelled) setIsLoadingWorkImage(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workScreenShot]);

  const { data: appointmentData } = useQuery({
    queryKey: ["appointment_booking", paramsBooking],
    queryFn: () => axiosInstance.get(`/booking/${paramsBooking}`),
    enabled: paramsBooking !== "none",
  });

  useEffect(() => {
    if (paramsBooking != "none" && appointmentData?.data) {
      setAppointment(appointmentData.data);
      setClient(appointmentData.data.client._id);
      setBussiness(
        appointmentData.data.bussiness
          ? appointmentData.data.bussiness._id
          : "none",
      );
    }
  }, [appointmentData]);

  const { data: bussinessInfoData } = useQuery({
    queryKey: ["artist_bussiness"],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(
        `/account/artistBussiness/${user?._id}`,
      );
      return response.data;
    },
  });

  const [bussiness, setBussiness] = useState("none");

  useEffect(() => setItemUsed([]), [bussiness]);

  const { data: artistInfoData } = useQuery({
    queryKey: ["artist_profile"],
    queryFn: async (): Promise<artistInfoInterface> => {
      const response = await axiosInstance.get(
        `/account/artistInfo/${user?._id}`,
      );
      return response.data;
    },
  });

  const [artistTime, setArtistTime] = useState<string[]>([]);
  const [artistDay, setArtistDay] = useState<string[]>([]);

  useEffect(() => {
    if (bussiness == "none" && artistInfoData) {
      setArtistTime(artistInfoData.schedTime);
      setArtistDay(artistInfoData.schedDay);
    } else {
      bussinessInfoData?.forEach((item) => {
        if (bussiness == item.bussiness._id && user) {
          item.artists.forEach((artist) => {
            if (artist.artist._id == user._id) {
              setArtistTime(artist.schedTime);
              setArtistDay(artist.schedDay);
            }
          });
        }
      });
    }
  }, [bussiness, artistInfoData, bussinessInfoData]);

  // ── Items used (from the booking's inventory owner) ────────────────────
  const { data: inventoryData } = useQuery({
    queryKey: ["inventoryData", bussiness],
    queryFn: async (): Promise<inventoryInterface[]> => {
      const response = await axiosInstance.get(
        `/inventory/${bussiness == "none" ? user?._id : bussiness}`,
      );
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
  const itemQtyNum = Number(itemQty) || 0;
  const [itemPrice, setItemPrice] = useState(0);

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

  // ── Client ─────────────────────────────────────────────────────────────
  const [client, setClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isNoClientAccount, setIsNoClientAccount] = useState(false);
  const [clientPassword, setClientPassword] = useState<string | undefined>(
    undefined,
  );
  const [accountFieldsBlocking, setAccountFieldsBlocking] = useState(false);

  // ── Tattoo details, pricing, sessions ──────────────────────────────────
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState<number[]>([1]);
  const [tattooData, setTatooData] = useState<TattooDataInterface | null>(null);
  const [category, setCategory] = useState("");
  const [complexity, setComplexity] = useState(0);
  const [isColored, setIsColored] = useState(false);
  const [bodyPart, setBodyPart] = useState("");
  const [sizeWidthCm, setSizeWidthCm] = useState("");
  const [sizeHeightCm, setSizeHeightCm] = useState("");
  const [sizeFromScene, setSizeFromScene] = useState(false);

  // The 3D placement is the trusted source for body part and size.
  useEffect(() => {
    if (!tattooData) return;
    setBodyPart(tattooData.meshName);
    const { widthCm, heightCm } = tattooSizeCmFromScene(tattooData);
    setSizeWidthCm(String(widthCm));
    setSizeHeightCm(String(heightCm));
    setSizeFromScene(true);
  }, [tattooData]);

  // Read-only here; managed in Settings and applied by the server.
  const settings = useArtistSettings();
  const hourlyRate = settings.data?.hourlyRate ?? null;

  // AI materials come from the artist's own inventory, so they're only
  // applied when the booking uses that inventory (no business selected).
  const usesOwnInventory = bussiness === "none";

  const applyAiEstimate = (result: aiAnalysisResultInterface) => {
    setSessions(
      distributeSessionHours(
        result.analysis.estimatedHours,
        result.analysis.estimatedSessions,
      ),
    );
    if (usesOwnInventory) {
      setItemUsed(
        result.materials.map((m) => ({
          itemId: m.inventoryItemId,
          item: m.name,
          qty: m.estimatedQuantity,
          price: m.unitCost,
        })),
      );
    }
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

  const updateSession = (index: number, value: number) => {
    const updated = [...sessions];
    updated[index] = value;
    setSessions(updated);
  };

  const addSession = () => {
    setSessions([...sessions, 1]);
  };

  const removeSession = (index: number) => {
    if (sessions.length === 1) return;
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleImageChange = (file: File | null) => {
    setPostImg(file);
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

  // ── Validation ─────────────────────────────────────────────────────────
  // Errors stay hidden until the artist tries to book, then every missing
  // field lights up at once and clears as it's fixed.
  const [triedSubmit, setTriedSubmit] = useState(false);

  const priceError = firstError(priceField, price, {
    showWhenEmpty: triedSubmit,
  });
  const clientNameError = firstError(
    bookingClientSchema.shape.clientName,
    clientName,
    { showWhenEmpty: triedSubmit },
  );
  const clientEmailError = firstError(
    bookingClientSchema.shape.clientEmail,
    clientEmail,
    { showWhenEmpty: triedSubmit },
  );
  const clientContactError = firstError(
    bookingClientSchema.shape.clientContact,
    clientContact,
    { showWhenEmpty: triedSubmit },
  );
  const clientSelectError =
    triedSubmit && !appointment && !isNoClientAccount && !client
      ? "Please select a client."
      : undefined;
  const sessionsError = triedSubmit
    ? firstError(sessionsSchema, sessions)
    : undefined;
  const imageError =
    triedSubmit && !preview ? "Please select an image." : undefined;
  const sizeWidthError = firstError(aiSizeWidthSchema, sizeWidthCm);
  const sizeHeightError = firstError(aiSizeHeightSchema, sizeHeightCm);

  const clientIsValid = () => {
    if (appointment) return !!client;
    if (isNoClientAccount) {
      return (
        bookingClientSchema.safeParse({
          clientName,
          clientEmail,
          clientContact,
        }).success && !accountFieldsBlocking
      );
    }
    return !!client;
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
            : !aiSizeWidthSchema.safeParse(sizeWidthCm).success ||
                !aiSizeHeightSchema.safeParse(sizeHeightCm).success
              ? "Enter the tattoo width and height (cm)."
              : undefined;

  const aiSizeLabel =
    aiSizeWidthSchema.safeParse(sizeWidthCm).success &&
    aiSizeHeightSchema.safeParse(sizeHeightCm).success
      ? `${Number(sizeWidthCm)} × ${Number(sizeHeightCm)} cm`
      : null;

  // ── Submit ─────────────────────────────────────────────────────────────
  const bookMutation = useMutation({
    mutationFn: (data: FormData) => axiosInstance.post("/booking/custom", data),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Booking created",
        text: "Your Custom Booking was added successfully",
      }).then(() => {
        router.push("/pages/artist/booking");
      });
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const bookHandler = (data: { date: string; time: string[] }) => {
    if (!user) return errorAlert("empty field");
    const parsedPrice = priceField.safeParse(price);
    const hasImage = type === "newPost" ? !!postImg : !!preview;

    if (
      !clientIsValid() ||
      !hasImage ||
      !parsedPrice.success ||
      !sessionsSchema.safeParse(sessions).success
    ) {
      setTriedSubmit(true);
      if (isNoClientAccount && accountFieldsBlocking)
        return errorAlert("Please finish the client account details");
      return errorAlert("Please complete the required fields");
    }

    const formData = new FormData();

    formData.append("file", postImg && type === "newPost" ? postImg : "none");
    formData.append("price", String(parsedPrice.data));
    formData.append("sessions", JSON.stringify(sessions));

    formData.append("selectedTime", JSON.stringify(data.time));
    formData.append("date", data.date);

    formData.append("itemUsed", JSON.stringify(itemUsed));

    formData.append("clientId", client);
    formData.append("artistId", user._id);

    formData.append("type", type);
    formData.append("link", preview || "none");

    formData.append(
      "isNoAccount",
      !appointment && isNoClientAccount ? "no account" : "has account",
    );
    formData.append("clientName", clientName || "none");
    formData.append("clientContact", clientContact || "none");
    formData.append("clientEmail", clientEmail || "none");
    formData.append(
      "clientPassword",
      !appointment && isNoClientAccount && clientPassword
        ? clientPassword
        : "none",
    );

    formData.append("appointmentId", appointment ? appointment._id : "none");

    formData.append(
      "tattooData",
      tattooData ? JSON.stringify(tattooData) : "none",
    );

    formData.append("bussinessId", bussiness);

    bookMutation.mutate(formData);
  };

  const profit = ai.result ? profitAtPrice(price, ai.result.pricing) : null;

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
                {appointment ? "From Appointment" : "New Entry"}
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Add Booking
            </h1>
          </div>
          <BackButton />
        </div>

        {/* Main form (left) + AI Tattoo Analysis (right, sticky on desktop).
            On mobile the AI card stacks after the form, before Schedule. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mb-8 items-start">
          <div className="w-full space-y-5 min-w-0 lg:col-start-1">
            {/* ── CLIENT ── */}
            {appointment ? (
              <div className="bg-surface border border-border p-5 space-y-3">
                <SectionLabel>Client</SectionLabel>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-[2px] border border-gold opacity-30" />
                    <img
                      src={appointment.client.profile}
                      alt=""
                      className="w-10 h-10 object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="text-lg font-light text-text"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {appointment.client.name}
                    </h2>
                    <p className="text-[11px] text-text-muted truncate">
                      {appointment.client.email} · appointment on{" "}
                      {appointment.date}
                    </p>
                  </div>
                </div>
              </div>
            ) : paramsBooking !== "none" ? (
              <div className="bg-surface border border-border p-5">
                <SectionLabel>Client</SectionLabel>
                <p className="text-sm text-text-muted mt-3">
                  Loading appointment…
                </p>
              </div>
            ) : (
              <div className="bg-surface border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel>Client</SectionLabel>
                  <RequiredBadge />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsNoClientAccount((prev) => !prev)}>
                    {isNoClientAccount ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Has account
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4" /> No account
                      </>
                    )}
                  </Button>
                </div>

                {isNoClientAccount ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <div className="w-full">
                        <Input
                          placeholder="Client name"
                          value={clientName}
                          type="text"
                          aria-invalid={!!clientNameError}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                        <FieldError>{clientNameError}</FieldError>
                      </div>
                      <div className="w-full">
                        <Input
                          placeholder="Client email"
                          value={clientEmail}
                          type="email"
                          aria-invalid={!!clientEmailError}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                        <FieldError>{clientEmailError}</FieldError>
                      </div>
                      <div className="w-full">
                        <Input
                          placeholder="Client contact"
                          value={clientContact}
                          type="text"
                          inputMode="numeric"
                          aria-invalid={!!clientContactError}
                          onChange={(e) =>
                            setClientContact(
                              e.target.value.replace(/\D/g, "").slice(0, 11),
                            )
                          }
                        />
                        <FieldError>{clientContactError}</FieldError>
                      </div>
                    </div>

                    {!clientEmailError && clientEmail && (
                      <ClientAccountFields
                        email={clientEmail}
                        onChange={({ password, blocking }) => {
                          setClientPassword(password);
                          setAccountFieldsBlocking(blocking);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <ClientPicker
                      endpoint="/booking/custom/clients"
                      value={client}
                      onSelect={(id) => setClient(id)}
                      noRecordsLabel="No clients found."
                    />
                    <FieldError>{clientSelectError}</FieldError>
                  </>
                )}
              </div>
            )}

            {/* ── BUSINESS (new bookings only) ── */}
            {!!bussinessInfoData?.length && paramsBooking == "none" && (
              <div className="bg-surface border border-border p-5 space-y-3">
                <SectionLabel>Business</SectionLabel>
                <Select onValueChange={setBussiness} value={bussiness}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {bussinessInfoData?.map((item) => (
                      <SelectItem
                        key={item.bussiness._id}
                        value={item.bussiness._id}
                      >
                        <img
                          src={item.bussiness.profile}
                          alt=""
                          className="w-5 h-5 object-cover rounded-full"
                        />
                        {item.bussiness.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── TWO-COLUMN: Image + Pricing ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* LEFT — Tattoo Image */}
              <div className="bg-surface border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel>Tattoo Image</SectionLabel>
                  <RequiredBadge />
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
                  <Input
                    type="file"
                    className="w-full"
                    accept="image/*"
                    aria-invalid={!!imageError}
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                )}
                <FieldError>{imageError}</FieldError>

                {preview && (
                  <SetTattoo3DModal
                    key={preview}
                    tattooData={tattooData}
                    setTatooData={setTatooData}
                    img={preview}
                    fixSize={null}
                  />
                )}

                <div className="space-y-2">
                  <Label>Art Style</Label>
                  <ArtStyleSelect onChange={setCategory} value={category} />
                </div>

                <div className="space-y-2">
                  <Label>Tattoo Size (cm)</Label>
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
                      : "Used by the AI Tattoo Analysis. Placing the tattoo on the 3D body fills this in."}
                  </p>
                </div>
              </div>

              {/* RIGHT — Pricing */}
              <div className="bg-surface border border-border p-4 space-y-4 self-start">
                <SectionLabel>Pricing</SectionLabel>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price</Label>
                    <RequiredBadge />
                  </div>
                  <MoneyInput
                    placeholder="Final price"
                    value={price}
                    onChange={setPrice}
                    aria-invalid={!!priceError}
                  />
                  <FieldError>{priceError}</FieldError>
                  {profit && ai.result && (
                    <p className="text-[11px] text-text-dim" aria-live="polite">
                      Estimated profit{" "}
                      <span
                        className={
                          profit.profit < 0 ? "text-danger-light" : "text-text"
                        }
                      >
                        {formatPeso(profit.profit)}
                      </span>{" "}
                      · cost {formatPeso(ai.result.pricing.totalCost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-hourly-rate">Hourly Rate</Label>
                  <MoneyInput
                    id="booking-hourly-rate"
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
              </div>
            </div>

            {/* ── ITEMS USED ── */}
            <div className="bg-surface border border-border p-5 space-y-5">
              <div>
                <SectionLabel>Items Used</SectionLabel>
                <p className="text-text-muted text-xs leading-relaxed mt-2">
                  Deducted from{" "}
                  <span className="text-text font-medium">
                    {usesOwnInventory ? "your" : "the selected business'"}
                  </span>{" "}
                  inventory when the booking is completed.
                  {!usesOwnInventory &&
                    " AI material suggestions use your own inventory, so add the business items here yourself."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Item</Label>
                  <Select onValueChange={selectItemHanlder} key={bussiness}>
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
                <SectionLabel>Sessions</SectionLabel>
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
              applyTarget="booking"
            />
          </aside>

          {/* ── SCHEDULE + SUBMIT ── */}
          <div className="bg-surface border border-border p-5 space-y-4 lg:col-start-1">
            <SectionLabel>Schedule</SectionLabel>
            <p className="text-xs text-text-muted">
              Pick the date and start time of the first session ({sessions[0]}{" "}
              {sessions[0] === 1 ? "hour" : "hours"}), then create the booking.
            </p>
            <BookModal
              key={(user?._id ?? "") + bussiness}
              days={artistDay}
              times={artistTime}
              artistId={user?._id ?? ""}
              sessionTime={sessions[0]}
              callBack={bookHandler}
              isPending={bookMutation.isPending}
              submitLabel="Create Booking"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Ink Of Baphomet Atelier
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Booking Studio
          </span>
        </div>
      </div>
    </div>
  );
}
