
  
export interface TattooDataInterface {
    modelUrl: string
    meshName: string
    size : number,
    position: {
      x: number
      y: number
      z: number
    }
  
    rotation: {
      x: number
      y: number
      z: number
      order: "XYZ" | "YXZ" | "ZXY" | "ZYX" | "YZX" | "XZY"
    }
  
    scale: number
  
    uv?: {
      u: number
      v: number
    }
  }
  