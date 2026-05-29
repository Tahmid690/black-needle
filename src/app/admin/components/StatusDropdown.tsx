'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusDropdownProps {
  orderId: string;
  initialStatus: string;
}

export default function StatusDropdown({ orderId, initialStatus }: StatusDropdownProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status || loading) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert('Failed to update order status');
        // Reset to previous status
        setStatus(status);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to update status.');
      setStatus(status);
    } finally {
      setLoading(false);
    }
  }

  const badgeColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-500",
    processing: "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500",
    shipped: "bg-indigo-50 text-indigo-800 border-indigo-200 focus:ring-indigo-500",
    delivered: "bg-green-50 text-green-800 border-green-200 focus:ring-green-500",
    cancelled: "bg-red-50 text-red-800 border-red-200 focus:ring-red-500",
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`appearance-none text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border pr-7 focus:outline-none focus:ring-1 cursor-pointer transition-all ${
          badgeColor[status] || 'bg-neutral-50 text-neutral-800 border-neutral-200'
        } ${loading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {statuses.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-neutral-900 font-sans tracking-normal uppercase">
            {opt.label}
          </option>
        ))}
      </select>
      {/* Down arrow icon */}
      <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-neutral-500">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}
