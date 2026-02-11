'use client';

import React from 'react';
import Link from 'next/link';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading
}: DataTableProps<T>) {

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f1c40f]"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-20 text-center bg-[#34495e]/20 rounded-2xl border border-[#ffffff08] backdrop-blur-sm">
        <div className="text-[#7f8c8d] mb-2">No records found</div>
        <div className="text-sm text-[#547085]">Try adjusting filters or create a new item.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#ffffff08] shadow-2xl bg-[#2c3e50]/40 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#ffffff08] bg-[#34495e]/50 text-xs uppercase tracking-wider text-[#bdc3c7]">
            {columns.map((col, idx) => (
              <th key={idx} className={`p-5 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ffffff05]">
          {data.map((item, rowIdx) => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick && onRowClick(item)}
              className={`
                group transition-all duration-200 hover:bg-[#f1c40f]/5 
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`p-5 text-sm text-[#f7f9fb] ${col.className || ''}`}>
                  {col.cell 
                    ? col.cell(item) 
                    : String(item[col.accessorKey as keyof T] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
