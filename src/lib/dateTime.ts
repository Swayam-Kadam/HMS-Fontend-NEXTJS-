/**
 * Returns today's date as a `yyyy-mm-dd` string in the user's local timezone,
 * suitable for use as the `min` value of a date input.
 */
export const getTodayInputValue = (): string => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().split('T')[0];
};

/**
 * Converts a time slot like "09:00 AM" / "02:00 PM" to minutes since midnight.
 * Returns NaN when the slot cannot be parsed.
 */
export const timeSlotToMinutes = (slot: string): number => {
  const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return NaN;

  let hour = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minutes;
};

/**
 * True when the given time slot is in the past — but only when `dateInput`
 * (a `yyyy-mm-dd` string) is today. Future dates always return false.
 */
export const isPastTimeSlot = (slot: string, dateInput: string): boolean => {
  if (!slot || !dateInput) return false;
  if (dateInput !== getTodayInputValue()) return false;

  const slotMinutes = timeSlotToMinutes(slot);
  if (Number.isNaN(slotMinutes)) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= nowMinutes;
};
