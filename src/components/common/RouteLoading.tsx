'use client';

import { Loader2 } from 'lucide-react';

export default function RouteLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
      <Loader2 size={28} className="animate-spin text-blue-600" />
      <p className="text-sm">Loading...</p>
    </div>
  );
}
