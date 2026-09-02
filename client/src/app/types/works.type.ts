/* ---------- Layer ---------- */
export interface layerInterface {
  id: string;
  src: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  grayscale: boolean;
  name?: string;
}

/* ---------- Stage ---------- */
export interface stageInterface {
  scale: number;
  position: {
    x: number;
    y: number;
  };
}

/* ---------- Design ---------- */
export interface designInterface {
  stage: stageInterface;
  layers: layerInterface[];
}

export interface worksInterfaceInput {
    artist: string; // TattooArtist _id
    design: designInterface;  
    screenShot : string
}
  

/* ---------- Works ---------- */
export interface worksInterface {
  _id: string;
  artist: string; // TattooArtist _id
  design: designInterface;  
  screenShot : string
}
