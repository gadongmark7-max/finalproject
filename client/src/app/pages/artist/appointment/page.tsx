"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import {
  bookingClientSchema,
  firstError,
} from "@/lib/validation/schemas/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { errorAlert } from "@/app/utils/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { BookModal } from "./components/bookModal";
import useUserStore from "@/app/store/useUserStore";
import {
  bussinessInfoInterface,
  artistInfoInterface,
} from "@/app/types/accounts.type";
import LoadingScreen from "@/components/ui/loadingScreen";
import { UserCheck, UserX } from "lucide-react";
import { ClientPicker } from "@/components/ui/client-picker";
import { BackButton } from "@/components/ui/back-button";
import { ClientAccountFields } from "@/components/ui/client-account-fields";

interface appointmentType {
  sessions: number[];
  clientId: string;
  selectedTime: string[];
  date: string;
  artistId: string;
  isNoAccount: string;
  clientName: string;
  bussinessId: string;
  clientContact: string;
  clientEmail: string;
  clientPassword?: string;
}

export default function Page() {
  const { user } = useUserStore();

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

  const { data: artistInfoData } = useQuery({
    queryKey: ["artist_info_data"],
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
          console.log(item);
          item.artists.forEach((artist) => {
            if (artist.artist._id == user._id) {
              setArtistTime(artist.schedTime);
              setArtistDay(artist.schedDay);
              console.log("bussiness runnnnnnnnn");
            }
          });
        }
      });
    }
  }, [bussiness, artistInfoData, bussinessInfoData]);

  const router = useRouter();

  const [client, setClient] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isNoClientAccount, setIsNoClientAccount] = useState(false);
  const [clientPassword, setClientPassword] = useState<string | undefined>(
    undefined,
  );
  const [accountFieldsBlocking, setAccountFieldsBlocking] = useState(false);

  const [duration, setDuration] = useState(1);

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

  const postMutation = useMutation({
    mutationFn: (data: appointmentType) =>
      axiosInstance.post("/booking/appointment", data),
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

  const bookHandler = (data: { date: string; time: string[] }) => {
    if (!duration || !user) return errorAlert("empty field");
    if (
      isNoClientAccount &&
      !bookingClientSchema.safeParse({ clientName, clientEmail, clientContact })
        .success
    )
      return errorAlert("Please complete the client details");
    if (!isNoClientAccount && !client) return errorAlert("no selected client ");
    if (isNoClientAccount && accountFieldsBlocking)
      return errorAlert("Please finish the client account details");

    postMutation.mutate({
      sessions: [duration],
      clientId: client,
      selectedTime: data.time,
      date: data.date,
      artistId: user?._id,
      isNoAccount: isNoClientAccount ? "no account" : "has account",
      clientName: clientName || "none",
      bussinessId: bussiness,
      clientContact: clientContact,
      clientEmail: clientEmail,
      clientPassword: isNoClientAccount ? clientPassword : undefined,
    });
  };

  if (!bussinessInfoData || !artistInfoData) return <LoadingScreen />;

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
          <div className="border-b border-border pb-8">
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
              Add Appointment
            </h1>
          </div>

          <BackButton />
        </div>

        <div className="space-y-5">
          {/* ── BUSINESS + CLIENT ── */}
          <div className="bg-surface border border-border p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Details
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Business Select */}
              {bussinessInfoData?.length !== 0 && (
                <div className="space-y-2 flex-shrink-0">
                  <Label>Business</Label>
                  <Select onValueChange={setBussiness}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select" />
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

              {/* Client */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Label>Client</Label>
                  <Button
                    onClick={() => setIsNoClientAccount((prev) => !prev)}
                    className="flex-shrink-0"
                  >
                    {isNoClientAccount ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Has Account
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4" /> No Account
                      </>
                    )}
                  </Button>
                </div>

                {isNoClientAccount ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-1 flex-wrap sm:flex-nowrap">
                      <div className="w-full">
                        <Input
                          placeholder="Name"
                          value={clientName}
                          type="text"
                          aria-invalid={!!clientNameError}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                        <FieldError>{clientNameError}</FieldError>
                      </div>
                      <div className="w-full">
                        <Input
                          placeholder="Email"
                          value={clientEmail}
                          type="email"
                          aria-invalid={!!clientEmailError}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                        <FieldError>{clientEmailError}</FieldError>
                      </div>
                      <div className="w-full">
                        <Input
                          placeholder="Contact"
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
                    endpoint="/booking/appointment/clients"
                    value={client}
                    onSelect={(id) => setClient(id)}
                    noRecordsLabel="No appointments found."
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── BOOKING CALENDAR ── */}
          <div className="bg-surface border border-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Schedule
              </span>
            </div>
            <BookModal
              key={bussiness}
              days={artistDay}
              times={artistTime}
              artistId={user?._id!}
              sessionTime={duration}
              callBack={bookHandler}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Ink Of Baphomet Atelier
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Appointment
          </span>
        </div>
      </div>
    </div>
  );
}
