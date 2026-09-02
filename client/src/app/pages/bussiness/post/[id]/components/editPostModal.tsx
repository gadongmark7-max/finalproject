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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ImageIcon,
  Plus,
  X,
  Clock,
  Layers,
  Tag,
  Edit
} from "lucide-react"
import { useState, useEffect } from "react"
import { postInterface } from "@/app/types/post.type"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"

interface dataInterface {
    tags : string[], 
    category : string,
    sessions : number[],
    price : number
}

export function EditPostmodal({ post , setPost} : { post : postInterface, setPost : (data : postInterface) => void}) {

  const [open, setOpen] = useState(false);

  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(post.tags)
  const [category, setCategory] = useState(post.category)
  const [price, setPrice] = useState(post.price)
  const [sessionInput, setSessionInput] = useState(0)
  const [sessions, setSessions] = useState<number[]>(post.sessions)


  const addTag = () => {
    if(tags.length >= 5) return errorAlert("the maximum tags is 5")
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return errorAlert("invalid")
    setTags([...tags, tagInput.trim()])
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addSession = () => {
    if (!sessionInput) return errorAlert("Session cannot be empty")
    setSessions([...sessions, sessionInput])
    setSessionInput(0)
  }

  // Remove a session
  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }


  const updateMutation = useMutation({
    mutationFn : (data : dataInterface) => axiosInstance.put(`/post/${post._id}`, data),
    onSuccess : (response) => {
        setPost(response.data)
        successAlert("saved Changes")
        setOpen(false)
    },
    onError : () => errorAlert("ERROR ACCOUR")
  })

  const handleSave = () => {
    if(!category || !sessions || !price ) return errorAlert("empty field")
    updateMutation.mutate({
        tags,
        sessions,
        category,
        price
    })
  }

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className=" text-lg py-6 mt-2" onClick={() => setOpen(true)}>
                <Edit /> Edit
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>   
           
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6">

        <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className=" w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realism">Realism</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="blackwork">Blackwork</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mt-3">
                <Label className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Price 
                </Label>

                <div className="flex gap-2">
                  <Input
                    placeholder="Estimated time per Session (e.g., 2hrs)"
                    value={price}
                    type="number"
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-3">
                <Label className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Sessions (Input Time per Secssion)
                </Label>

                <div className="flex gap-2">
                  <Input
                    placeholder="Estimated time per Session (e.g., 2hrs)"
                    value={sessionInput}
                    type="number"
                    onChange={(e) => setSessionInput(Number(e.target.value))}
                  />
                  <Button type="button" onClick={addSession}>
                    <Plus />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {sessions.map((session, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="shadow flex items-center gap-1 hover:text-red-500 cursor-pointer"
                      onClick={() => removeSession(index)}
                    >
                      Session {index + 1} ({session} {session != 1 ? "hrs" : "hr"}) 
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="space-y-2 mt-5">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </Label>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="shadow  flex items-center gap-1  hover:text-red-500" onClick={() => removeTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>

            </div>

        </div>

        <DialogFooter>
          <Button type="submit" className="w-full" onClick={handleSave}>  Save Changes  </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
