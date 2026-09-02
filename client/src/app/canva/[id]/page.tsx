"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { ArrowLeft,Upload, Save  ,Eraser, Image, Copy, FlipHorizontal, FlipVertical, Palette, ZoomIn, ZoomOut, Undo, ChevronUp, ChevronDown, Loader2, Search, X } from 'lucide-react';
import Konva from 'konva';
import { removeBackground } from '@imgly/background-removal';
import useUpload from '../../utils/upload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from "next/navigation"
import axiosInstance from '@/app/utils/axios';
import useUserStore from '@/app/store/useUserStore';
import { designInterface } from '@/app/types/works.type';
import { successAlert, errorAlert, confirmAlert } from '@/app/utils/alert';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ImageLayer {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  grayscale: boolean;
  name: string;
}

// NEW: History entry type for image editing
interface ImageEditHistoryEntry {
  type: 'image-edit';
  layerId: string;
  before: string; // base64 data URL
  after: string;  // base64 data URL
}

// NEW: History entry type for layer changes (existing behavior)
interface LayerHistoryEntry {
  type: 'layers';
  layers: ImageLayer[];
}


const brushTypes: ("normal" | "stipple" | "sketch")[] = ["normal", "stipple", "sketch"]


type HistoryEntry = ImageEditHistoryEntry | LayerHistoryEntry;

