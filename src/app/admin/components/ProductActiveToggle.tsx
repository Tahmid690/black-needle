'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductActiveToggleProps {
  productId: string;
  initialIsActive: number;
}

export default function ProductActiveToggle({
  productId,
  initialIsActive,
}: ProductActiveToggleProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    const nextActive = isActive === 1 ? 0 : 1;

    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (res.ok) {
        setIsActive(nextActive);
        router.refresh();
      } else {
        alert('Failed to update product visibility');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to toggle product visibility.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-all ${
        isActive === 1
          ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
          : 'bg-white text-neutral-400 border-neutral-200 hover:text-neutral-600'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {isActive === 1 ? 'Active' : 'Draft / Hidden'}
    </button>
  );
}
