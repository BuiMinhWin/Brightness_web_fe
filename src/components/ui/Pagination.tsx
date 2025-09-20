import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "32px",
      }}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          background: "none",
          border: "none",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          color: currentPage === 1 ? "#999" : "#333",
        }}
      >
        ←
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: page === currentPage ? "#007E85" : "#333",
            fontWeight: page === currentPage ? "bold" : "normal",
            padding: "4px 8px",
          }}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          background: "none",
          border: "none",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          color: currentPage === totalPages ? "#999" : "#333",
        }}
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
