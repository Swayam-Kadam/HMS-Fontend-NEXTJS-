// import { somethingWentWrong } from '@/constants/SchemaValidation';
import { axiosReact } from '@/services/api';
import { LOGIN,SIGNUP } from '@/services/url';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// ===== TYPES =====

export interface AuthState {
  auth: [];
  authLoading: boolean;
}

// ===== ASYNC THUNKS =====
export const login = createAsyncThunk(
  `auth/login`,
  async (payload, thunkAPI) => { 
    try {
      const response = await axiosReact.post(LOGIN,payload); 
      return response; 
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Some thing went wrong");
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);

export const signup = createAsyncThunk(
  `auth/signup`,
  async (payload, thunkAPI) => { 
    try {
      const response = await axiosReact.post(SIGNUP,payload); 
      return response; 
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Some thing went wrong");
      return thunkAPI.rejectWithValue(err?.response?.data?.statusCode);
    }
  }
);


// ===== INITIAL STATE =====
const initialState: AuthState = {
  auth: [],
  authLoading: false,
};

// ===== SLICE =====
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.auth = []
      state.authLoading = true;
    });
    
    builder.addCase(login.fulfilled, (state, action) => {
      state.auth = action.payload?.data?.data
      state.authLoading = false;
    });
    
    builder.addCase(login.rejected, (state) => {
      state.auth = []
      state.authLoading = false;
    });
  },
});

export const {
  
} = authSlice.actions;

export default authSlice.reducer;