import { axiosReact } from '@/services/api';
import { DOCTORS, DOCTOR_BY_ID } from '@/services/url';
import conf from '@/conf/conf';

export interface ApiDoctor {
  _id: string;
  img?: string;
  f_name: string;
  l_name: string;
  email: string;
  number?: number;
  NIC?: number;
  DOB?: string;
  gander?: string;
  department: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  department: string;
  email: string;
  imageUrl: string;
  phone: string;
  nic: string;
  dob: string;
  gender: string;
}

// Backend serves uploaded files from its host root (e.g. http://localhost:3001/uploads/..),
// while the API itself lives under /api. Strip the trailing /api to reach static assets.
const ASSET_BASE_URL = conf.APIUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const buildDoctorImageUrl = (img?: string): string => {
  if (!img) return '';
  const normalized = img.replace(/\\/g, '/').replace(/^\//, '');
  return `${ASSET_BASE_URL}/${normalized}`;
};

export const mapApiDoctor = (doctor: ApiDoctor): Doctor => ({
  id: doctor._id,
  fullName: `${doctor.f_name} ${doctor.l_name}`.trim(),
  department: doctor.department,
  email: doctor.email,
  imageUrl: buildDoctorImageUrl(doctor.img),
  phone: doctor.number != null ? String(doctor.number) : '',
  nic: doctor.NIC != null ? String(doctor.NIC) : '',
  dob: doctor.DOB || '',
  gender: doctor.gander?.trim() || '—',
});

/**
 * Fetches doctors, optionally filtered by a server-side search term.
 * The backend matches the term against doctor fields (e.g. name, department),
 * via GET /api/doctor?search=...
 */
export const fetchDoctors = async (search?: string): Promise<Doctor[]> => {
  const term = search?.trim();
  const { data } = await axiosReact.get<ApiDoctor[]>(DOCTORS, {
    params: term ? { search: term } : undefined,
  });
  return data.map(mapApiDoctor);
};

export const getDepartments = (doctors: Doctor[]): string[] => {
  const seen = new Map<string, string>();
  doctors.forEach((doctor) => {
    const key = doctor.department.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.set(key, doctor.department.trim());
    }
  });
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
};

export const getDoctorsByDepartment = (
  doctors: Doctor[],
  department: string
): Doctor[] => {
  if (!department) return [];
  const key = department.trim().toLowerCase();
  return doctors.filter((doctor) => doctor.department.trim().toLowerCase() === key);
};

export interface CreateDoctorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  gender: string;
  password: string;
  department: string;
  image: File;
}

/**
 * Creates a doctor via POST /api/doctor using multipart/form-data.
 * The frontend form uses friendly field names, so they are mapped here to the
 * backend's expected keys (f_name, l_name, number, NIC, DOB, gander, img).
 * The Content-Type is left unset so the browser adds the multipart boundary.
 */
export const createDoctor = async (
  payload: CreateDoctorPayload
): Promise<ApiDoctor> => {
  const formData = new FormData();
  formData.append('f_name', payload.firstName);
  formData.append('l_name', payload.lastName);
  formData.append('email', payload.email);
  formData.append('number', payload.phone);
  formData.append('NIC', payload.nic);
  formData.append('DOB', payload.dob);
  formData.append('gander', payload.gender);
  formData.append('password', payload.password);
  formData.append('department', payload.department);
  formData.append('img', payload.image);

  const { data } = await axiosReact.post<{ message: string; doctor: ApiDoctor }>(
    DOCTORS,
    formData
  );
  return data.doctor;
};

export interface UpdateDoctorPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nic?: string;
  dob?: string;
  gender?: string;
  department?: string;
  image?: File | null;
}

/**
 * Updates a doctor via PATCH /api/doctor/:id using multipart/form-data so an
 * optional new image can be uploaded. Only provided fields are sent, mapped to
 * the backend's keys (f_name, l_name, number, NIC, DOB, gander, img).
 * The Content-Type is left unset so the browser adds the multipart boundary.
 */
export const updateDoctor = async (
  id: string,
  payload: UpdateDoctorPayload
): Promise<Doctor> => {
  const formData = new FormData();
  const fieldMap: Record<string, string | undefined> = {
    f_name: payload.firstName,
    l_name: payload.lastName,
    email: payload.email,
    number: payload.phone,
    NIC: payload.nic,
    DOB: payload.dob,
    gander: payload.gender,
    department: payload.department,
  };

  Object.entries(fieldMap).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, value);
  });

  if (payload.image) {
    formData.append('img', payload.image);
  }

  const { data } = await axiosReact.patch<{ message: string; doctor: ApiDoctor }>(
    DOCTOR_BY_ID(id),
    formData
  );
  return mapApiDoctor(data.doctor);
};

/** Deletes a doctor via DELETE /api/doctor/:id. */
export const deleteDoctor = async (id: string): Promise<void> => {
  await axiosReact.delete(DOCTOR_BY_ID(id));
};

/**
 * Normalizes the doctor API error into a single message. The backend returns
 * either a string (`{ error: "sorry a doctor with email already exist" }`) or
 * an express-validator array (`{ error: [{ msg, path }] }`).
 */
export const parseDoctorError = (error: unknown): string => {
  const apiError = (
    error as { response?: { data?: { error?: unknown } } }
  )?.response?.data?.error;

  if (Array.isArray(apiError)) {
    const messages = apiError
      .map((item) => (item as { msg?: string })?.msg)
      .filter(Boolean);
    return messages.join(', ') || 'Validation failed';
  }

  if (typeof apiError === 'string') {
    return apiError;
  }

  return 'Failed to create doctor. Please try again.';
};
