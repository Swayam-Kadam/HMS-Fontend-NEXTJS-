// import { somethingWentWrong } from '@/constants/SchemaValidation';
import { axiosReact } from '@/services/api';
import { APPOINTMENT } from '@/services/url';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// ===== TYPES =====

export interface AuthState {
  appointment: [];
  appointmentLoading: boolean;
}

// ===== ASYNC THUNKS =====
export const appointment = createAsyncThunk(
  `auth/appointment`,
  async (payload, thunkAPI) => { 
    try {
      const response = await axiosReact.post(APPOINTMENT,payload); 
      return response; 
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Some thing went wrong");
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);


// ===== INITIAL STATE =====
const initialState: AuthState = {
  appointment: [],
  appointmentLoading: false,
};

// ===== SLICE =====
const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(appointment.pending, (state) => {
      state.appointment = []
      state.appointmentLoading = true;
    });
    
    builder.addCase(appointment.fulfilled, (state, action) => {
      state.appointment = action.payload?.data?.data
      state.appointmentLoading = false;
    });
    
    builder.addCase(appointment.rejected, (state) => {
      state.appointment = []
      state.appointmentLoading = false;
    });
  },
});

export const {
  
} = appointmentSlice.actions;

export default appointmentSlice.reducer;