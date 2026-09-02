import { useMutation } from "@tanstack/react-query"
import { attendanceInterface } from "@/app/types/attendance.type"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"
import { Button } from "./button"

export default function OtAction({ refetch , attendance} : { refetch : () => void, attendance : attendanceInterface}) {

  const mutation = useMutation({
    mutationFn : (data : { id : string, action : string}) => axiosInstance.post("/account/attendance/ot", data),
    onSuccess : (response) => {
      successAlert("Ot recorded")
      refetch()
    }, onError : () => errorAlert("error accour")
  })

  const handlerAction = () => {
    confirmAlert(`you want to submit request ot`, "submit", () => {
        mutation.mutate({
            id : attendance._id,
            action : "pending"
        })
    })
  }


  if(attendance.ot == 0) return null

  switch(attendance.otStatus){
    case "request":
      return(
          <Button hoverText={"request"} size={"icon"} onClick={handlerAction}>
            / 
          </Button>
        )
    break;

    case "pending":
      return(
          <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-warning-muted text-warning  border border-success-border">
              Pending
          </span>
      )
    break;

    case "rejected":
      return(
        <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-danger-muted text-danger  border border-success-border">
              Rejected
        </span>
      )
    break;

    case "recorded":
      return(
        <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-success-muted text-success  border border-success-border">
              Recorded
        </span>
      )
    break;
  }
  
 }
