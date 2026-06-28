import * as Yup from 'yup';
import { getTodayInputValue, isPastTimeSlot } from '@/lib/dateTime';

export const preferredDateField = Yup.string()
  .required('Please select a preferred date')
  .test('not-past', 'Appointment date cannot be in the past', (value) => {
    if (!value) return true;
    return value >= getTodayInputValue();
  });

export const preferredTimeField = Yup.string()
  .required('Please select a preferred time')
  .test('not-past', 'This time slot has already passed', function (value) {
    const { preferredDate } = this.parent as { preferredDate?: string };
    if (!value || !preferredDate) return true;
    return !isPastTimeSlot(value, preferredDate);
  });

export const PREFERRED_TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
] as const;

/** Returns only the time slots that are still available for the given date. */
export const getAvailableTimeSlots = (dateInput: string): string[] => {
  if (!dateInput) return [...PREFERRED_TIME_SLOTS];
  return PREFERRED_TIME_SLOTS.filter((slot) => !isPastTimeSlot(slot, dateInput));
};
