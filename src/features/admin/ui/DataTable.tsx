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

  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,

  isLoading
}: DataTableProps<T>) {

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--staff-accent)]"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-20 text-center rounded-2xl backdrop-blur-sm" style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)' }}>
        <div className="mb-2" style={{ color: 'var(--staff-muted)' }}>No records found</div>
        <div className="text-sm" style={{ color: 'var(--staff-muted)' }}>Try adjusting filters or create a new item.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl shadow-xl backdrop-blur-md" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--staff-border)', backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-muted)' }}>
            {columns.map((col, idx) => (
              <th key={idx} className={`p-5 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--staff-border)' }}>
          {data.map((item, rowIdx) => (
            <tr 
              key={item.id} 
              className="group transition-all duration-200 hover:bg-[var(--staff-accent)]/10"
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`p-5 text-sm ${col.className || ''}`} style={{ color: 'var(--staff-text)' }}>
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
