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
import { useState, useContext, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert } from "@/app/utils/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { bookingInterface } from "@/app/types/booking.type"
import { payMongoBooking } from "@/app/utils/payMongo"
import { LoaderCircle, ArrowDown, Wallet, DollarSign, ArrowBigRight , DollarSignIcon, Download} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUserStore from "@/app/store/useUserStore"
import Image from "next/image"

const money = [20, 50, 100, 200, 500, 1000]



export function CashPayment({ booking , refetch} : { booking : bookingInterface, refetch : () => void}) {

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {user} = useUserStore()

  const[showReceipt, setShowReceipt] = useState(false);

  const [amount, setAmount] = useState(booking.balance)

  const [payment, setPayment] = useState(0)

  const [paymentMethod, setPayemntMethod] = useState("Cash")

  const isInvalidAmount = () => !amount || Number(amount) > Number(booking.balance)

  const paymentMutation = useMutation({
    mutationFn : (data : { amount : number ,sender : string, receiver : string, bookingId : string } ) => axiosInstance.post(`/booking/cashPayment`, data),
    onSuccess : (response) => {
       setIsLoading(false)
       successAlert("payment recorded")
       setShowReceipt(true)
    },
    onError : () => errorAlert("error accour")
  })


  useEffect(() => {
    if(showReceipt) refetch()
  }, [open])

  const handleSubmit = () => {
    if(isInvalidAmount()) return errorAlert("invalid amount")
    setIsLoading(true)
    const sender = booking.client._id
    const receiver = booking.bussiness?._id ?? booking.artist._id
    const bookingId = booking._id
    paymentMutation.mutate({amount : Number(amount) ,sender, receiver, bookingId})
  }

  
  const addMoney = (amount : number) => {
    setPayment((prev) => prev += amount)
  }

  const now = new Date();

  const date = now.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const day = now.toLocaleDateString("en-PH", {
    weekday: "long",
  });
  
  const time = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const baseAmount = Number(amount || 0);
  const tax = baseAmount * 0.14;
  const subTotal = baseAmount -  tax
  const total = baseAmount;
  
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
               <Button className="">
                  <DollarSignIcon />  Payment
                </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
            <DialogTitle>Walk In Record Payment</DialogTitle>
            <DialogDescription>
            Review the details before proceeding to record.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">


          {showReceipt && (
            <div className="bg-[#fafafa] w-4/6 m-auto p-8 rounded-sm border border-gray-300 font-mono text-sm shadow-sm relative" id="receipt">

     
         
             
               {/* Receipt Header */}
               <div className="text-center mb-6">
                 <h2 className="text-lg font-bold tracking-widest">PAYMENT RECEIPT</h2>
                 <p className="text-gray-500 text-xs mt-1">
                   Tattoo Booking System
                 </p>
               </div>
         
               {/* Date info */}
               <div className="mb-4 text-gray-700">
                 <div className="flex justify-between">
                   <span>Date</span>
                   <span>{date}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Day</span>
                   <span>{day}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Time</span>
                   <span>{time}</span>
                 </div>
               </div>
         
               <div className="border-t border-dashed border-gray-400 my-4" />
         
               {/* Transaction info */}
               <div className="space-y-2 text-gray-800">
              
                 <div className="flex justify-between">
                   <span>Reference No.</span>
                   <span>{Date.now()}</span>
                 </div>

                 <div className="flex justify-between">
                   <span>Payment Method</span>
                   <span>{paymentMethod}</span>
                 </div>
                
                 <div className="flex justify-between">
                   <span>Recorded By</span>
                   <span>{user?.name}</span>
                 </div>

                 <div className="flex justify-between">
                   <span>Paid To</span>
                   <span>{booking.bussiness ? booking.bussiness.name : booking.artist.name}</span>
                 </div>
               </div>
         
               <div className="border-t border-dashed border-gray-400 my-4" />
         
               {/* Amounts */}
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span>Subtotal</span>
                   <span>₱{subTotal.toFixed(2)}</span>
                 </div>
         
                 <div className="flex justify-between">
                   <span>Tax (14%)</span>
                   <span>₱{tax.toFixed(2)}</span>
                 </div>
               </div>
         
               <div className="border-t border-dashed border-gray-400 my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span>₱{payment.toFixed(2)}</span>
                  </div>
          
                  <div className="flex justify-between">
                    <span>Change </span>
                    <span>₱{payment - amount}</span>
                  </div>
                </div>

               <div className="border-t border-dashed border-gray-400 my-4" />
         
               <div className="flex justify-between font-bold text-base">
                 <span>TOTAL PAID</span>
                 <span>₱{total.toFixed(2)}</span>
               </div>
         
             


            </div>
          )}

          {!showReceipt && (
            <>
            <div className="flex items-center gap-4 p-4 border-2 border-secondary ">
                <img
                    src={booking.client?.profile}
                    alt="receiver"
                    className="w-14 h-14 rounded-full object-cover"
                />

                <div className="flex-1">
                    <p className="text-sm text-stone-500">Client</p>
                    <p className="font-semibold text-white">
                    {booking.client?.name }
                    </p>
                </div>

                <div className="">
                    <p className="text-sm text-stone-500">Current Balance</p>
                    <p className="font-semibold text-base text-green-500 ">
                    ₱{booking.balance }
                    </p>
                </div>
            </div>

 

          

            <div className="flex gap-3 w-full mt-2">

            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-stone-500">Amount</label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                  ₱
                  </span>
                  <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`pl-8 ${isInvalidAmount() && "border-red-500 focus-visible:ring-red-500"}`}
                  placeholder="Enter amount"
                  />
              </div>
            </div>


            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-stone-500">Customer Payment</label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                  ₱
                  </span>
                  <Input
                  type="number"
                  value={payment}
                  onChange={(e) => setPayment(Number(e.target.value))}
                  className={`pl-8 ${ payment < amount && "border-red-500 focus-visible:ring-red-500"}`}
                  placeholder="Enter amount"
                  />
              </div>
            </div>


            <div className="space-y-2 w-full  ">
                <label className="text-stone-500">Payment Method</label>
                <Select onValueChange={setPayemntMethod} value={paymentMethod}>
                  <SelectTrigger className=" w-full">
                    <SelectValue placeholder="Select payment methopd" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"Cash"}>   Cash </SelectItem>
                    <SelectItem value={"Gcash"}>   Gcash </SelectItem>
                    <SelectItem value={"Pay maya"}>   Pay maya </SelectItem>
                    <SelectItem value={"Bank Transfer"}>   Bank Transfer </SelectItem>
                  </SelectContent>
                </Select>
            </div>


            </div>

            <div className="w-full  grid grid-cols-3 gap-3 mt-3 mb-3">
            {money.map((money) => (
              <div
                key={money}
                onClick={() => addMoney(money)}
                className="h-24 bg-red-100 shadow-xl relative cursor-pointer 
                          transition-transform duration-150 
                          active:scale-90 hover:scale-105"
              >
                <Image
                  src={`/money/${money}.jpg`}
                  alt={`Money ${money}`}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || (payment < amount) || (amount <= 0)}  className="w-full mt-3">
              {isLoading && (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              )}
              Record Cash Payment
            </Button>
            
            </>
          )}

        

        </div>


  
      </DialogContent>

    </Dialog>
  )
}
