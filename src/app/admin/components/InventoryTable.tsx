'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VariantData {
  id: string;
  sku: string;
  size: string;
  stock: number;
  productId: string;
  productName: string;
  productColor: string;
}

interface InventoryTableProps {
  variants: VariantData[];
}

export default function InventoryTable({ variants }: InventoryTableProps) {
  const router = useRouter();
  
  // Track stocks in local state for inputs
  const [stocks, setStocks] = useState<Record<string, number>>(
    variants.reduce((acc, v) => ({ ...acc, [v.id]: v.stock }), {})
  );
  
  // Track updating state for spinners/indicators
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // Filter state
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low' | 'ok'>('all');

  function handleStockChange(id: string, value: string) {
    const num = parseInt(value, 10);
    setStocks((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }));
  }

  async function saveStock(id: string) {
    const currentStock = stocks[id];
    const originalVariant = variants.find((v) => v.id === id);
    
    // Only save if stock value actually changed
    if (originalVariant && originalVariant.stock === currentStock) {
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: currentStock }),
      });

      if (res.ok) {
        // Success
        router.refresh();
      } else {
        alert('Failed to update stock');
        // Reset local state to original value
        if (originalVariant) {
          setStocks((prev) => ({ ...prev, [id]: originalVariant.stock }));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to save stock.');
      if (originalVariant) {
        setStocks((prev) => ({ ...prev, [id]: originalVariant.stock }));
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  }

  // Filter logic
  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.productColor.toLowerCase().includes(search.toLowerCase());

    const stockVal = stocks[v.id] ?? v.stock;
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = stockVal === 0;
    else if (stockFilter === 'low') matchesStock = stockVal > 0 && stockVal < 5;
    else if (stockFilter === 'ok') matchesStock = stockVal >= 5;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 border border-neutral-200">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Name, SKU, Color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-200 text-xs tracking-wider uppercase focus:outline-none focus:border-neutral-900 bg-white text-neutral-900"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['all', 'out', 'low', 'ok'] as const).map((filter) => {
            const labels = { all: 'All Levels', out: 'Out of Stock', low: 'Low Stock (<5)', ok: 'Healthy (5+)' };
            const isActive = stockFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-400 border-neutral-200 hover:text-neutral-600'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 p-6">
        {filteredVariants.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400 tracking-wider uppercase font-semibold border border-dashed border-neutral-200">
            No variants match the current search or filters
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product details</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">SKU</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Size</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Level</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right w-40">Stock Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredVariants.map((v) => {
                    const stockVal = stocks[v.id] ?? v.stock;
                    const isUpdating = updating[v.id];

                    let levelBadge = '';
                    if (stockVal === 0) {
                      levelBadge = 'bg-red-50 text-red-800 border-red-200';
                    } else if (stockVal < 5) {
                      levelBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                    } else {
                      levelBadge = 'bg-green-50 text-green-800 border-green-200';
                    }

                    const levelLabel = stockVal === 0 ? 'Out' : stockVal < 5 ? 'Low' : 'Healthy';

                    return (
                      <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Name & Color */}
                        <td className="py-4 pr-4">
                          <span className="font-bold text-neutral-800 uppercase tracking-wide block">
                            {v.productName}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block mt-0.5">
                            Color: {v.productColor}
                          </span>
                        </td>
                        {/* SKU */}
                        <td className="py-4 font-mono text-neutral-500 font-medium tracking-wider uppercase">
                          {v.sku}
                        </td>
                        {/* Size */}
                        <td className="py-4 text-center font-bold text-neutral-800">
                          {v.size}
                        </td>
                        {/* Level */}
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${levelBadge}`}>
                            {levelLabel}
                          </span>
                        </td>
                        {/* Stock input */}
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center justify-end space-x-2 w-full">
                            {isUpdating && (
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider animate-pulse">
                                Saving...
                              </span>
                            )}
                            <input
                              type="number"
                              min="0"
                              value={stockVal}
                              onChange={(e) => handleStockChange(v.id, e.target.value)}
                              onBlur={() => saveStock(v.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveStock(v.id);
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              className={`w-20 px-3 py-1.5 border text-right font-mono text-xs focus:outline-none transition-colors ${
                                isUpdating
                                  ? 'bg-neutral-50 text-neutral-400 border-neutral-200'
                                  : 'bg-white text-neutral-900 border-neutral-200 focus:border-neutral-900'
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredVariants.map((v) => {
                const stockVal = stocks[v.id] ?? v.stock;
                const isUpdating = updating[v.id];

                let levelBadge = '';
                if (stockVal === 0) {
                  levelBadge = 'bg-red-50 text-red-800 border-red-200';
                } else if (stockVal < 5) {
                  levelBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                } else {
                  levelBadge = 'bg-green-50 text-green-800 border-green-200';
                }

                const levelLabel = stockVal === 0 ? 'Out of Stock' : stockVal < 5 ? 'Low Stock' : 'Healthy';

                return (
                  <div key={v.id} className="border border-neutral-100 p-4 space-y-4 bg-white shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-neutral-800 uppercase tracking-wide block">
                          {v.productName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block mt-0.5">
                          Color: {v.productColor} · Size {v.size}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 border text-[9px] font-bold uppercase tracking-widest ${levelBadge}`}>
                        {levelLabel}
                      </span>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-0.5">SKU Reference</span>
                        <span className="font-mono text-xs text-neutral-600 tracking-wider uppercase font-semibold">{v.sku}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-0.5">Manage Stock</span>
                          {isUpdating && (
                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider animate-pulse block">
                              Saving...
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={stockVal}
                          onChange={(e) => handleStockChange(v.id, e.target.value)}
                          onBlur={() => saveStock(v.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveStock(v.id);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={`w-24 px-3 py-2 border text-right font-mono text-xs focus:outline-none transition-colors ${
                            isUpdating
                              ? 'bg-neutral-50 text-neutral-400 border-neutral-200'
                              : 'bg-white text-neutral-900 border-neutral-200 focus:border-neutral-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
