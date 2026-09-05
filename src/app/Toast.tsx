import { useEffect } from 'react';
import { useToastStore } from '../state/toastStore';

export function Toast() {
  const message = useToastStore((s) => s.message);
  const clearToast = useToastStore((s) => s.clearToast);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clearToast, 4000);
    return () => clearTimeout(timer);
  }, [message, clearToast]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="pointer-events-auto rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