const TattooEditor: React.FC = () => {

  const router = useRouter()

  const [layers, setLayers] = useState<ImageLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'eraser' | 'brush'>('select');
  const [eraserSize, setEraserSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushType, setBrushType] = useState<'normal' | 'tattoo' | 'stipple' | 'sketch'>('normal');
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showShapesModal, setShowShapesModal] = useState(false);
  
  // NEW: Updated history to use discriminated union
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragable, setIsDragable] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // NEW: Capture image state before editing starts
  const beforeImageRef = useRef<string | null>(null);

  // Image search states
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isCanvaSaving, setIsCanvaSaving] = useState(false);


  const { user } = useUserStore()

  const params = useParams()
  const paramsId = params.id as string


  const { data } = useQuery({
    queryKey : ['canva_design'],
    queryFn : () =>  axiosInstance.get(`/works/${paramsId}`),
    enabled: paramsId !== 'new'
  })

  useEffect(() => {
    if(paramsId != "new" && data?.data){
      const design : designInterface  = data?.data.design
      loadDesign(design)
    }
  }, [data])
  

  const createMutation = useMutation({
    mutationFn : (data : { design : designInterface, screenShot : string}) => axiosInstance.post("/works", data),
    onSuccess : () => {
      successAlert("design saved")
      setIsCanvaSaving(false)
    },
    onError : (err) => errorAlert("error accour")
  })

  const updateMutation = useMutation({
    mutationFn : (data : { id : string, design : designInterface, screenShot : string}) => axiosInstance.put("/works", data),
    onSuccess : () => {
      successAlert("design saved")
      setIsCanvaSaving(false)
    },
    onError : (err) => errorAlert("error accour")
  })

  

  const saveCanva = async () => {
    if (!stageRef.current) return;
    setIsCanvaSaving(true)
    const savedLayers = [];
  
    for (const layer of layers) {
      const canvas = document.createElement("canvas");
      canvas.width = layer.image.width;
      canvas.height = layer.image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(layer.image, 0, 0);

      // Note: useUpload is not available, so this will need to be replaced
      // For now, storing as data URL
      // Convert canvas to File
      const file = await dataUrlToFile(canvas.toDataURL("image/png"), `${layer.name}.png`);

      // Upload file
      const url = await useUpload(file, "image");
  
      savedLayers.push({
        id: layer.id,
        src: url,
        x: layer.x,
        y: layer.y,
        scaleX: layer.scaleX,
        scaleY: layer.scaleY,
        rotation: layer.rotation,
        grayscale: layer.grayscale,
        name: layer.name,
      });
    }
  
    const design = {
      stage: {
        scale: stageScale,
        position: stagePos,
      },
      layers: savedLayers,
    };

    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // higher quality
    });
  
    const screenShot = await dataUrlToFile(dataURL, "screenshot.png")

    const screenShoturl = await useUpload(screenShot, "image")

    if(paramsId == "new"){
      createMutation.mutate({
        screenShot : screenShoturl,
        design : design
      }) 
    } else {
      updateMutation.mutate({
        id : paramsId,
        screenShot : screenShoturl,
        design : design
      }) 
    }

  };


  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const loadDesign = async (design : designInterface) => { 
    setSelectedId(null);
    setLayers([]);
  
    setStageScale(design.stage.scale);
    setStagePos(design.stage.position);
  
    try {
      const loadedLayers: ImageLayer[] = await Promise.all(
        design.layers.map((layer: any) => {
          return new Promise<ImageLayer>((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
  
            img.onload = () => {
              resolve({
                ...layer,
                image: img,
              });
            };
  
            img.onerror = () => reject(`Failed to load ${layer.src}`);
  
            img.src = layer.src;
          });
        })
      );
  
      setLayers(loadedLayers);
  
    } catch (err) {
      console.error(err);
      alert("Failed to load some images");
    }
  };

 
  const exportCanvasImage = () => {
    if (!stageRef.current) return;
  
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // higher quality
    });
  
    console.log(dataURL); // base64 image
  
    // optional: auto-download
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  
  const searchImages = async () => {
    if (!query) return;
    setSearchLoading(true);

    const access_key = "9ePq1VRU6wkrc2gpyKPxmaVwXxrI2OC3wSA-rlbqnDI"

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${access_key}`
      );

      const data = await res.json();
      setImages(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setImages([]);
    }
    setSearchLoading(false);
  };

  const clickSearchImage = (url: string, description: string) => {
    confirmAlert("you want to add this image?", "add", () => {
      setIsAddingImage(true)
      setShowSearchModal(false);
      loadSearchedImage(url, description)
    })
  }

  const loadSearchedImage = (url: string, description: string) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const newLayer: ImageLayer = {
        id: `layer-${Date.now()}`,
        image: img,
        x: 50,
        y: 50,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        grayscale: false,
        name: description || 'Searched Image',
      };
      const newLayers = [...layers, newLayer];
      updateLayersHistory(newLayers); // Use layer history for new layers
      setQuery("");
      setImages([]);
      setIsAddingImage(false);
    };
    img.src = url;
  };

  const createShape = (shapeType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = brushColor;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (shapeType) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(centerX - 150, centerY - 150, 300, 300);
        break;

      case 'rectangle':
        ctx.fillRect(centerX - 180, centerY - 120, 360, 240);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 150);
        ctx.lineTo(centerX + 150, centerY + 130);
        ctx.lineTo(centerX - 150, centerY + 130);
        ctx.closePath();
        ctx.fill();
        break;

      case 'star':
        const spikes = 5;
        const outerRadius = 150;
        const innerRadius = 70;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'heart':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 50);
        ctx.bezierCurveTo(centerX, centerY - 30, centerX - 100, centerY - 100, centerX - 100, centerY - 30);
        ctx.bezierCurveTo(centerX - 100, centerY + 20, centerX, centerY + 80, centerX, centerY + 150);
        ctx.bezierCurveTo(centerX, centerY + 80, centerX + 100, centerY + 20, centerX + 100, centerY - 30);
        ctx.bezierCurveTo(centerX + 100, centerY - 100, centerX, centerY - 30, centerX, centerY + 50);
        ctx.fill();
        break;

      case 'hexagon':
        const size = 150;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = centerX + size * Math.cos(angle);
          const y = centerY + size * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 150);
        ctx.lineTo(centerX + 100, centerY);
        ctx.lineTo(centerX, centerY + 150);
        ctx.lineTo(centerX - 100, centerY);
        ctx.closePath();
        ctx.fill();
        break;
    }

    const newImg = new window.Image();
    newImg.onload = () => {
      const newLayer: ImageLayer = {
        id: `layer-${Date.now()}`,
        image: newImg,
        x: 200,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        grayscale: false,
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      };
      const newLayers = [...layers, newLayer];
      updateLayersHistory(newLayers);
      setShowShapesModal(false);
    };
    newImg.src = canvas.toDataURL();
  };

  // NEW: Save layer-based history (for transforms, new layers, etc.)
  const saveLayerHistory = (newLayers: ImageLayer[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ 
      type: 'layers',
      layers: newLayers 
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // NEW: Save image-edit history (for pixel-based edits)
  const saveImageEditHistory = (layerId: string, beforeDataUrl: string, afterDataUrl: string) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({
      type: 'image-edit',
      layerId,
      before: beforeDataUrl,
      after: afterDataUrl
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Wrapper for layer updates (existing behavior)
  const updateLayersHistory = (newLayers: ImageLayer[]) => {
    setLayers(newLayers);
    saveLayerHistory(newLayers);
  };

  // NEW: Unified undo function
  const undo = () => {
    if (historyStep <= 0) return;

    const prevEntry = history[historyStep - 1];
    
    if (prevEntry.type === 'layers') {
      // Restore full layer state
      setLayers(prevEntry.layers);
      setHistoryStep(historyStep - 1);
    } else if (prevEntry.type === 'image-edit') {
      // Restore only the edited layer's image
      const img = new window.Image();
      img.onload = () => {
        setLayers(prev => {
          const newLayers = prev.map(layer => 
            layer.id === prevEntry.layerId 
              ? { ...layer, image: img }
              : layer
          );
          
          // ✅ Force re-render by updating the image reference
          const stage = stageRef.current;
          if (stage) {
            const imageNode = stage.findOne(`#${prevEntry.layerId}`) as Konva.Image;
            if (imageNode) {
              imageNode.image(img);
              imageNode.cache();
              imageNode.getLayer()?.batchDraw();
            }
          }
          
          return newLayers;
        });
        setHistoryStep(historyStep - 1);
      };
      img.src = prevEntry.before;
    }
  };

  // NEW: Unified redo function
  const redo = () => {
    if (historyStep >= history.length - 1) return;

    const nextEntry = history[historyStep + 1];
    
    if (nextEntry.type === 'layers') {
      // Restore full layer state
      setLayers(nextEntry.layers);
      setHistoryStep(historyStep + 1);
    } else if (nextEntry.type === 'image-edit') {
      // Restore only the edited layer's image
      const img = new window.Image();
      img.onload = () => {
        setLayers(prev => {
          const newLayers = prev.map(layer => 
            layer.id === nextEntry.layerId 
              ? { ...layer, image: img }
              : layer
          );
          
          // ✅ Force re-render by updating the image reference
          const stage = stageRef.current;
          if (stage) {
            const imageNode = stage.findOne(`#${nextEntry.layerId}`) as Konva.Image;
            if (imageNode) {
              imageNode.image(img);
              imageNode.cache();
              imageNode.getLayer()?.batchDraw();
            }
          }
          
          return newLayers;
        });
        setHistoryStep(historyStep + 1);
      };
      img.src = nextEntry.after;
    }
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const newLayer: ImageLayer = {
          id: `layer-${Date.now()}`,
          image: img,
          x: 50,
          y: 50,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          grayscale: false,
          name: file.name,
        };
        const newLayers = [...layers, newLayer];
        updateLayersHistory(newLayers);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      loadImage(files[0]);
    }
  };

  const toggleGrayscale = () => {
    if (!selectedId) return;
    const newLayers = layers.map(layer => 
      layer.id === selectedId 
        ? { ...layer, grayscale: !layer.grayscale }
        : layer
    );
    updateLayersHistory(newLayers);
  };

  const handleRemoveBackground = async () => {
    if (!selectedId) return;
    
    const layer = layers.find(l => l.id === selectedId);
    if (!layer) return;

    setIsRemovingBg(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = layer.image.width;
      canvas.height = layer.image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsRemovingBg(false);
        return;
      }

      ctx.drawImage(layer.image, 0, 0);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      const result = await removeBackground(blob);
      
      const url = URL.createObjectURL(result);
      const newImg = new window.Image();
      
      newImg.onload = () => {
        const newLayers = layers.map(l =>
          l.id === selectedId ? { ...l, image: newImg } : l
        );
        updateLayersHistory(newLayers);
        setIsRemovingBg(false);
        URL.revokeObjectURL(url);
      };

      newImg.onerror = () => {
        setIsRemovingBg(false);
        URL.revokeObjectURL(url);
        alert('Failed to remove background');
      };

      newImg.src = url;
    } catch (error) {
      console.error('Error removing background:', error);
      setIsRemovingBg(false);
      alert('Failed to remove background. Please try again.');
    }

    toggleGrayscale()
    toggleGrayscale()
  };

  const duplicateLayer = () => {
    if (!selectedId) return;
    const layerToDuplicate = layers.find(l => l.id === selectedId);
    if (layerToDuplicate) {
      const newLayer: ImageLayer = {
        ...layerToDuplicate,
        id: `layer-${Date.now()}`,
        x: layerToDuplicate.x + 20,
        y: layerToDuplicate.y + 20,
        name: `${layerToDuplicate.name} (copy)`,
      };
      const newLayers = [...layers, newLayer];
      updateLayersHistory(newLayers);
    }
  };

  const flipHorizontal = () => {
    if (!selectedId) return;
    const newLayers = layers.map(layer => 
      layer.id === selectedId 
        ? { ...layer, scaleX: -layer.scaleX }
        : layer
    );
    updateLayersHistory(newLayers);
  };

  const flipVertical = () => {
    if (!selectedId) return;
    const newLayers = layers.map(layer => 
      layer.id === selectedId 
        ? { ...layer, scaleY: -layer.scaleY }
        : layer
    );
    updateLayersHistory(newLayers);
  };

  const moveLayerUp = () => {
    if (!selectedId) return;
    const index = layers.findIndex(l => l.id === selectedId);
    if (index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      updateLayersHistory(newLayers);
    }
  };

  const moveLayerDown = () => {
    if (!selectedId) return;
    const index = layers.findIndex(l => l.id === selectedId);
    if (index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      updateLayersHistory(newLayers);
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newLayers = layers.filter(l => l.id !== selectedId);
    updateLayersHistory(newLayers);
    setSelectedId(null);
  };



  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setStageScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(5, stageScale * 1.2);
    setStageScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, stageScale * 0.8);
    setStageScale(newScale);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'eraser' || tool === 'brush') {
      // ✅ Eraser only works when a layer is selected
      if (tool === 'eraser' && !selectedId) {
        return; // Don't allow erasing without selection
      }

      setIsDragable(false)

      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;

      setIsDrawing(true);
      setLastPos(pos);

      // Handle creating new drawing layer (only for brush)
      if (!selectedId && tool === 'brush') {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const newImg = new window.Image();
        newImg.onload = () => {
          const newLayer: ImageLayer = {
            id: `layer-${Date.now()}`,
            image: newImg,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            grayscale: false,
            name: 'Drawing Layer',
          };
          const newLayers = [...layers, newLayer];
          setLayers(newLayers);
          setSelectedId(newLayer.id);
          
          // ✅ Save initial history for new layer
          saveLayerHistory(newLayers);
        };
        newImg.src = canvas.toDataURL();
        return;
      }

      const layer = layers.find(l => l.id === selectedId);
      if (!layer) return;

      // ✅ CAPTURE IMAGE STATE BEFORE EDITING (for both brush AND eraser)
      const canvas = document.createElement('canvas');
      canvas.width = layer.image.width;
      canvas.height = layer.image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(layer.image, 0, 0);
      beforeImageRef.current = canvas.toDataURL('image/png');

      const imageNode = stage.findOne(`#${selectedId}`) as Konva.Image;
      if (!imageNode) return;

      // Continue with first brush/erase stroke
      const transform = imageNode.getAbsoluteTransform().copy().invert();
      const localPos = transform.point(pos);
      
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.fillStyle = tool === 'brush' ? brushColor : 'black';
      ctx.strokeStyle = tool === 'brush' ? brushColor : 'black';
      ctx.globalAlpha = tool === 'brush' ? brushOpacity : 1;
      
      if (tool === 'brush') {
        switch (brushType) {
          case 'stipple':
            for (let i = 0; i < 5; i++) {
              const offsetX = (Math.random() - 0.5) * eraserSize;
              const offsetY = (Math.random() - 0.5) * eraserSize;
              ctx.beginPath();
              ctx.arc(localPos.x + offsetX, localPos.y + offsetY, eraserSize * 0.2, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case 'sketch':
            ctx.lineWidth = eraserSize * 0.3;
            ctx.lineCap = 'round';
            for (let i = 0; i < 3; i++) {
              const angle = (Math.PI * 2 / 3) * i;
              const r = eraserSize * 0.3;
              ctx.beginPath();
              ctx.moveTo(localPos.x, localPos.y);
              ctx.lineTo(localPos.x + Math.cos(angle) * r, localPos.y + Math.sin(angle) * r);
              ctx.stroke();
            }
            break;
          default:
            ctx.beginPath();
            ctx.arc(localPos.x, localPos.y, eraserSize, 0, Math.PI * 2);
            ctx.fill();
        }
      } else {
        // ✅ Eraser logic
        ctx.beginPath();
        ctx.arc(localPos.x, localPos.y, eraserSize, 0, Math.PI * 2);
        ctx.fill();
      }

      const newImg = new window.Image();
      
      newImg.onload = () => {
        const newLayers = layers.map(l =>
          l.id === selectedId ? { ...l, image: newImg } : l
        );
        setLayers(newLayers); // Update state only, NO history yet

        imageNode.image(newImg);
        imageNode.cache();
        imageNode.getLayer()?.batchDraw();
      };

      newImg.src = canvas.toDataURL();
    } else if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || (tool !== 'eraser' && tool !== 'brush') || !selectedId) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos || !lastPos) return;

    const layer = layers.find(l => l.id === selectedId);
    if (!layer) return;

    const imageNode = stage.findOne(`#${selectedId}`) as Konva.Image;
    if (!imageNode) return;

    const canvas = document.createElement('canvas');
    canvas.width = layer.image.width;
    canvas.height = layer.image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(layer.image, 0, 0);
    
    const transform = imageNode.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);
    const localLastPos = transform.point(lastPos);
    
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = tool === 'brush' ? brushColor : 'black';
    ctx.strokeStyle = tool === 'brush' ? brushColor : 'black';
    ctx.globalAlpha = tool === 'brush' ? brushOpacity : 1;
    
    if (tool === 'brush') {
      switch (brushType) {
        case 'normal':
          ctx.lineWidth = eraserSize * 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(localLastPos.x, localLastPos.y);
          ctx.lineTo(localPos.x, localPos.y);
          ctx.stroke();
          break;
          
        case 'stipple':
          const distance = Math.sqrt(Math.pow(localPos.x - localLastPos.x, 2) + Math.pow(localPos.y - localLastPos.y, 2));
          const steps = Math.max(1, Math.floor(distance / 2));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = localLastPos.x + (localPos.x - localLastPos.x) * t;
            const y = localLastPos.y + (localPos.y - localLastPos.y) * t;
            for (let j = 0; j < 3; j++) {
              const offsetX = (Math.random() - 0.5) * eraserSize;
              const offsetY = (Math.random() - 0.5) * eraserSize;
              ctx.beginPath();
              ctx.arc(x + offsetX, y + offsetY, eraserSize * 0.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
          
        case 'sketch':
          ctx.lineWidth = eraserSize * 0.3;
          ctx.lineCap = 'round';
          for (let i = 0; i < 3; i++) {
            const wobble = eraserSize * 0.3;
            const offsetX1 = (Math.random() - 0.5) * wobble;
            const offsetY1 = (Math.random() - 0.5) * wobble;
            const offsetX2 = (Math.random() - 0.5) * wobble;
            const offsetY2 = (Math.random() - 0.5) * wobble;
            ctx.beginPath();
            ctx.moveTo(localLastPos.x + offsetX1, localLastPos.y + offsetY1);
            ctx.lineTo(localPos.x + offsetX2, localPos.y + offsetY2);
            ctx.stroke();
          }
          break;
      }
    } else {
      // ✅ Eraser move logic
      ctx.lineWidth = eraserSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(localLastPos.x, localLastPos.y);
      ctx.lineTo(localPos.x, localPos.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(localPos.x, localPos.y, eraserSize, 0, Math.PI * 2);
      ctx.fill();
    }

    setLastPos(pos);

    const newImg = new window.Image();
    newImg.onload = () => {
      const newLayers = layers.map(l =>
        l.id === selectedId ? { ...l, image: newImg } : l
      );
      setLayers(newLayers); // ✅ Update state only, NO history during move

      imageNode.image(newImg);
      imageNode.cache();
      imageNode.getLayer()?.batchDraw();
    };

    newImg.src = canvas.toDataURL();
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPos(null);
      
      // ✅ CAPTURE IMAGE STATE AFTER EDITING and SAVE HISTORY
      if (selectedId && beforeImageRef.current) {
        const layer = layers.find(l => l.id === selectedId);
        if (layer) {
          const canvas = document.createElement('canvas');
          canvas.width = layer.image.width;
          canvas.height = layer.image.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(layer.image, 0, 0);
            const afterDataUrl = canvas.toDataURL('image/png');
            
            // Save image-edit history entry
            saveImageEditHistory(selectedId, beforeImageRef.current, afterDataUrl);
            beforeImageRef.current = null; // Clear reference
          }
        }
      }
    }
  };

 
  return (
    <div className="flex h-screen bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Back Button */}
      <Button
        className="absolute left-[335px] top-5 z-[100]"
        size="lg"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft /> Back
      </Button>

      {/* Save Button */}
      <button
        onClick={saveCanva}
        className="absolute top-5 right-5 z-[100] bg-success-muted text-success-light border border-success-border hover:bg-success/10 hover:text-success-light hover:border-success px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] transition-all duration-300 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save
      </button>

      {/* ─── SEARCH MODAL ─── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Reference Library</span>
                </div>
                <h2
                  className="text-2xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Search Tattoo Images
                </h2>
              </div>
              <button
                onClick={() => { setShowSearchModal(false); setQuery(""); setImages([]); }}
                className="p-2 border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-5 border-b border-border">
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                  placeholder="Search tattoo images (e.g., dragon, rose, tribal)"
                  className="flex-1 px-4 py-2.5 bg-surface border border-border text-text text-sm placeholder:text-text-dim focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                />
                <button
                  onClick={searchImages}
                  disabled={searchLoading || !query}
                  className="px-5 py-2.5 bg-gold text-primary text-[10px] uppercase tracking-[0.2em] hover:bg-gold-light transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searchLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Searching...</>
                  ) : (
                    <><Search size={16} /> Search</>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-5">
              {searchLoading && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={36} className="animate-spin text-gold" />
                </div>
              )}
              {!searchLoading && images.length === 0 && (
                <div className="text-center text-text-dim py-16">
                  <p className="text-sm">{query ? "No images found. Try a different search term." : "Enter a search term to find tattoo images"}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer overflow-hidden bg-surface border border-border hover:border-border-gold aspect-square transition-all duration-300"
                    onClick={() => clickSearchImage(img.urls.regular, img.alt_description || 'Tattoo')}
                  >
                    <img
                      src={img.urls.small}
                      alt={img.alt_description}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-[0.2em] text-gold transition-all duration-300">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SHAPES MODAL ─── */}
      {showShapesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary border border-border w-full max-w-2xl">

            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-gold opacity-60" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Geometry</span>
                </div>
                <h2
                  className="text-2xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Add Shape
                </h2>
              </div>
              <button
                onClick={() => setShowShapesModal(false)}
                className="p-2 border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-4 gap-2">
              {['circle', 'square', 'rectangle', 'triangle', 'star', 'heart', 'hexagon', 'diamond'].map((shape) => (
                <button
                  key={shape}
                  onClick={() => createShape(shape)}
                  className="group flex flex-col items-center justify-center p-5 bg-surface border border-border hover:border-border-gold transition-all duration-300"
                >
                  <div className="w-14 h-14 mb-3 flex items-center justify-center">
                    {shape === 'circle' && <div className="w-12 h-12 rounded-full bg-text-muted group-hover:bg-gold transition-colors duration-300" />}
                    {shape === 'square' && <div className="w-12 h-12 bg-text-muted group-hover:bg-gold transition-colors duration-300" />}
                    {shape === 'rectangle' && <div className="w-14 h-8 bg-text-muted group-hover:bg-gold transition-colors duration-300" />}
                    {shape === 'triangle' && <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[42px] border-b-text-muted group-hover:border-b-gold transition-colors duration-300" />}
                    {shape === 'star' && (
                      <svg className="w-12 h-12 fill-text-muted group-hover:fill-gold transition-colors duration-300" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    {shape === 'heart' && (
                      <svg className="w-12 h-12 fill-text-muted group-hover:fill-gold transition-colors duration-300" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    )}
                    {shape === 'hexagon' && (
                      <svg className="w-12 h-12 fill-text-muted group-hover:fill-gold transition-colors duration-300" viewBox="0 0 24 24">
                        <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z" />
                      </svg>
                    )}
                    {shape === 'diamond' && (
                      <svg className="w-12 h-12 fill-text-muted group-hover:fill-gold transition-colors duration-300" viewBox="0 0 24 24">
                        <path d="M12,2L2,12L12,22L22,12L12,2Z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted group-hover:text-gold transition-colors duration-300">{shape}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEFT TOOLBAR ─── */}
      <div className="w-64 bg-secondary border-r border-border flex flex-col overflow-y-auto">

        {/* Toolbar Header */}
        <div className="px-5 pt-8 pb-5 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio</span>
          </div>
          <h1
            className="text-2xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Tattoo Editor
          </h1>
        </div>

        <div className="flex flex-col gap-px bg-border flex-1 overflow-y-auto">

          {/* Upload & Search */}
          <div className="bg-secondary p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-gold block mb-3">Import</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300"
            >
              <Upload size={16} /> Upload Image
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300"
            >
              <Search size={16} /> Search Images
            </button>
            <button
              onClick={() => setShowShapesModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2L2,12L12,22L22,12L12,2Z" /></svg>
              Add Shapes
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>

          {/* Canvas Controls */}
          <div className="bg-secondary p-4 space-y-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-gold block">Canvas</span>
            <div className="flex gap-2">
              <button onClick={zoomIn} className="flex-1 flex items-center justify-center py-2.5 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300">
                <ZoomIn size={16} />
              </button>
              <button onClick={zoomOut} className="flex-1 flex items-center justify-center py-2.5 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300">
                <ZoomOut size={16} />
              </button>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">Zoom: {Math.round(stageScale * 100)}%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Undo size={14} /> Undo
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Undo size={14} className="transform scale-x-[-1]" /> Redo
              </button>
            </div>
          </div>

          {/* Tools */}
          <div className="bg-secondary p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-gold block mb-3">Tools</span>
            <button
              onClick={() => setTool('select')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 border text-xs transition-all duration-300
                ${tool === 'select' ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}`}
            >
              <Image size={16} /> Select
            </button>
            <button
              onClick={() => setTool('eraser')}
              disabled={!selectedId}
              className={`w-full flex items-center gap-2 px-4 py-2.5 border text-xs transition-all duration-300
                ${tool === 'eraser' ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}
                ${!selectedId ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Eraser size={16} /> Eraser
            </button>
            <button
              onClick={() => setTool('brush')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 border text-xs transition-all duration-300
                ${tool === 'brush' ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}`}
            >
              <Palette size={16} /> Brush
            </button>

            {(tool === 'eraser' || tool === 'brush') && (
              <div className="p-4 bg-surface border border-border space-y-4 mt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-text-muted block mb-2">
                    {tool === 'eraser' ? 'Eraser' : 'Brush'} Size: {eraserSize}px
                  </label>
                  <input
                    type="range" min="5" max="50" value={eraserSize}
                    onChange={(e) => setEraserSize(Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                </div>

                {tool === 'brush' && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-text-muted block mb-2">Brush Type</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {
          
                          brushTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setBrushType(type)}
                            className={`px-3 py-2 text-[10px] uppercase tracking-[0.15em] border transition-all duration-300
                              ${brushType === type ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-text-dim mt-2 leading-relaxed">
                        {brushType === 'normal' && 'Smooth solid brush for clean lines'}
                        {brushType === 'stipple' && 'Dotwork/stippling for shading'}
                        {brushType === 'sketch' && 'Rough sketchy lines for outlining'}
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-text-muted block mb-2">Brush Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color" value={brushColor}
                          onChange={(e) => setBrushColor(e.target.value)}
                          className="flex-1 h-10 cursor-pointer bg-surface border border-border"
                        />
                        <div
                          className="w-10 h-10 border border-border flex-shrink-0"
                          style={{ backgroundColor: brushColor, opacity: brushOpacity }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-text-muted block mb-2">
                        Opacity: {Math.round(brushOpacity * 100)}%
                      </label>
                      <input
                        type="range" min="0" max="1" step="0.01" value={brushOpacity}
                        onChange={(e) => setBrushOpacity(Number(e.target.value))}
                        className="w-full accent-gold"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {selectedId && (
            <div className="bg-secondary p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-gold block mb-3">Actions</span>

              <button
                onClick={() => { setIsDragable((prev) => !prev); setTool("select"); }}
                className={`w-full px-4 py-2.5 border text-xs transition-all duration-300
                  ${isDragable ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}`}
              >
                Move
              </button>

              <button
                onClick={toggleGrayscale}
                className={`w-full px-4 py-2.5 border text-xs transition-all duration-300
                  ${layers.find(l => l.id === selectedId)?.grayscale ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold'}`}
              >
                {layers.find(l => l.id === selectedId)?.grayscale ? 'Remove' : 'Apply'} Grayscale
              </button>

              <button
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRemovingBg ? <><Loader2 size={14} className="animate-spin" /> Removing...</> : 'Remove Background'}
              </button>

              <button
                onClick={duplicateLayer}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300"
              >
                <Copy size={14} /> Duplicate
              </button>

              <div className="flex gap-2">
                <button onClick={moveLayerUp} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300">
                  <ChevronUp size={14} /> Up
                </button>
                <button onClick={moveLayerDown} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300">
                  <ChevronDown size={14} /> Down
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={flipHorizontal} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300">
                  <FlipHorizontal size={14} /> Flip H
                </button>
                <button onClick={flipVertical} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface border border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300">
                  <FlipVertical size={14} /> Flip V
                </button>
              </div>

              <button
                onClick={deleteSelected}
                className="w-full px-4 py-2.5 bg-danger-muted text-danger-light border border-danger-border hover:bg-danger/10 hover:border-danger text-xs transition-all duration-300"
              >
                Delete Layer
              </button>
            </div>
          )}

          {/* Layers */}
          <div className="bg-secondary p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-3 bg-gold opacity-50" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Layers ({layers.length})</span>
            </div>
            <div className="space-y-1">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className={`px-3 py-2.5 cursor-pointer border transition-all duration-200 flex items-center justify-between
                    ${selectedId === layer.id ? 'bg-surface-alt border-border-gold text-gold' : 'bg-surface border-border text-text-muted hover:border-border-gold hover:text-text'}`}
                >
                  <span className="text-[10px] uppercase tracking-[0.15em] truncate flex-1">{layer.name}</span>
                  <span className="text-[10px] text-text-dim ml-2 flex-shrink-0">#{layers.length - index}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── CANVAS AREA ─── */}
      <div className="flex-1 flex items-center justify-center bg-primary relative">

        {/* Processing overlays */}
        {(isRemovingBg || isAddingImage || isCanvaSaving) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-secondary border border-border p-10 w-[400px] relative">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />

              <div className="text-center space-y-4">
                <div className="flex justify-center items-center gap-3">
                  <Loader2 size={20} className="animate-spin text-gold" />
                  <h2
                    className="text-2xl font-light text-text tracking-[-0.02em]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {isRemovingBg && "Removing Background"}
                    {isAddingImage && "Adding Image"}
                    {isCanvaSaving && "Saving Canvas"}
                  </h2>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {isRemovingBg && "Removing the background, please wait a moment..."}
                  {isAddingImage && "Adding image to canvas, please wait a moment..."}
                  {isCanvaSaving && "Saving design so you can edit later, please wait a moment..."}
                </p>
              </div>
            </div>
          </div>
        )}

        <Stage
          width={800}
          height={600}
          ref={stageRef}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          draggable={tool === 'select' && !selectedId}
          className="bg-white"
        >
          <Layer>
            {layers.map((layer) => (
              <ImageElement
                allowDrag={isDragable}
                key={layer.id}
                layer={layer}
                isSelected={layer.id === selectedId}
                onSelect={() => { setSelectedId(layer.id); setIsDragable(true); setTool("select"); }}
                onChange={(newAttrs) => {
                  const newLayers = layers.map(l => l.id === layer.id ? { ...l, ...newAttrs } : l);
                  setLayers(newLayers);
                }}
                onTransformEnd={() => { saveLayerHistory(layers); }}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

interface ImageElementProps {
  layer: ImageLayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageLayer>) => void;
  onTransformEnd: () => void;
  allowDrag: boolean;
}

const ImageElement: React.FC<ImageElementProps> = ({ layer, isSelected, onSelect, onChange, onTransformEnd, allowDrag }) => {
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
      imageRef.current.getLayer()?.batchDraw();
    }
  }, [layer.grayscale]);

  return (
    <>
      <KonvaImage
        id={layer.id}
        ref={imageRef}
        image={layer.image}
        x={layer.x}
        y={layer.y}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        rotation={layer.rotation}
        draggable={isSelected && allowDrag}
        onClick={onSelect}
        onTap={onSelect}
        filters={layer.grayscale ? [Konva.Filters.Grayscale] : []}
        onDragEnd={(e) => { onChange({ x: e.target.x(), y: e.target.y() }); onTransformEnd(); }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          if (!node) return;
          onChange({ x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
          onTransformEnd();
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default TattooEditor;