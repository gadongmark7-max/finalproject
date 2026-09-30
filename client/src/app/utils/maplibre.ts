import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl(
    `/maplibre/${maplibregl.getVersion()}/maplibre-gl-worker.mjs`,
  );
}

export { maplibregl };
