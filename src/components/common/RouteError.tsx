'use client';

import { AlertCircle, RotateCw } from 'lucide-react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
      <span className="inline-flex items-center gap-2 text-red-600 text-sm font-medium">
        <AlertCircle size={18} />
        {error.message || 'Something went wrong.'}
      </span>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
      >
        <RotateCw size={14} />
        Try again
      </button>
    </div>
  );
}
