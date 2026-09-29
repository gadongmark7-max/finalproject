import * as THREE from "three";
import type { BodyPart } from "@/components/ui/bodyPartSelect";

export interface ModelBounds {
  minY: number;
  height: number;
  centerX: number;
  centerZ: number;
}

interface BodyRegionProfile {
  referenceHeight: number;
  head: number;
  chestSplit: number;
  elbow: number;
  torsoBottom: number;
  knee: number;
  frontZ: number;
  legMaxX: number;
  armInnerX: [number, number][];
}

const LEGACY_PROFILE: BodyRegionProfile = {
  referenceHeight: 2.6218,
  head: 2.1,
  chestSplit: 1.8,
  elbow: 1.8,
  torsoBottom: 1.5,
  knee: 1.0,
  frontZ: 0.05,
  legMaxX: 0.45,
  armInnerX: [[0, 0.25]],
};

const BODY_REGION_PROFILES: Record<string, BodyRegionProfile> = {
  "/gltf/boy.glb": LEGACY_PROFILE,
  "/gltf/girl.glb": {
    referenceHeight: 2.7753,
    head: 2.32,
    chestSplit: 1.88,
    elbow: 1.75,
    torsoBottom: 1.45,
    knee: 0.78,
    frontZ: 0,
    legMaxX: 0.4,
    armInnerX: [
      [1.45, 0.4],
      [1.6, 0.34],
      [1.7, 0.29],
      [1.8, 0.25],
      [1.9, 0.228],
      [2.0, 0.222],
      [2.1, 0.218],
    ],
  },
};

export function getModelBounds(model: THREE.Object3D): ModelBounds {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  return {
    minY: box.min.y,
    height: box.max.y - box.min.y,
    centerX: center.x,
    centerZ: center.z,
  };
}

function interpolate(points: [number, number][], at: number) {
  if (at <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [y1, x1] = points[i];
    if (at <= y1) {
      const [y0, x0] = points[i - 1];
      return x0 + ((x1 - x0) * (at - y0)) / (y1 - y0);
    }
  }
  return points[points.length - 1][1];
}

export function detectBodyPart(
  point: THREE.Vector3,
  bounds: ModelBounds,
  modelUrl: string,
): BodyPart | "Unknown" {
  const profile = BODY_REGION_PROFILES[modelUrl] ?? LEGACY_PROFILE;
  if (!(bounds.height > 0)) return "Unknown";

  const scale = profile.referenceHeight / bounds.height;
  const y = (point.y - bounds.minY) * scale;
  const x = Math.abs(point.x - bounds.centerX) * scale;
  const z = (point.z - bounds.centerZ) * scale;

  if (y > profile.head) return "Head";

  if (y > profile.torsoBottom) {
    if (x > interpolate(profile.armInnerX, y)) {
      return y > profile.elbow ? "Arm" : "Hand";
    }
    if (z > profile.frontZ) {
      return y > profile.chestSplit ? "Chest" : "Stomach";
    }
    return "Back";
  }

  if (x > profile.legMaxX) return "Hand";
  return y > profile.knee ? "Legs" : "Calves";
}
