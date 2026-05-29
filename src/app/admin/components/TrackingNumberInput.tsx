'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrackingNumberInputProps {
  orderId: string;
  initialTrackingNumber: string | null;
}

export default function TrackingNumberInput({
  orderId,
  initialTrackingNumber,
}: TrackingNumberInputProps) {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() || null }),
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to update tracking number');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to update tracking number.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label
          htmlFor="trackingNumber"
          className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2"
        >
          Courier / Tracking Number
        </label>
        <div className="flex gap-2">
          <input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-neutral-200 text-xs font-mono tracking-wider focus:outline-none focus:border-neutral-900 transition-colors bg-white text-neutral-900"
            placeholder="e.g. PATHAO-12948274"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold tracking-widest py-2.5 px-6 uppercase transition-colors disabled:bg-neutral-400 flex-shrink-0"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {success && (
        <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 uppercase font-bold tracking-wider block text-center">
          Tracking number updated successfully
        </span>
      )}
    </form>
  );
}
