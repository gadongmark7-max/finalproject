"use client"
import { Plus } from "lucide-react"
import { UploadImageModal } from "./uploadImageModal"

export default function ImgCard({ files , type, addImg} :  { files : { fileUrl : string, fileType  :string, type  :string}[], type : string, addImg : boolean }) {

  if(files.length == 0){
    return(
        <div className="w-full flex gap-3 ">
             <div   className="w-[200px] h-[250px] rounded shadow border flex justify-center items-center">
                <h1> No images </h1>
            </div>
            {addImg && <UploadImageModal type={type} />}

        </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden flex gap-3">
    {files.map((file, index) => (
      <div key={index} className="min-w-[200px] h-[250px] rounded shadow border">
        {file.fileType == "image"
          ?(    <img
            src={file.fileUrl}
            alt=""
            className="w-full h-full rounded object-cover"
          />
          ):(
            <video
              src={file.fileUrl}
              className="w-full h-full rounded object-cover"
              autoPlay
              loop
              muted
            />
          
        )
        }
    
      </div>
    ))}
    {addImg && <UploadImageModal type={type} />}
  </div>
  
  )
}
