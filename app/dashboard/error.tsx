'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-8 space-y-4">
        <h1 className="font-semibold text-lg md:text-2xl">
          Error: This page is under construction
        </h1>
        <img src="https://cdn.7tv.app/emote/01FWSB9VX80007YZP2DR4NVXJG/4x.avif" />
      </div>
    </main>
  );
}
