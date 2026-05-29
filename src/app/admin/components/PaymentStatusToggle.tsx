'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentStatusToggleProps {
  orderId: string;
  initialPaymentStatus: string;
}

export default function PaymentStatusToggle({
  orderId,
  initialPaymentStatus,
}: PaymentStatusToggleProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    const nextPaymentStatus = paymentStatus === 'paid' ? 'unpaid' : 'paid';

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: nextPaymentStatus }),
      });

      if (res.ok) {
        setPaymentStatus(nextPaymentStatus);
        router.refresh();
      } else {
        alert('Failed to update payment status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to update payment status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-all ${
        paymentStatus === 'paid'
          ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
          : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {paymentStatus === 'paid' ? 'Paid' : 'Unpaid (COD)'}
    </button>
  );
}
