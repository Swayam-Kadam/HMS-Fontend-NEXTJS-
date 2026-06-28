'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DOTS = 'dots';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | typeof DOTS)[] => {
  // first + last + current + 2*siblings + 2*dots
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + 2 * siblingCount);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - (2 + 2 * siblingCount), totalPages);
    return [1, DOTS, ...rightRange];
  }

  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>

      {items.map((item, index) =>
        item === DOTS ? (
          <span
            key={`dots-${index}`}
            className="min-w-[42px] h-[42px] inline-flex items-center justify-center text-sm font-semibold text-gray-400 select-none"
          >
            &#8230;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`min-w-[42px] h-[42px] text-sm font-semibold rounded-xl transition-all ${
              currentPage === item
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
