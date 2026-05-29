'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

export default function ProductDeleteButton({
  productId,
  productName,
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis will permanently delete this product and ALL of its size variants from the database. This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to delete product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 px-3 py-1.5 transition-all ${
        loading ? 'opacity-50 cursor-wait' : ''
      }`}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
