import React from 'react';
import CompactButton from './CompactButton';
import { CompactSelect } from './CompactInput';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  filteredTotal?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20, 30, 50, 100],
  itemLabel = 'registros',
  filteredTotal,
}) => {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Build page list with ellipsis - always include first and last
  const buildPageList = (): (number | 'ellipsis-left' | 'ellipsis-right')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis-left');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  };

  const pageList = buildPageList();

  return (
    <div className="flex items-center justify-between bg-white px-3 py-1.5 border-t border-gray-200">
      {/* Left: range + items-per-page selector */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-700">
          Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
          <span className="font-medium">{endIndex}</span> de{' '}
          <span className="font-medium">{totalItems}</span> {itemLabel}
          {filteredTotal !== undefined && filteredTotal !== totalItems && (
            <span className="text-gray-500"> (filtrados de {filteredTotal})</span>
          )}
        </div>
        {onPageSizeChange && (
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Por página:</label>
            <CompactSelect
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="!h-6 !text-xs"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </CompactSelect>
          </div>
        )}
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1">
        <CompactButton
          variant="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </CompactButton>

        <div className="flex items-center gap-0.5">
          {pageList.map((page, idx) => {
            if (page === 'ellipsis-left' || page === 'ellipsis-right') {
              return <span key={`${page}-${idx}`} className="px-1 text-xs text-gray-500">...</span>;
            }
            return (
              <CompactButton
                key={page}
                variant={page === currentPage ? 'primary' : 'ghost'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </CompactButton>
            );
          })}
        </div>

        <CompactButton
          variant="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </CompactButton>
      </div>
    </div>
  );
};

export default Pagination;
