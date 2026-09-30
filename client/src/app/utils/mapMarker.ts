import type { StyleSpecification } from "maplibre-gl";

export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_SOURCE_ID = "osm";

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export function createAvatarMarkerElement(url?: string | null): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "32px";
  el.style.height = "32px";
  el.style.cursor = "pointer";
  const img = document.createElement("img");
  img.alt = "";
  img.style.cssText =
    "display:block;width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #C6A55C;background:#1a1a2e;";
  img.src = url || DEFAULT_PROFILE_IMAGE;
  img.onerror = () => {
    img.onerror = null;
    img.src = DEFAULT_PROFILE_IMAGE;
  };
  el.appendChild(img);
  return el;
}

export const DEFAULT_PROFILE_IMAGE = "/default_profile.jpg";

export function createOsmStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      [OSM_SOURCE_ID]: {
        type: "raster",
        tiles: [OSM_TILE_URL],
        tileSize: 256,
        attribution: OSM_ATTRIBUTION,
      },
    },
    layers: [{ id: "osm-tiles", type: "raster", source: OSM_SOURCE_ID }],
  };
}

export function createStudioMarkerElement(profileUrl?: string | null): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "44px";
  el.style.height = "54px";
  el.style.cursor = "pointer";
  el.style.filter = "drop-shadow(0 4px 6px rgba(0,0,0,0.35))";
  el.innerHTML = `
    <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;">
      <path d="M22 1C10.4 1 1 10.4 1 22c0 15.75 21 31 21 31s21-15.25 21-31C43 10.4 33.6 1 22 1z" fill="#C6A55C" stroke="#8B7332" stroke-width="1.5"/>
    </svg>
    <img
      alt=""
      style="
        position:absolute;
        top:6px;
        left:6px;
        display:block;
        width:32px;
        height:32px;
        border-radius:50%;
        object-fit:cover;
        border:2px solid #1a1a2e;
        background:#1a1a2e;
      "
    />
  `;
  const img = el.querySelector("img") as HTMLImageElement;
  img.src = profileUrl || DEFAULT_PROFILE_IMAGE;
  img.onerror = () => {
    img.onerror = null;
    img.src = DEFAULT_PROFILE_IMAGE;
  };
  return el;
}
