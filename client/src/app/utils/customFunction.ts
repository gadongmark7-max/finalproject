import L from "leaflet";
import { convoInterface } from "../types/convo.type";
import { attendanceInterface } from "../types/attendance.type";
import { inventoryInterface } from "../types/inventory.type";
import { bussinessInfoInterface } from "../types/accounts.type";
import { documentInterface } from "../types/document.type";

export const isNotVerified = (documents: documentInterface): boolean => {
  const keys = [
    "bussinessPermit",
    "BarangayClearance",
    "MayorPermit",
    "sanitaryPermit",
    "HealthPermit",
    "BIRRegistarion",
    "DTIRegistarion",
    "SECRegistarion",
  ] as const;

  return keys.some((key) => !documents[key]);
};

export const checkIfSubsExpired = (date: string) => {
  const expirationDate = new Date(date);
  const today = new Date();

  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays < 0; // expired if negative
};



export const isDayAvailable = (date : Date ,days : string[]) => {
  if(days.length == 0) return !false
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
  return  !days.includes(dayName)    
}

export const getTimeInStatus = (timeIn: string, timeInSched: string) => {
  if (!timeIn || !timeInSched) return "unknown";

  const [inHour, inMin] = timeIn.split(":").map(Number);
  const [schedHour, schedMin] = timeInSched.split(":").map(Number);

  const timeInTotal = inHour * 60 + inMin;
  const schedTotal = schedHour * 60 + schedMin;

  return timeInTotal > schedTotal ? "late" : "ontime";
};


export const getTimeOutStatus = (timeOut: string, timeOutSched: string) => {
  if (!timeOut || !timeOutSched) return "unknown";

  const [outHour, outMin] = timeOut.split(":").map(Number);
  const [schedHour, schedMin] = timeOutSched.split(":").map(Number);

  const timeOutTotal = outHour * 60 + outMin;
  const schedTotal = schedHour * 60 + schedMin;

  const diff = timeOutTotal - schedTotal;

  // overtime
  if (diff > 0) return "overtime";

  // early but within 20 mins → on time
  if (diff >= -20) return "ontime";

  // more than 20 mins early
  return "earlyout";
};


export const getInventoryName = (id : string, inventory : inventoryInterface[]) => {
    let name = ""
    inventory.forEach((item) => {
        if(item._id == id) name = item.item
    })
    return name
}

export const getInventoryPrice = (id : string, inventory : inventoryInterface[]) => {
  let price = 0
  inventory.forEach((item) => {
      if(item._id == id) price = item.price
  })
  return price
}

export const getInventoryType = (id : string, inventory : inventoryInterface[]) => {
  let type = ""
  inventory.forEach((item) => {
      if(item._id == id) type = item.type
  })
  return type
}



export const mapIcon = (url: string) => {
  return L.divIcon({
    html: `
      <img 
        src="${url}"
        style="
          width:32px;
          height:32px;
          border-radius:50%;
          object-fit:cover;
          border:2px solid #C6A55C;
        "
      />
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: ""
  });
}

export const convertToAmPm = (time: string) => {
    const [hour, minute] = time.split(":").map(Number)
    const isPM = hour >= 12
    const displayHour = hour % 12 || 12
  
    return `${displayHour}${minute ? `:${minute}` : ""} ${isPM ? "PM" : "AM"}`
}
  

export const getChatIndex = ( userId : string ,convo : convoInterface) => {
  return (userId == convo.accounts[0]._id) ? 1 : 0
}




export const isNear = (
  currentLocation: { lat: number; lng: number },
  targetLocation: { lat: number; lng: number },
  radius: number // in KM
): boolean => {
  const R = 6371; // Earth radius in KM

  const dLat =
    ((targetLocation.lat - currentLocation.lat) * Math.PI) / 180;
  const dLng =
    ((targetLocation.lng - currentLocation.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((currentLocation.lat * Math.PI) / 180) *
      Math.cos((targetLocation.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return distance <= radius;
};

export const getDistance = (
  currentLocation: { lat: number; lng: number },
  targetLocation: { lat: number; lng: number }
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in KM

  const dLat = toRad(targetLocation.lat - currentLocation.lat);
  const dLng = toRad(targetLocation.lng - currentLocation.lng);

  const lat1 = toRad(currentLocation.lat);
  const lat2 = toRad(targetLocation.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in KM
};


export const tattooAreaCm2 = (tattooSize: number) => {
  const cm = tattooSize * 100;
  return cm * cm;
};



export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}


export const getTodayAttendance = (date : string, attendances : attendanceInterface[]) => {
  return attendances.find(item => item.date === date) ?? null;
}


export const isBussinessApproveArtistPayment = (bussinessId : string | undefined, bussinesses : bussinessInfoInterface[]) => {
  if(!bussinessId || bussinesses.length == 0) return true
  for(let bussiness of bussinesses){
    if(bussiness.bussiness._id == bussinessId){
      return bussiness.config.artistPayment
    }
  }
  return false
}


export const isBussinessApproveArtistApply = ( bussinesses : bussinessInfoInterface[]) => {
  if(bussinesses.length == 0) return true
  for(let bussiness of bussinesses){
    return bussiness.config.artistToOtherBussiness
  }
}

export const isBussinessApproveArtistPost = ( bussinesses : bussinessInfoInterface[]) => {
  if(bussinesses.length == 0) return true
  for(let bussiness of bussinesses){
    return bussiness.config.artistPost
  }
}

export const isBussinessApproveArtistAppoitnment = ( bussinesses : bussinessInfoInterface[]) => {
  if(bussinesses.length == 0) return true
  for(let bussiness of bussinesses){
    return bussiness.config.artistBookAppointment
  }
}