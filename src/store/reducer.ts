import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import appointmentReducer from './slices/appointmentSlice'

const reducer = combineReducers({
    auth: authReducer,
    appointment: appointmentReducer,
});

export default reducer;
export type RootState = ReturnType<typeof reducer>;