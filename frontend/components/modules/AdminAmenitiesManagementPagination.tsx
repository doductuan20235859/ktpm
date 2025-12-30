// Temporary helper component for pagination in AdminAmenitiesManagement
// This file contains the pagination code to be integrated
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const RequestsHistoryPagination = ({ 
  currentPage, 
  setCurrentPage, 
  totalItems, 
  itemsPerPage 
}: { 
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) => {
  if (totalItems <= itemsPerPage) return null;
  
  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Trang Trước
      </button>
      <span className="text-sm text-gray-600">
        Trang {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
      </span>
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage * itemsPerPage >= totalItems}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentPage * itemsPerPage >= totalItems
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Trang Tiếp
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
