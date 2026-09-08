'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyAppointmentPayment } from '@/services/appointmentService';

const VerifyAppointmentPayment = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const started = useRef(false);

  useEffect(() => {
    if (!sessionId || started.current) return;
    started.current = true;

    verifyAppointmentPayment(sessionId).catch((error) => {
      console.error('Payment verification failed:', error);
    });
  }, [sessionId]);

  return null;
};

export default VerifyAppointmentPayment;
