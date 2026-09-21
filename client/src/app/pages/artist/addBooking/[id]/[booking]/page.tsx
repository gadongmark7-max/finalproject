"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { bookingInterface } from "@/app/types/booking.type";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import {
  priceField,
  bookingClientSchema,
  firstError,
} from "@/lib/validation/schemas/booking";
import { moneyField, countField } from "@/lib/validation/fields";
import { BackButton } from "@/components/ui/back-button";

const rateSchema = moneyField({ label: "Rate" });
const qtySchema = countField("Quantity", { min: 1 });

const wizardInfo = ["Session Info", "Tattoo Info", "Booking Schedule"];

export default function Page() {
  const [type, setType] = useState("newPost");
  const [appointment, setAppointment] = useState<bookingInterface | null>(null);

  const { user } = useUserStore();

  const params = useParams();
  const paramsId = params.id as string;
  const paramsBooking = params.booking as string;

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

  const { data: appointmentData } = useQuery({
    queryKey: ["appointmenttt"],
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

  const [step, setStep] = useState(1);

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

  const router = useRouter();

  const [postImg, setPostImg] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [price, setPrice] = useState("");

  const [client, setClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isNoClientAccount, setIsNoClientAccount] = useState(false);
  const [clientPassword, setClientPassword] = useState<string | undefined>(
    undefined,
  );
  const [accountFieldsBlocking, setAccountFieldsBlocking] = useState(false);

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
    onError: () => errorAlert("error occur"),
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
    onError: () => errorAlert("error occur"),
  });

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

  const priceError = firstError(priceField, price);
  const clientNameError = firstError(
    bookingClientSchema.shape.clientName,
    clientName,
  );
  const clientEmailError = firstError(
    bookingClientSchema.shape.clientEmail,
    clientEmail,
  );
  const clientContactError = firstError(
    bookingClientSchema.shape.clientContact,
    clientContact,
  );

  const NextButttonValidation = () => {
    if (step == 1) {
      if (isNoClientAccount) {
        return (
          !bookingClientSchema.safeParse({
            clientName,
            clientEmail,
            clientContact,
          }).success || accountFieldsBlocking
        );
      } else {
        return !client;
      }
    } else if (step == 2) {
      return !preview || !priceField.safeParse(price).success;
    } else {
      return true;
    }
  };

  const bookHandler = (data: { date: string; time: string[] }) => {
    if (!sessions || !user) return errorAlert("empty field");
    if (!postImg && type == "newPost") return errorAlert("empty field");
    if (isNoClientAccount && accountFieldsBlocking)
      return errorAlert("Please finish the client account details");
    const parsedPrice = priceField.safeParse(price);
    if (!parsedPrice.success)
      return errorAlert(
        parsedPrice.error.issues[0]?.message ?? "Please enter a valid price",
      );

    const formData = new FormData();

    formData.append("file", postImg || "none");
    formData.append("price", String(parsedPrice.data));
    formData.append("sessions", JSON.stringify(sessions));

    formData.append("selectedTime", JSON.stringify(data.time));
    formData.append("date", data.date);

    formData.append("itemUsed", JSON.stringify(itemUsed));

    formData.append("clientId", client);
    formData.append("artistId", user?._id);

    formData.append("type", type);
    formData.append("link", preview || "none");

    formData.append(
      "isNoAccount",
      isNoClientAccount ? "no account" : "has account",
    );
    formData.append("clientName", clientName || "none");
    formData.append("clientContact", clientContact || "none");
    formData.append("clientEmail", clientEmail || "none");
    formData.append(
      "clientPassword",
      isNoClientAccount && clientPassword ? clientPassword : "none",
    );

    formData.append("appointmentId", appointment ? appointment._id : "none");

    formData.append(
      "tattooData",
      tattooData ? JSON.stringify(tattooData) : "none",
    );

    formData.append("bussinessId", bussiness);

    bookMutation.mutate(formData);
  };

  const AiAutoFillHanlder = () => {
    if (!postImg) return errorAlert("Feature Not Available");

    const formData = new FormData();

    formData.append("file", postImg || "none");

    aiMutation.mutate(formData);
  };

  return (
    <div className="w-full  px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
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
          <div className="mb-12">
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
              Add Booking
            </h1>
          </div>

          <BackButton />
        </div>

        {/* ── WIZARD STEPS ── */}
        <div className="flex  mb-12">
          {wizardInfo.map((label, i) => {
            const stepNumber = i + 1;
            return (
              <div key={label} className="flex items-center">
                <div className="relative flex flex-col items-center">
                  {/* Label */}
                  <span
                    className={`absolute -top-6 text-[10px] uppercase tracking-[0.18em] whitespace-nowrap font-light ${
                      step >= stepNumber ? "text-gold" : "text-text-dim"
                    }`}
                  >
                    {label}
                  </span>
                  {/* Circle */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-xs font-light transition-all duration-300 ${
                      step >= stepNumber
                        ? "bg-gold text-primary border border-gold"
                        : "bg-surface border border-border text-text-dim"
                    }`}
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {stepNumber}
                  </div>
                </div>
                {/* Connector */}
                {i !== wizardInfo.length - 1 && (
                  <div
                    className={`w-20 sm:w-32 h-px mx-2 transition-all duration-500 ${
                      step > stepNumber ? "bg-gold" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP CONTENT ── */}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="w-full space-y-6 mb-8">
            {/* Client — prefilled */}
            {appointment && (
              <div className="bg-surface border border-border p-5 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Client
                </span>
                <div className="flex gap-3 items-center mt-2">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-[2px] border border-gold opacity-30" />
                    <img
                      src={appointment.client.profile}
                      className="w-10 h-10 object-cover"
                    />
                  </div>
                  <h2
                    className="text-lg font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {appointment.client.name}
                  </h2>
                </div>
              </div>
            )}

            {/* Client — select */}
            {!appointment && (
              <div className="bg-surface border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                    Client
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                    Required
                  </span>
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
                  <ClientPicker
                    endpoint="/booking/custom/clients"
                    value={client}
                    onSelect={(id) => setClient(id)}
                    noRecordsLabel="No clients found."
                  />
                )}
              </div>
            )}

            {/* Business */}
            {bussinessInfoData?.length !== 0 && paramsBooking == "none" && (
              <div className="bg-surface border border-border p-5 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Business
                </span>
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
                          className="w-5 h-5 object-cover rounded-full"
                        />
                        {item.bussiness.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Items Used */}
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
                  <span className="text-text font-medium">
                    {bussiness === "none" ? "your" : "the selected business'"}
                  </span>{" "}
                  inventory.
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

            {/* Sessions */}
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
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {/* Left — Image */}
            <div className="space-y-3">
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

              <div className="relative border border-border bg-surface w-full h-[280px] overflow-hidden">
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
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] || null)
                  }
                />
              )}
            </div>

            {/* Right — Pricing */}
            <div className="space-y-4">
              {preview && (
                <SetTattoo3DModal
                  key={preview}
                  tattooData={tattooData}
                  setTatooData={setTatooData}
                  img={preview}
                  fixSize={null}
                />
              )}

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
                      <Input
                        placeholder="Rate"
                        inputMode="decimal"
                        value={perHour}
                        onChange={(e) => setPerHour(e.target.value)}
                        aria-invalid={!!firstError(rateSchema, perHour)}
                      />
                      <FieldError>{firstError(rateSchema, perHour)}</FieldError>
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
                    className="text-3xl font-light text-gold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {EstimatedPrice()}
                  </h2>
                </div>
              )}

              {/* Price Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Price</Label>
                  <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
                    Required
                  </span>
                </div>
                <MoneyInput
                  placeholder="Final price"
                  value={price}
                  onChange={setPrice}
                  aria-invalid={!!priceError}
                />
                <FieldError>{priceError}</FieldError>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="w-full mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Schedule
              </span>
            </div>
            <div className="border border-border bg-surface p-4">
              <BookModal
                key={user?._id! + bussiness}
                days={artistDay}
                times={artistTime}
                artistId={user?._id!}
                sessionTime={sessions[0]}
                callBack={bookHandler}
              />
            </div>
          </div>
        )}

        {/* ── CONTROLS ── */}
        <div className="flex justify-between items-center border-t border-border pt-6">
          <Button
            disabled={step === 1}
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
          {step !== 3 && (
            <Button
              disabled={NextButttonValidation()}
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Ink Of Baphomet Atelier
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Booking Wizard
          </span>
        </div>
      </div>
    </div>
  );
}
