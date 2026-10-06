"use client";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-800">Something went wrong on the trail.</h2>
      <p className="mt-1 text-sm text-red-700">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-800 hover:bg-red-100"
      >
        Try again
      </button>
    </div>
  );
}
