import React from "react";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@radix-ui/react-icons";

const FirstAidSearchBar: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          background: "linear-gradient(to right, #D0DF00, #FFAF72)",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "202px",
          }}
        >
          {/* Search Input Field - Left Side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <MagnifyingGlassIcon
              style={{
                color: "#9CA3AF",
                width: "20px",
                height: "20px",
                marginRight: "12px",
              }}
            />
            <input
              type="text"
              placeholder="Search videos, topics, or keywords..."
              style={{
                flexGrow: 1,
                color: "#374151",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Sort Dropdown - Right Side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#1F2937",
                fontSize: "14px",
                marginRight: "8px",
                whiteSpace: "nowrap",
                fontWeight: "500",
              }}
            >
              Sort by:
            </span>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "14px",
                color: "#374151",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #3B82F6")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)")}
            >
              Most Recent
              <ChevronDownIcon
                style={{
                  marginLeft: "8px",
                  width: "16px",
                  height: "16px",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstAidSearchBar;
