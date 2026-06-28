export type AppointmentStatus = 'Pending' | 'Approved' | 'Cancelled';

export interface Appointment {
  id: string;
  appointmentType: string;
  firstName: string;
  lastName: string;
  phone: string;
  nic: string;
  email: string;
  dob: string;
  department: string;
  doctor: string;
  preferredDate: string;
  preferredTime: string;
  gender: string;
  reason: string;
  notes: string;
  status: AppointmentStatus;
  bookedOn: string;
}

const APPOINTMENTS_KEY = 'hospital-appointments';

const seedAppointments: Appointment[] = [
  {
    id: '1',
    appointmentType: 'Clinic Visit',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 234 567 890',
    nic: '199012345678',
    email: 'johndoe@example.com',
    dob: '1990-03-15',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Johnson',
    preferredDate: '2026-06-25',
    preferredTime: '10:30',
    gender: 'Male',
    reason: 'Regular heart checkup and ECG review.',
    notes: '',
    status: 'Pending',
    bookedOn: '20 Jun 2026',
  },
  {
    id: '2',
    appointmentType: 'Video Consult',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1 234 567 891',
    nic: '199512345678',
    email: 'jane.smith@example.com',
    dob: '1995-07-22',
    department: 'Neurology',
    doctor: 'Dr. James Wilson',
    preferredDate: '2026-06-26',
    preferredTime: '14:00',
    gender: 'Female',
    reason: 'Follow-up consultation for migraine treatment.',
    notes: 'Prefer afternoon slot',
    status: 'Approved',
    bookedOn: '19 Jun 2026',
  },
  {
    id: '3',
    appointmentType: 'Clinic Visit',
    firstName: 'Mike',
    lastName: 'Brown',
    phone: '+1 234 567 892',
    nic: '198812345678',
    email: 'mike.brown@example.com',
    dob: '1988-11-08',
    department: 'Orthopedics',
    doctor: 'Dr. Michael Brown',
    preferredDate: '2026-06-24',
    preferredTime: '09:00',
    gender: 'Male',
    reason: 'Knee pain assessment after sports injury.',
    notes: '',
    status: 'Approved',
    bookedOn: '18 Jun 2026',
  },
  {
    id: '4',
    appointmentType: 'Emergency',
    firstName: 'Lisa',
    lastName: 'Anderson',
    phone: '+1 234 567 893',
    nic: '200012345678',
    email: 'lisa@example.com',
    dob: '2000-01-30',
    department: 'Pediatrics',
    doctor: 'Dr. Emily Chen',
    preferredDate: '2026-06-23',
    preferredTime: '16:30',
    gender: 'Female',
    reason: 'Child fever and rash — urgent consultation needed.',
    notes: '',
    status: 'Cancelled',
    bookedOn: '17 Jun 2026',
  },
  {
    id: '5',
    appointmentType: 'Clinic Visit',
    firstName: 'David',
    lastName: 'Kim',
    phone: '+1 234 567 894',
    nic: '199312345678',
    email: 'david.kim@example.com',
    dob: '1993-05-12',
    department: 'Ophthalmology',
    doctor: 'Dr. Emily Chen',
    preferredDate: '2026-06-28',
    preferredTime: '11:00',
    gender: 'Male',
    reason: 'Annual eye examination and vision test.',
    notes: '',
    status: 'Pending',
    bookedOn: '16 Jun 2026',
  },
  {
    id: '6',
    appointmentType: 'Video Consult',
    firstName: 'Swayam',
    lastName: 'Kadam',
    phone: '+1 234 567 895',
    nic: '200512345678',
    email: 'swayamkadam@gmail.com',
    dob: '2005-03-02',
    department: 'General Medicine',
    doctor: 'Dr. Robert Lee',
    preferredDate: '2026-06-27',
    preferredTime: '15:00',
    gender: 'Male',
    reason: 'General health checkup and blood pressure monitoring.',
    notes: 'First visit',
    status: 'Pending',
    bookedOn: '15 Jun 2026',
  },
];

const readStorage = (): Appointment[] => {
  if (typeof window === 'undefined') return seedAppointments;
  try {
    const stored = localStorage.getItem(APPOINTMENTS_KEY);
    if (!stored) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(seedAppointments));
      return seedAppointments;
    }
    return JSON.parse(stored) as Appointment[];
  } catch {
    return seedAppointments;
  }
};

const writeStorage = (data: Appointment[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(data));
};

export const getAppointments = (): Appointment[] => readStorage();

export const addAppointment = (
  data: Omit<Appointment, 'id' | 'status' | 'bookedOn'>
): Appointment => {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...data,
    id: Date.now().toString(),
    status: 'Pending',
    bookedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
  writeStorage([newAppointment, ...appointments]);
  return newAppointment;
};

export const updateAppointmentStatus = (id: string, status: AppointmentStatus): Appointment[] => {
  const appointments = getAppointments().map((a) => (a.id === id ? { ...a, status } : a));
  writeStorage(appointments);
  return appointments;
};

export const getPatientFullName = (a: Appointment) => `${a.firstName} ${a.lastName}`;

export const formatAppointmentDate = (date: string) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatAppointmentTime = (time: string) => {
  if (!time) return '—';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return time;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m || '00'} ${ampm}`;
};
