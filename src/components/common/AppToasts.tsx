'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function AppToasts() {
  return (
    <ToastContainer position="top-right" autoClose={3000} theme="light" />
  );
}
