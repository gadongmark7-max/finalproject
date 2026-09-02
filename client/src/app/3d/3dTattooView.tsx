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
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Eye,
  Check,
  X
} from "lucide-react";


import { FullScreenModal } from "@/components/ui/modal";
import { TattooDataInterface } from "../types/threejs.type";
 import { bookingInterface } from "../types/booking.type";
import { Artifika } from "next/font/google";

export function ViewTattoo3DModal({ 
    img,
    tattooData,
    booking,
    approveCallback = null,
    rejectCallback = null
} : {  
    img : string,
    tattooData : TattooDataInterface | null,
    booking : bookingInterface,
    approveCallback? : ((booking : bookingInterface) => void) | null,
    rejectCallback? : ((booking : bookingInterface) => void) | null,
}){

  const [open, setOpen] = useState(false);

  const jpgUrl = img.replace(/\.(png|jpeg|webp)$/i, ".jpg")

  const [bodyType, setBodyType] = useState(tattooData?.modelUrl)
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const [tattooSize, setTattooSize] = useState(tattooData?.size || 0.3);
  const currentDecalRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<any>(null);
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

  // Initialize tattooDataRef with default data
  useEffect(() => {
    if (tattooData) {
      // Create a placeholder mesh (will be replaced when model loads)
      const placeholderMesh = new THREE.Mesh();
      
      tattooDataRef.current = {
        mesh: placeholderMesh,
        point: new THREE.Vector3(
          tattooData.position.x,
          tattooData.position.y,
          tattooData.position.z
        ),
        normal: new THREE.Vector3(0, 0, 1), // Default normal
        orientation: new THREE.Euler(
          tattooData.rotation.x,
          tattooData.rotation.y,
          tattooData.rotation.z,
          tattooData.rotation.order
        ),
        localRotation: new THREE.Euler(0, 0, 0),
        localScale: tattooData.scale
      };
    }
  }, [tattooData]);

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

    // Load tattoo texture
    const tattooTexture = new THREE.TextureLoader().load(jpgUrl);
    tattooTexture.flipY = false;

    // @ts-ignore
    loader.load(bodyType, (gltf) => {
      const model = gltf.scene;
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y = -box.min.y - 0.5; // Place feet at ground level
      
      scene.add(model);
      modelRef.current = model;

      // Find the body mesh (usually the largest mesh or named "Body")
      if (tattooDataRef.current) {
        let bodyMesh: THREE.Mesh | null = null;
        let largestArea = 0;
        
        model.traverse((child : any) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            // Check if it's named Body or similar
            const name = child.name.toLowerCase();
            if (name.includes('body') || name.includes('skin') || name.includes('torso')) {
              bodyMesh = child;
              console.log("Found body mesh by name:", child.name);
              return;
            }
            
            // Otherwise, find the largest mesh (likely the body)
            child.geometry.computeBoundingBox();
            const bbox = child.geometry.boundingBox;
            if (bbox) {
              const size = new THREE.Vector3();
              bbox.getSize(size);
              const area = size.x * size.y * size.z;
              
              if (area > largestArea) {
                largestArea = area;
                bodyMesh = child;
              }
            }
          }
        });
        
        if (bodyMesh) {
          tattooDataRef.current!.mesh = bodyMesh;
          console.log("Selected mesh:", bodyMesh, "with area:", largestArea);
        } else {
          console.warn("No suitable body mesh found!");
        }
      }
      
      // Signal that model is loaded
      setModelLoaded(true);
    });

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
      if (currentDecalRef.current) {
        scene.remove(currentDecalRef.current);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      setModelLoaded(false);
      setIsPositioned(false);
    };
  }, [bodyType, jpgUrl, open]);

  const focusOnTattoo = () => {
    if (!tattooDataRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const tattooPosition = tattooDataRef.current.point;
    const orientation = tattooDataRef.current.orientation;
    
    // Calculate the normal vector from the orientation (Euler angles)
    // The orientation tells us how the decal is rotated, so we can derive the surface normal
    const normalMatrix = new THREE.Matrix4();
    normalMatrix.makeRotationFromEuler(orientation);
    
    // The Z-axis of the rotation matrix is the normal direction
    const tattooNormal = new THREE.Vector3(0, 0, 1);
    tattooNormal.applyMatrix4(normalMatrix);
    tattooNormal.normalize();
    
    // Set the controls target to the tattoo position
    controlsRef.current.target.copy(tattooPosition);
    
    // Calculate camera position based on the tattoo's normal (surface direction)
    const distance = 1.2; // Distance from tattoo
    
    // Position camera in the direction of the normal (facing the tattoo from outside)
    const cameraOffset = tattooNormal.clone().multiplyScalar(distance);
    const cameraPosition = tattooPosition.clone().add(cameraOffset);
    
    // Add slight upward offset for better viewing angle
    cameraPosition.y += 0.15;
    
    cameraRef.current.position.copy(cameraPosition);
    cameraRef.current.lookAt(tattooPosition);
    
    controlsRef.current.update();
    
    // Mark as positioned
    setIsPositioned(true);
  };

  // Recreate decal with current parameters
  const recreateDecal = () => {

    
    if (!tattooDataRef.current || !sceneRef.current || !jpgUrl) {
      console.log("Early return: missing data");
      return;
    }

    const { mesh, point, orientation, localRotation, localScale } = tattooDataRef.current;


    // Check if mesh has geometry (model is loaded)
    if (!mesh.geometry) {
      console.log("Early return: mesh has no geometry");
      return;
    }

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
    console.log("Decal mesh created:", decalMesh);
    
    sceneRef.current.add(decalMesh);
    console.log("Decal added to scene");
    
    currentDecalRef.current = decalMesh;

    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      console.log("Scene rendered");
    }

    focusOnTattoo();
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

  // Update tattoo when tattooData changes, modal opens, or model loads
  useEffect(() => {
    if (tattooData && tattooDataRef.current && open && modelLoaded) {
      // Update scale
      tattooDataRef.current.localScale = tattooData.scale;
  
      // Update position
      tattooDataRef.current.point.x = tattooData.position.x;
      tattooDataRef.current.point.y = tattooData.position.y;
      tattooDataRef.current.point.z = tattooData.position.z;
  
      // Update rotation
      tattooDataRef.current.orientation.x = tattooData.rotation.x;
      tattooDataRef.current.orientation.y = tattooData.rotation.y;
      tattooDataRef.current.orientation.z = tattooData.rotation.z;
      tattooDataRef.current.orientation.order = tattooData.rotation.order;
  
      // Reset local rotation
      tattooDataRef.current.localRotation.x = 0;
      tattooDataRef.current.localRotation.y = 0;
      tattooDataRef.current.localRotation.z = 0;
  
      // Recreate the decal with updated data
      recreateDecal();
    }
  }, [open, tattooData, modelLoaded]);

  return (
    <div className="overflow-hidden ">

      <Button hoverText={"View Tattoo Placement"} onClick={() => setOpen(true)}>
        <Eye />
      </Button>

      <FullScreenModal
        open={open}
        onClose={() => setOpen(false)}
        title="Full Screen Modal"
      >
        <div className="relative w-full h-screen bg-primary">

          {/* Grain Overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />

          {/* Three.js mount */}
          <div
            ref={mountRef}
            className="w-full h-full"
            style={{
              opacity: isPositioned ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />

          {/* Loading State */}
          {!isPositioned && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary z-20">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-gold" />
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Loading Model</p>
                  <div className="h-px w-8 bg-gold" />
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <Button
            className="absolute left-[335px] top-5 z-30"
            size="lg"
      
            onClick={() => setOpen(false)}
          >
            <ArrowLeft /> Back
          </Button>

          {/* ── Left Panel — Camera Controls ── */}
          <div className="absolute top-0 left-0 h-full w-80 bg-secondary border-r border-border flex flex-col overflow-auto z-20">

            {/* Panel Header */}
            <div className="px-6 pt-8 pb-5 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Controls</span>
              </div>
              <h3
                className="text-2xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Model View
              </h3>
              <p className="text-text-muted text-xs mt-1">Control your viewing angle</p>
            </div>

            <div className="flex flex-col gap-4 p-6">

              {/* Rotate */}
              <div className="bg-surface border border-border p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4 flex items-center gap-2">
                  <span className="h-px w-4 bg-gold inline-block" /> Rotate Around
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => rotateCamera('left')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => rotateCamera('right')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ArrowRight className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Move */}
              <div className="bg-surface border border-border p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4 flex items-center gap-2">
                  <span className="h-px w-4 bg-gold inline-block" /> Move Model
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveModel('up')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ArrowUp className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => moveModel('down')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ArrowDown className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div className="bg-surface border border-border p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4 flex items-center gap-2">
                  <span className="h-px w-4 bg-gold inline-block" /> Zoom
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => zoomCamera('in')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ZoomIn className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => zoomCamera('out')}
                    className="py-4 bg-surface-alt border border-border hover:border-border-gold hover:bg-surface text-text-muted hover:text-gold transition-all duration-200 active:scale-95"
                  >
                    <ZoomOut className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ── Right Panel — Booking Information ── */}
          <div className="absolute top-0 right-0 h-full w-80 bg-secondary border-l border-border flex flex-col overflow-auto z-20">

            {/* Panel Header */}
            <div className="px-6 pt-8 pb-5 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Details</span>
              </div>
              <h3
                className="text-2xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Booking Info
              </h3>
              <p className="text-text-muted text-xs mt-1">Display information</p>
            </div>

            <div className="flex flex-col gap-5 p-6 flex-1">

              {/* Tattoo Image */}
              <div className="relative w-full h-[220px] border border-border overflow-hidden group">
                <img src={img} alt="tattoo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              </div>

              {/* Artist */}
              <div className="flex items-center gap-3">
                <img
                  src={booking.artist.profile}
                  alt="artist"
                  className="w-10 h-10 object-cover border border-border flex-shrink-0"
                />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Artist</p>
                  <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {booking.artist.name}
                  </p>
                </div>
              </div>

              {/* Client */}
              <div className="flex items-center gap-3">
                <img
                  src={booking.client.profile}
                  alt="client"
                  className="w-10 h-10 object-cover border border-border flex-shrink-0"
                />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Client</p>
                  <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {booking.client.name}
                  </p>
                </div>
              </div>

              {/* Date / Time / Session */}
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Date</p>
                  <p className="text-text text-sm">{booking.date}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Time</p>
                  <p className="text-text text-sm">
                    {booking.time[0]} – {booking.time[booking.time.length - 1]}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mb-0.5">Sessions</p>
                  <p className="text-text text-sm">{booking.sessions.length}</p>
                </div>
              </div>

              {/* Approve / Reject */}
              {(approveCallback && rejectCallback) && (
                <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                  <Button
                    
                    onClick={() => { approveCallback(booking); setOpen(false); }}
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button

                    onClick={() => { rejectCallback(booking); setOpen(false); }}
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}

            </div>
          </div>

        </div>
      </FullScreenModal>
    </div>
  )
}