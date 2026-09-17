'use client';

import { useMemo, useState } from 'react';
import { Loader2, PhoneOff } from 'lucide-react';

interface VideoCallRoomProps {
  roomUrl: string;
  token: string;
  onLeave: () => void;
  onFailed?: (message: string) => void;
}

const buildDailyIframeUrl = (roomUrl: string, token: string) => {
  const url = new URL(roomUrl);
  url.searchParams.set('t', token);
  return url.toString();
};

const VideoCallRoom = ({ roomUrl, token, onLeave, onFailed }: VideoCallRoomProps) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const iframeSrc = useMemo(() => buildDailyIframeUrl(roomUrl, token), [roomUrl, token]);

  if (iframeError) {
    const message =
      'Could not load the video call. Check camera/mic permissions and try again.';
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p>{message}</p>
        <button
          type="button"
          onClick={() => onFailed?.(message)}
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[70vh] min-h-[420px] rounded-xl overflow-hidden bg-gray-900">
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-900/90 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Connecting to video consultation...</p>
          </div>
        )}
        <iframe
          src={iframeSrc}
          title="Video consultation"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="h-full w-full border-0"
          onLoad={() => setIframeLoaded(true)}
          onError={() => setIframeError(true)}
        />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onLeave}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <PhoneOff size={16} />
          End consultation
        </button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
