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
import { useMemo, useState } from "react"
import { bookingInterface } from "@/app/types/booking.type"
import { payMongoBooking } from "@/app/utils/payMongo"
import { LoaderCircle, DollarSign } from "lucide-react"
import { Controller } from "react-hook-form"
import { useZodForm } from "@/lib/validation/useZodForm"
import { makeOnlinePaymentSchema } from "@/lib/validation/schemas/payment"
import { MoneyInput } from "@/components/ui/money-input"
import { FieldError } from "@/components/ui/field-error"


export function OnlinePayment({ booking } : { booking : bookingInterface}) {

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const balance = Number(booking.balance)
  const schema = useMemo(() => makeOnlinePaymentSchema(balance), [balance])

  const {
    control,
    handleSubmit: rhfSubmit,
    formState: { errors, isValid },
  } = useZodForm(schema, { defaultValues: { amount: booking.balance?.toString() ?? "" } })

  const handleSubmit = rhfSubmit((values) => {
    setIsLoading(true)
    const sender = booking.client._id
    const receiver = booking.bussiness?._id ?? booking.artist._id
    const bookingId = booking._id
    payMongoBooking(String(values.amount), sender, receiver, bookingId)
  })


    
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
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.amount}
                  placeholder="Enter amount"
                />
              )}
            />
            <FieldError>{errors.amount?.message}</FieldError>
            </div>

        </div>


        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={isLoading || !isValid} className="w-full">
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
