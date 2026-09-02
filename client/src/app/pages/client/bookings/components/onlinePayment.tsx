"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert } from "@/app/utils/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { bookingInterface } from "@/app/types/booking.type"
import { payMongoBooking } from "@/app/utils/payMongo"
import { LoaderCircle, ArrowDown, Wallet, DollarSign } from "lucide-react"


export function OnlinePayment({ booking } : { booking : bookingInterface}) {

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const [amount, setAmount] = useState(booking.balance.toString())

  const isInvalidAmount = () => !amount || Number(amount) > Number(booking.balance)
 

  const handleSubmit = () => {
    if(isInvalidAmount()) return errorAlert("invalid amount")
    setIsLoading(true)
    const sender = booking.client._id
    const receiver = booking.bussiness?._id ?? booking.artist._id
    const bookingId = booking._id
    payMongoBooking(amount,sender, receiver, bookingId)
  }


    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className=""  onClick={() => setOpen(true)}>
               <DollarSign />  online payment
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
            <DialogTitle>Send Payment</DialogTitle>
            <DialogDescription>
            Review the details before proceeding with payment.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

            {/* Receiver */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                    src={booking.bussiness?.profile ?? booking.artist.profile}
                    alt="receiver"
                    className="w-14 h-14 rounded-full object-cover"
                />

                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Sending payment to</p>
                    <p className="font-semibold text-gold">
                    {booking.bussiness?.name ?? booking.artist.name}
                    </p>
                </div>
            </div>

 

            {/* Amount */}
            <div className="space-y-2">
            <label className="text-sm font-medium text-gold">Amount</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₱
                </span>
                <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-8 ${isInvalidAmount() && "border-red-500 focus-visible:ring-red-500"}`}
                placeholder="Enter amount"
                />
            </div>
            </div>

        </div>


        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            Proceed To Payment
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}
