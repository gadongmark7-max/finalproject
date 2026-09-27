import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";

export const ARTIST_SETTINGS_QUERY_KEY = ["artist_settings"] as const;

export interface artistSettingsInterface {
  hourlyRate: number | null;
}

export function useArtistSettings() {
  return useQuery({
    queryKey: ARTIST_SETTINGS_QUERY_KEY,
    queryFn: async (): Promise<artistSettingsInterface> =>
      (await axiosInstance.get("/artist/settings")).data,
  });
}
