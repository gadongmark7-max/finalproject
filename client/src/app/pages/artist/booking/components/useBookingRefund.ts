"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { apiErrorMessage } from "@/app/utils/customFunction";
import { confirmAlert, errorAlert } from "@/app/utils/alert";
import { payMongoRefund } from "@/app/utils/payMongo";
import { bookingInterface } from "@/app/types/booking.type";

export function useBookingRefund(
  setBookings: (data: bookingInterface[]) => void,
) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const refundMutation = useMutation({
    mutationFn: (data: {
      id: string;
      status: string;
      reason: string;
      clientId: string;
    }) => axiosInstance.put(`/booking/status`, data),
    onSuccess: (response) => {
      setBookings(response.data);
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const handleRefund = (booking: bookingInterface) => {
    confirmAlert("you want to Refund this Booking?", "Refund", () => {
      refundMutation.mutate(
        {
          id: booking._id,
          status: "refund",
          reason: "none",
          clientId: booking.client._id,
        },
        {
          onSuccess: () => {
            setIsRedirecting(true);
            payMongoRefund(
              (booking.originalPrice - booking.balance).toString(),
              booking.bussiness ? booking.bussiness._id : booking.artist._id,
              booking.client._id,
            );
          },
        },
      );
    });
  };

  return { handleRefund, isRedirecting };
}
