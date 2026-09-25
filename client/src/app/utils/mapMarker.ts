export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export function createAvatarMarkerElement(url: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "32px";
  el.style.height = "32px";
  el.style.cursor = "pointer";
  el.innerHTML = `
    <img
      src="${url}"
      style="
        display:block;
        width:32px;
        height:32px;
        border-radius:50%;
        object-fit:cover;
        border:2px solid #C6A55C;
      "
    />
  `;
  return el;
}
