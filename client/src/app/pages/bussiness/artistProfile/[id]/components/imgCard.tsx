"use client"



export default function ImgCard({ images , type, addImg} :  { images : string[], type : string, addImg : boolean }) {

  if(images.length == 0){
    return(
        <div className="w-full flex gap-3 ">
             <div   className="w-[200px] h-[250px] rounded shadow border flex justify-center items-center">
                <h1> No images </h1>
            </div>
            

        </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden flex gap-3">
    {images.map((img, index) => (
      <div key={index} className="min-w-[200px] h-[250px] rounded shadow border">
        <img
          src={img}
          alt=""
          className="w-full h-full rounded object-cover"
        />
      </div>
    ))}

  </div>
  
  )
}
