import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnResizeMode,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';

export interface ContextMenuItem {
  label: string;
  onClick: (row: any) => void;
  icon?: React.ReactNode;
  danger?: boolean;
  hidden?: boolean;
}

interface CompactTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  onRowClick?: (row: T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  contextMenuItems?: (row: T) => ContextMenuItem[];
  enableColumnResize?: boolean;
  pageSize?: number;
  globalFilter?: string;
  emptyMessage?: string;
}

function CompactTable<T>({
  data,
  columns,
  onRowClick,
  renderRowActions,
  contextMenuItems,
  enableColumnResize = false,
  pageSize = 20,
  globalFilter,
  emptyMessage = 'No hay datos disponibles',
}: CompactTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnResizeMode: ColumnResizeMode = 'onChange';

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: enableColumnResize ? columnResizeMode : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const renderRow = (row: any) => {
    const rowContent = (
      <tr
        key={row.id}
        onClick={() => onRowClick?.(row.original)}
        className={`h-8 max-h-8 border-b border-table-border group transition-colors ${
          onRowClick ? 'cursor-pointer' : ''
        } hover:bg-row-hover`}
      >
        {row.getVisibleCells().map((cell: any) => (
          <td
            key={cell.id}
            className="px-2 text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-0"
            style={{ width: cell.column.getSize() }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
        {renderRowActions && (
          <td className="px-2 w-[80px]">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              {renderRowActions(row.original)}
            </div>
          </td>
        )}
      </tr>
    );

    if (contextMenuItems) {
      const items = contextMenuItems(row.original);
      const visibleItems = items.filter(item => !item.hidden);
      if (visibleItems.length === 0) return rowContent;

      return (
        <ContextMenu.Root key={row.id}>
          <ContextMenu.Trigger asChild>
            {rowContent}
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className="bg-white border border-gray-200 rounded-sm shadow-lg py-1 min-w-[160px] z-50">
              {visibleItems.map((item, i) => (
                <ContextMenu.Item
                  key={i}
                  onClick={() => item.onClick(row.original)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </ContextMenu.Item>
              ))}
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      );
    }

    return rowContent;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full" style={enableColumnResize ? { width: table.getCenterTotalSize() } : undefined}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-table-header border-b border-table-border">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-2 h-8 text-left text-xs font-medium text-text-secondary uppercase tracking-wide select-none relative"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-3 h-3" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-3 h-3" />}
                      </div>
                    )}
                    {enableColumnResize && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-[3px] cursor-col-resize hover:bg-blue-400"
                      />
                    )}
                  </th>
                ))}
                {renderRowActions && <th className="w-[80px]" />}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="text-center py-8 text-sm text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => renderRow(row))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2 py-1.5 border-t border-table-border">
          <span className="text-xs text-text-muted">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}{' '}
            de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            <span className="text-xs text-text-secondary px-2">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompactTable;
