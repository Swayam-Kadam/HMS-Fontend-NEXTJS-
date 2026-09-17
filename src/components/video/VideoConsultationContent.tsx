'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Video } from 'lucide-react';
import VideoCallRoom from '@/components/video/VideoCallRoom';
import {
  useEndVideoCallMutation,
  useVideoStatusQuery,
  useVideoTokenMutation,
} from '@/hooks/queries';

interface VideoConsultationContentProps {
  appointmentId: string;
}

const VideoConsultationContent = ({ appointmentId }: VideoConsultationContentProps) => {
  const router = useRouter();
  const { data: status, isLoading, error } = useVideoStatusQuery(appointmentId);
  const tokenMutation = useVideoTokenMutation();
  const endCallMutation = useEndVideoCallMutation();
  const [session, setSession] = useState<{ roomUrl: string; token: string } | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = async () => {
    setJoinError(null);
    try {
      const data = await tokenMutation.mutateAsync(appointmentId);
      setSession({ roomUrl: data.roomUrl, token: data.token });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Unable to join video call');
    }
  };

  const handleLeave = useCallback(async () => {
    try {
      await endCallMutation.mutateAsync(appointmentId);
    } catch {
      // still navigate away if end call fails
    }
    router.push('/profile');
  }, [appointmentId, endCallMutation, router]);

  const handleConnectFailed = useCallback((message: string) => {
    setSession(null);
    setJoinError(message);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700">Unable to load video consultation details.</p>
        <Link href="/profile" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  if (session) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <VideoCallRoom
          roomUrl={session.roomUrl}
          token={session.token}
          onLeave={handleLeave}
          onFailed={handleConnectFailed}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Video size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Consultation</h1>
            <p className="text-sm text-gray-500">Secure call with your doctor</p>
          </div>
        </div>

        <div className="mb-6 space-y-2 text-sm text-gray-700">
          <p><strong>Doctor:</strong> {status.doctor}</p>
          <p><strong>Department:</strong> {status.department}</p>
          <p><strong>Date:</strong> {new Date(status.preferredDate).toLocaleDateString('en-IN')}</p>
          <p><strong>Time:</strong> {status.preferredTime}</p>
          <p><strong>Status:</strong> {status.status}</p>
        </div>

        {!status.dailyConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Video service is not configured on the server yet. Add `DAILY_API_KEY` on the backend.
          </p>
        )}

        {!status.canJoin && status.joinMessage && (
          <p className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            {status.joinMessage}
          </p>
        )}

        {joinError && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{joinError}</p>
        )}

        <button
          type="button"
          onClick={handleJoin}
          disabled={!status.canJoin || !status.dailyConfigured || tokenMutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tokenMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing room...
            </>
          ) : (
            <>
              <Video size={16} />
              Join Video Call
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoConsultationContent;
