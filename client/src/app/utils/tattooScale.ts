import { TattooDataInterface } from "@/app/types/threejs.type";

export const REFERENCE_BODY_HEIGHT_CM = 170;

export const DEFAULT_CM_PER_WORLD_UNIT = REFERENCE_BODY_HEIGHT_CM / 2.62;

export const MIN_TATTOO_CM = 1;
export const MAX_TATTOO_CM = 100;

export const cmPerUnitForModelHeight = (modelHeightUnits: number) =>
  modelHeightUnits > 0
    ? REFERENCE_BODY_HEIGHT_CM / modelHeightUnits
    : DEFAULT_CM_PER_WORLD_UNIT;

export const decalSizeToCm = (size: number, cmPerUnit?: number) => {
  const cm = size * (cmPerUnit ?? DEFAULT_CM_PER_WORLD_UNIT);
  return Math.min(
    MAX_TATTOO_CM,
    Math.max(MIN_TATTOO_CM, Math.round(cm * 2) / 2),
  );
};

export const tattooSizeCmFromScene = (
  tattooData: Pick<TattooDataInterface, "size" | "cmPerUnit">,
) => {
  const side = decalSizeToCm(tattooData.size, tattooData.cmPerUnit);
  return { widthCm: side, heightCm: side };
};

export const cmToDecalSize = (
  widthCm: number,
  heightCm: number,
  cmPerUnit?: number,
) => Math.max(widthCm, heightCm) / (cmPerUnit ?? DEFAULT_CM_PER_WORLD_UNIT);
