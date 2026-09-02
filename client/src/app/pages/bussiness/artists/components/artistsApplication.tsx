"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { artistApplicationInterface, bussinessInfoInterface } from "@/app/types/accounts.type"
import { errorAlert, confirmAlert, successAlert } from "@/app/utils/alert"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export function ArtistsApplication({
  userId,
  setBussinessInfo,
}: {
  userId: string
  setBussinessInfo: (data: bussinessInfoInterface) => void | null
}) {
  const [open, setOpen] = useState(false)

  const { data: artistsApplication, refetch } = useQuery({
    queryKey: ["artists_applications"],
    queryFn: async (): Promise<artistApplicationInterface[]> => {
      const response = await axiosInstance.get(`/account/artistApplication/${userId}`)
      return response.data
    },
  })

  const approvalMutation = useMutation({
    mutationFn: (data: { artistId: string; action: string; applicationId: string }) =>
      axiosInstance.post("/account/applicationApproval", data),
    onSuccess: (response) => {
      successAlert("Success")
      setBussinessInfo(response.data)
      refetch()
    },
    onError: () => errorAlert("Error occurred"),
  })

  const actionHander = (artistId: string, applicationId: string, action: "approve" | "reject") => {
    confirmAlert(`You want to ${action} this artist?`, action, () => {
      approvalMutation.mutate({ artistId, applicationId, action })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Artist Requests ({artistsApplication?.length || 0})</Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Artist Requests</DialogTitle>
          <DialogDescription>Review and approve artist applications</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto w-full">
          {artistsApplication?.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No artist requests available</div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>Date</TableHead>
                
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {artistsApplication?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={item.artist.profile}
                          alt={item.artist.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <span className="font-medium">{item.artist.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>{item.date}</TableCell>
                    

                    <TableCell>
                      <div className="flex items-center gap-2 justify-end ">
                        <Button
                          size="sm"
                          onClick={() =>
                            actionHander(item.artist._id, item._id, "approve")
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            actionHander(item.artist._id, item._id, "reject")
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Link
                          href={`/pages/bussiness/artistProfile/${item.artist._id}`}
                          className="text-xs text-blue-600 underline"
                        >
                          <Button size={"sm"}>
                             View
                          </Button>
                          
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}