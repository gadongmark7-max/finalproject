export const BOOKING_DURATION_ERROR_CODE = "INSUFFICIENT_BOOKING_DURATION";

const hoursLabel = (hours: number) => `${hours} ${hours === 1 ? "hour" : "hours"}`;

export const requiredSessionHours = (sessions: unknown, session = 1) => {
  if (!Array.isArray(sessions)) return null;
  const hours = Number(sessions[session - 1]);
  return Number.isFinite(hours) && hours > 0 ? hours : null;
};

const toMinutes = (time: unknown) => {
  if (typeof time !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const bookingDurationHours = (times: unknown) => {
  if (!Array.isArray(times) || times.length < 2) return 0;
  const minutes = times.map(toMinutes);
  if (minutes.some((m) => m === null)) return null;
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i]! - minutes[i - 1]! !== 60) return null;
  }
  return times.length - 1;
};

export const insufficientDurationMessage = (
  requiredHours: number,
  selectedHours: number,
  totalSessions: number,
) => {
  const subject =
    totalSessions > 1
      ? `Session 1 of this tattoo (${totalSessions} sessions total) requires ${hoursLabel(requiredHours)}`
      : `This tattoo requires ${hoursLabel(requiredHours)}`;
  return `${subject}, so the booking duration must be at least ${hoursLabel(requiredHours)}. The selected time only covers ${hoursLabel(selectedHours)}.`;
};

export type BookingDurationCheck =
  | { ok: true; requiredHours: number; selectedHours: number }
  | {
      ok: false;
      message: string;
      requiredHours: number | null;
      selectedHours: number | null;
    };

export const validateBookingDuration = (params: {
  sessions: unknown;
  session?: number;
  time: unknown;
}): BookingDurationCheck => {
  const session = params.session ?? 1;
  const requiredHours = requiredSessionHours(params.sessions, session);
  if (requiredHours === null) {
    return {
      ok: false,
      message: "This tattoo has no valid session duration.",
      requiredHours: null,
      selectedHours: null,
    };
  }
  const selectedHours = bookingDurationHours(params.time);
  if (selectedHours === null) {
    return {
      ok: false,
      message:
        "The selected time slots must be consecutive hours. Please pick a start time again.",
      requiredHours,
      selectedHours: null,
    };
  }
  if (selectedHours < requiredHours) {
    const totalSessions = Array.isArray(params.sessions)
      ? params.sessions.length
      : 1;
    return {
      ok: false,
      message: insufficientDurationMessage(
        requiredHours,
        selectedHours,
        totalSessions,
      ),
      requiredHours,
      selectedHours,
    };
  }
  return { ok: true, requiredHours, selectedHours };
};
