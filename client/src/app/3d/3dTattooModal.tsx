"use client"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { useRouter } from "next/navigation"
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Undo,
  Redo,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  Save,MapPin, CheckCircle2
} from "lucide-react";
import { FullScreenModal } from "@/components/ui/modal";
import { TattooDataInterface } from "../types/threejs.type";
 

export function SetTattoo3DModal({ 
    img,
    tattooData ,
    setTatooData,
    fixSize
} : {  
    img : string,
    tattooData : TattooDataInterface | null,
    setTatooData : (val : TattooDataInterface) => void,
    fixSize : number | null
}){

  const [open, setOpen] = useState(false);

  const jpgUrl = img.replace(/\.(png|jpeg|webp)$/i, ".jpg")


  const [bodyType, setBodyType] = useState("/gltf/boy.glb")

  const [bodyPart, setBodyPart] = useState("")

  const mountRef = useRef<HTMLDivElement>(null);

  const [tattooSize, setTattooSize] = useState(tattooData?.size || 0.3);
  const currentDecalRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<any>(null);
  const historyRef = useRef<Array<{
    mesh: THREE.Mesh;
    point: THREE.Vector3;
    normal: THREE.Vector3;
    orientation: THREE.Euler;
    localRotation: THREE.Euler;
    localScale: number;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const tattooDataRef = useRef<{
    mesh: THREE.Mesh;
    point: THREE.Vector3;
    normal: THREE.Vector3;
    orientation: THREE.Euler;
    localRotation: THREE.Euler;
    localScale: number;
  } | null>(null);

  useEffect(() => {
    if(fixSize){
      setTattooSize(fixSize)
    }
  }, [open])

  

  useEffect(() => {
    if (!mountRef.current || !jpgUrl) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0.8, 0); // Center on model's torso
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const loader = new GLTFLoader();
    let model: THREE.Object3D;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    
 

    // Load tattoo texture
    const tattooTexture = new THREE.TextureLoader().load(jpgUrl);
    tattooTexture.flipY = false;
    // @ts-ignore
    loader.load(bodyType, (gltf) => {
      model = gltf.scene;
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y = -box.min.y  - 0.5; // Place feet at ground level
      
      scene.add(model);
      modelRef.current = model;
    });

    // Click to place tattoo
    function onMouseClick(event: MouseEvent) {
      if (!model) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(model, true);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        
        // Remove previous decal if exists
        if (currentDecalRef.current) {
          scene.remove(currentDecalRef.current);
          currentDecalRef.current.geometry.dispose();
          if (Array.isArray(currentDecalRef.current.material)) {
            currentDecalRef.current.material.forEach(m => m.dispose());
          } else {
            currentDecalRef.current.material.dispose();
          }
        }
        
        // Get the surface normal and point
        const point = intersect.point;
        const normal = intersect.face!.normal.clone();
        
        // Transform normal to world space
        const mesh = intersect.object as THREE.Mesh;

     
      
        
        let bodyPart = "Unknown";
        
        // Normalize the point for better detection
        const x = point.x;
        const y = point.y;
        const z = point.z;
        
        // Head (topmost part)
        if (y > 1.6) {
          bodyPart = "Head";
        } 
        // Arms (extended on X-axis, between shoulder and waist height)
        else if (y > 1.0 && y <= 1.6 && Math.abs(x) > 0.25) {
          // Upper arms
          if (y > 1.3) {
            bodyPart = "Arm";
          }
          // Hands/Lower arms
          else {
            bodyPart = "Hand";
          }
        }
        // Torso (center body, low X values)
        else if (y > 1.0 && y <= 1.6 && Math.abs(x) <= 0.25) {
          // Use Z-axis to distinguish front (chest/stomach) from back
          if (z > 0.05) {
            // Front side
            if (y > 1.3) {
              bodyPart = "Chest";
            } else {
              bodyPart = "Stomach";
            }
          } else {
            // Back side
            bodyPart = "Back";
          }
        }
        // Legs (upper legs, between waist and knees)
        else if (y > 0.5 && y <= 1.0) {
          bodyPart = "Legs";
        }
        // Calves (lower legs, below knees)
        else if (y <= 0.5) {
          bodyPart = "Calves";
        }
        
        setBodyPart(bodyPart);
     

        normal.transformDirection(mesh.matrixWorld);

        // Create orientation for the decal
        const orientation = new THREE.Euler();
        
        // Create a helper to orient the decal
        const helper = new THREE.Object3D();
        helper.position.copy(point);
        helper.lookAt(point.clone().add(normal));
        orientation.copy(helper.rotation);

        const decalMaterial = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: tattooTexture },
          },
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          side: THREE.FrontSide,
        
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
        
          fragmentShader: `
            uniform sampler2D map;
            varying vec2 vUv;
        
            void main() {
              vec4 tattoo = texture2D(map, vUv);
              float alpha = 1.0 - tattoo.r;
              vec3 ink = vec3(0.0);
              gl_FragColor = vec4(ink, alpha);
            }
          `,
        });
        
        const size = new THREE.Vector3(tattooSize, tattooSize, 0.15);

        const decalGeometry = new DecalGeometry(
          mesh,
          point,
          orientation,
          size
        );

        const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
        scene.add(decalMesh);
        currentDecalRef.current = decalMesh;
        
        // Store tattoo data for 3D manipulation
        tattooDataRef.current = {
          mesh: mesh,
          point: point.clone(),
          normal: normal.clone(),
          orientation: orientation.clone(),
          localRotation: new THREE.Euler(0, 0, 0),
          localScale: 1
        };
        
        // Save initial state to history
        historyRef.current = [{
          mesh: mesh,
          point: point.clone(),
          normal: normal.clone(),
          orientation: orientation.clone(),
          localRotation: new THREE.Euler(0, 0, 0),
          localScale: 1
        }];
        setHistoryIndex(0);
        setCanUndo(false);
        setCanRedo(false);
      
      }
    }

    window.addEventListener("click", onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onMouseClick);
      if (currentDecalRef.current) {
        scene.remove(currentDecalRef.current);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [bodyType, jpgUrl, open]);

  // Recreate decal with new parameters
  const recreateDecal = () => {
    if (!tattooDataRef.current || !sceneRef.current || !jpgUrl) return;

    const { mesh, point, normal, orientation, localRotation, localScale } = tattooDataRef.current;

    // Remove old decal
    if (currentDecalRef.current && sceneRef.current) {
      sceneRef.current.remove(currentDecalRef.current);
      currentDecalRef.current.geometry.dispose();
      if (Array.isArray(currentDecalRef.current.material)) {
        currentDecalRef.current.material.forEach(m => m.dispose());
      } else {
        currentDecalRef.current.material.dispose();
      }
    }

    // Load tattoo texture
    const tattooTexture = new THREE.TextureLoader().load(jpgUrl);
    tattooTexture.flipY = false;

    const decalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: tattooTexture },
      },
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.FrontSide,
    
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
    
        void main() {
          vec4 tattoo = texture2D(map, vUv);
          float alpha = 1.0 - tattoo.r;
          vec3 ink = vec3(0.0);
          gl_FragColor = vec4(ink, alpha);
        }
      `,
    });

    // Apply local rotation to the orientation
    const finalOrientation = new THREE.Euler(
      orientation.x + localRotation.x,
      orientation.y + localRotation.y,
      orientation.z + localRotation.z,
      orientation.order
    );

    const size = new THREE.Vector3(
      tattooSize * localScale, 
      tattooSize * localScale, 
      0.15
    );

    const decalGeometry = new (DecalGeometry as any)(
      mesh,
      point,
      finalOrientation,
      size
    );

    const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
    sceneRef.current.add(decalMesh);
    currentDecalRef.current = decalMesh;

    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // Save state to history
  const saveToHistory = () => {
    if (!tattooDataRef.current) return;
    
    // Remove any future states if we're not at the end
    const newHistory = historyRef.current.slice(0, historyIndex + 1);
    
    // Add current state
    newHistory.push({
      mesh: tattooDataRef.current.mesh,
      point: tattooDataRef.current.point.clone(),
      normal: tattooDataRef.current.normal.clone(),
      orientation: tattooDataRef.current.orientation.clone(),
      localRotation: tattooDataRef.current.localRotation.clone(),
      localScale: tattooDataRef.current.localScale
    });
    
    // Keep history limited to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    historyRef.current = newHistory;
    const newIndex = newHistory.length - 1;
    setHistoryIndex(newIndex);
    setCanUndo(newIndex > 0);
    setCanRedo(false);
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = historyRef.current[newIndex];
      
      tattooDataRef.current = {
        mesh: state.mesh,
        point: state.point.clone(),
        normal: state.normal.clone(),
        orientation: state.orientation.clone(),
        localRotation: state.localRotation.clone(),
        localScale: state.localScale
      };
      
      setHistoryIndex(newIndex);
      setCanUndo(newIndex > 0);
      setCanRedo(true);
      recreateDecal();
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < historyRef.current.length - 1) {
      const newIndex = historyIndex + 1;
      const state = historyRef.current[newIndex];
      
      tattooDataRef.current = {
        mesh: state.mesh,
        point: state.point.clone(),
        normal: state.normal.clone(),
        orientation: state.orientation.clone(),
        localRotation: state.localRotation.clone(),
        localScale: state.localScale
      };
      
      setHistoryIndex(newIndex);
      setCanUndo(true);
      setCanRedo(newIndex < historyRef.current.length - 1);
      recreateDecal();
    }
  };

  // UI Control Functions - Move along surface
  const moveTattoo = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!tattooDataRef.current || !modelRef.current || !sceneRef.current) return;
    
    const moveAmount = 0.03;
    const raycaster = new THREE.Raycaster();
    
    // Calculate movement direction based on current orientation
    const { normal, point } = tattooDataRef.current;
    
    // Create a local coordinate system on the surface
    const tangent = new THREE.Vector3();
    const bitangent = new THREE.Vector3();
    
    // Find a perpendicular vector to the normal
    if (Math.abs(normal.y) < 0.9) {
      tangent.set(0, 1, 0);
    } else {
      tangent.set(1, 0, 0);
    }
    
    tangent.cross(normal).normalize();
    bitangent.crossVectors(normal, tangent).normalize();
    
    // Calculate new position based on direction
    const newPoint = point.clone();
    
    switch(direction) {
      case 'up':
        newPoint.add(bitangent.multiplyScalar(moveAmount));
        break;
      case 'down':
        newPoint.add(bitangent.multiplyScalar(-moveAmount));
        break;
      case 'left':
        newPoint.add(tangent.multiplyScalar(-moveAmount));
        break;
      case 'right':
        newPoint.add(tangent.multiplyScalar(moveAmount));
        break;
    }
    
    // Raycast to find new surface point
    const rayDirection = normal.clone().multiplyScalar(-1);
    raycaster.set(newPoint.clone().add(normal.clone().multiplyScalar(0.1)), rayDirection);
    
    const intersects = raycaster.intersectObject(modelRef.current, true);
    
    if (intersects.length > 0) {
      const newIntersect = intersects[0];
      tattooDataRef.current.point = newIntersect.point.clone();
      
      // Update normal
      const newNormal = newIntersect.face!.normal.clone();
      const mesh = newIntersect.object as THREE.Mesh;
      newNormal.transformDirection(mesh.matrixWorld);
      tattooDataRef.current.normal = newNormal;
      
      // Update orientation
      const helper = new THREE.Object3D();
      helper.position.copy(newIntersect.point);
      helper.lookAt(newIntersect.point.clone().add(newNormal));
      tattooDataRef.current.orientation.copy(helper.rotation);
      
      saveToHistory();
      recreateDecal();
    }
  };

  const rotateTattoo = (axis: 'x' | 'y' | 'z', direction: number) => {
    if (!tattooDataRef.current) return;
    const rotateAmount = 0.2;
    tattooDataRef.current.localRotation[axis] += direction * rotateAmount;
    saveToHistory();
    recreateDecal();
  };

  const flipTattoo = (axis: 'horizontal' | 'vertical') => {
    if (!tattooDataRef.current) return;
    if (axis === 'horizontal') {
      tattooDataRef.current.localRotation.y += Math.PI;
    } else {
      tattooDataRef.current.localRotation.x += Math.PI;
    }
    saveToHistory();
    recreateDecal();
  };

  const scaleTattoo = (direction: number) => {
    if (!tattooDataRef.current) return;
  
    const step = 0.1;
    const minSize = 0.05;
    const maxSize = 3;
  
    const nextSize = tattooSize * (1 + direction * step);
  
    if (nextSize < minSize || nextSize > maxSize) return;
  
    setTattooSize(nextSize);
  
    // keep scale normalized
    tattooDataRef.current.localScale = 1;
  
    saveToHistory();
    recreateDecal();
  };
  


  const rotateCamera = (direction: 'left' | 'right') => {
    if (!controlsRef.current || !cameraRef.current) return;
    const angle = direction === 'left' ? 0.3 : -0.3;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    
    const offset = new THREE.Vector3().subVectors(cam.position, target);
    const radius = offset.length();
    const theta = Math.atan2(offset.x, offset.z) + angle;
    
    cam.position.x = target.x + radius * Math.sin(theta);
    cam.position.z = target.z + radius * Math.cos(theta);
    controlsRef.current.update();
  };

  const moveModel = (direction: 'up' | 'down') => {
    if (!controlsRef.current || !cameraRef.current) return;
    const moveAmount = direction === 'down' ? 0.2 : -0.2;
    cameraRef.current.position.y += moveAmount;
    controlsRef.current.target.y += moveAmount;
    controlsRef.current.update();
  };

  const zoomCamera = (direction: 'in' | 'out') => {
    if (!controlsRef.current || !cameraRef.current) return;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const offset = new THREE.Vector3().subVectors(cam.position, target);
    const distance = offset.length();
    const newDistance = direction === 'in' ? distance * 0.9 : distance * 1.1;
    
    if (newDistance >= 1 && newDistance <= 10) {
      offset.normalize().multiplyScalar(newDistance);
      cam.position.copy(target).add(offset);
      controlsRef.current.update();
    }
  };


  const saveTatoo = () => {
    if(tattooDataRef.current){
      setTatooData({
        modelUrl: bodyType,
        meshName: bodyPart, 
        size : tattooSize,
        position: {
          x: tattooDataRef.current.point.x,
          y: tattooDataRef.current.point.y,
          z: tattooDataRef.current.point.z
        },
        
        rotation: {
          x: tattooDataRef.current.orientation.x + tattooDataRef.current.localRotation.x,
          y: tattooDataRef.current.orientation.y + tattooDataRef.current.localRotation.y,
          z: tattooDataRef.current.orientation.z + tattooDataRef.current.localRotation.z,
          order: tattooDataRef.current.orientation.order
        },
        
        scale: tattooDataRef.current.localScale,
        
        uv: undefined
      })
      setOpen(false)
    }
  }

  
  useEffect(() => {
    if(tattooData && tattooDataRef.current){
      // Update scale
      tattooDataRef.current.localScale = tattooData.scale
  
      // Update position
      tattooDataRef.current.point.x = tattooData.position.x
      tattooDataRef.current.point.y = tattooData.position.y
      tattooDataRef.current.point.z = tattooData.position.z
  
      // Update rotation (split combined rotation back into orientation and localRotation)
      tattooDataRef.current.orientation.x = tattooData.rotation.x
      tattooDataRef.current.orientation.y = tattooData.rotation.y
      tattooDataRef.current.orientation.z = tattooData.rotation.z
      tattooDataRef.current.orientation.order = tattooData.rotation.order
  
      // Reset local rotation since we're putting everything in orientation
      tattooDataRef.current.localRotation.x = 0
      tattooDataRef.current.localRotation.y = 0
      tattooDataRef.current.localRotation.z = 0
  
      // Recreate the decal with updated data
      recreateDecal();
    }
  }, [open, tattooData])

  return (
    <div>

      {/* Trigger Button */}
      <div className="w-full mt-3 mb-3">
        <button
          onClick={() => setOpen(true)}
          className={`
            w-full flex items-center justify-between gap-3
            px-5 py-4 transition-all duration-300 text-left border
            ${
              tattooData
                ? "bg-surface-alt border-border-gold text-text"
                : "bg-surface border-border text-text-muted hover:border-border-gold hover:text-text"
            }
          `}
        >
          <div className="flex items-center gap-3">
            {tattooData ? (
              <CheckCircle2 className="w-5 h-5 text-gold" />
            ) : (
              <MapPin className="w-5 h-5 text-text-dim" />
            )}
            <div>
              <p className="text-sm font-light tracking-wide">
                {tattooData ? "Tattoo position selected" : "Select tattoo position"}
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-gold">
            {tattooData ? "Edit" : "Select"}
          </span>
        </button>
      </div>

      <FullScreenModal
        open={open}
        onClose={() => setOpen(false)}
        title="Full Screen Modal"
      >
        <div className="relative w-full h-screen bg-primary text-text">

          {/* Grain overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />

          {/* 3D Viewport */}
          <div ref={mountRef} className="w-full h-full" />

          {/* Back Button */}
          <Button
            className="absolute left-[335px] top-5 z-[100]"
            size="lg"
           
            onClick={() => setOpen(false)}
          >
            <ArrowLeft /> Back
          </Button>

          {/* Save Button */}
          <Button
            className="absolute left-[475px] top-5 z-[100]"
            size="lg"
            onClick={saveTatoo}
          >
            <Save /> Save
          </Button>

          {/* Tattoo Preview */}
          <div className="absolute right-[335px] top-5 z-[100] bg-surface border border-border w-[150px] h-[150px] overflow-hidden">
            <img src={jpgUrl!} alt="Tattoo preview" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 py-1 bg-primary/80 flex justify-center">
              <span className="text-[9px] uppercase tracking-[0.2em] text-gold">Preview</span>
            </div>
          </div>

          {/* ─── LEFT PANEL — Model View ─── */}
          <div className="absolute top-0 left-0 h-full w-80 bg-secondary border-r border-border flex flex-col overflow-auto">

            {/* Panel Header */}
            <div className="px-6 pt-8 pb-5 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-4 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Model View</span>
              </div>
              <h3
                className="text-2xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Camera Controls
              </h3>
              <p className="text-xs text-text-muted mt-1">Control your viewing angle</p>
            </div>

            <div className="flex flex-col gap-px flex-1 bg-border overflow-auto bg-secondary">

              {/* Change Model */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Change Model</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBodyType("/gltf/boy.glb")}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted text-[10px] uppercase tracking-[0.18em] hover:border-border-gold hover:text-gold transition-all duration-300"
                  >
                    Boy
                  </button>
                  <button
                    onClick={() => setBodyType("/gltf/girl.glb")}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted text-[10px] uppercase tracking-[0.18em] hover:border-border-gold hover:text-gold transition-all duration-300"
                  >
                    Girl
                  </button>
                </div>
              </div>

              {/* Rotate */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Rotate Around</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => rotateCamera('left')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => rotateCamera('right')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Move Model */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Move Model</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveModel('up')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => moveModel('down')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Zoom</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => zoomCamera('in')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => zoomCamera('out')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ─── RIGHT PANEL — Edit Tattoo ─── */}
          <div className="absolute top-0 right-0 h-full w-80 bg-secondary border-l border-border flex flex-col overflow-y-auto">

            {/* Panel Header */}
            <div className="px-6 pt-8 pb-5 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-4 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Tattoo Editor</span>
              </div>
              <h3
                className="text-2xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Edit Your Tattoo
              </h3>
              <p className="text-xs text-text-muted mt-1">Adjust position, size, and orientation</p>
            </div>

            <div className="flex flex-col gap-px flex-1 bg-border overflow-y-auto">

              {/* Position */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Position</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => moveTattoo('up')}
                    className="w-12 h-12 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveTattoo('left')}
                      className="w-12 h-12 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveTattoo('right')}
                      className="w-12 h-12 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => moveTattoo('down')}
                    className="w-12 h-12 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Size */}
              {fixSize == null && (
                <div className="bg-secondary p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px w-3 bg-gold opacity-50" />
                    <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Size</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scaleTattoo(1)}
                      className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scaleTattoo(-1)}
                      className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Flip */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Flip</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => flipTattoo('horizontal')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => flipTattoo('vertical')}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <FlipVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Roll */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">Roll</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => rotateTattoo('z', -1)}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => rotateTattoo('z', 1)}
                    className="flex-1 py-3 bg-surface border border-border text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="bg-secondary p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-3 bg-gold opacity-50" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold">History</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`flex-1 py-3 border transition-all duration-300 flex items-center justify-center
                      ${canUndo
                        ? "bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold cursor-pointer"
                        : "bg-surface border-border text-text-dim cursor-not-allowed opacity-40"
                      }`}
                  >
                    <Undo className="w-5 h-5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`flex-1 py-3 border transition-all duration-300 flex items-center justify-center
                      ${canRedo
                        ? "bg-surface border-border text-text-muted hover:border-border-gold hover:text-gold cursor-pointer"
                        : "bg-surface border-border text-text-dim cursor-not-allowed opacity-40"
                      }`}
                  >
                    <Redo className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </FullScreenModal>
    </div>
  )
}
