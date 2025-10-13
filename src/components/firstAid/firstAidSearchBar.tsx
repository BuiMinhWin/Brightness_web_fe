import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@radix-ui/react-icons";

interface FirstAidSearchBarProps {
  onSearch: (query: string) => void;
  onSortChange: (sortBy: 'date' | 'views' | 'likes' | 'title') => void;
  currentSort?: string;
}

const FirstAidSearchBar: React.FC<FirstAidSearchBarProps> = ({ 
  onSearch, 
  onSortChange,
  currentSort = 'date'
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const sortOptions = [
    { value: 'date', label: 'Most Recent' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'title', label: 'Title (A-Z)' },
  ];

  useEffect(() => {
    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Debounce search - wait 500ms after user stops typing
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const handleSortClick = (value: 'date' | 'views' | 'likes' | 'title') => {
    onSortChange(value);
    setShowSortMenu(false);
  };

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Most Recent';

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
              value={searchQuery}
              onChange={handleSearchChange}
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
              position: "relative",
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
              onClick={() => setShowSortMenu(!showSortMenu)}
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
              {currentSortLabel}
              <ChevronDownIcon
                style={{
                  marginLeft: "8px",
                  width: "16px",
                  height: "16px",
                  transform: showSortMenu ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {showSortMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  zIndex: 10,
                  minWidth: "180px",
                }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortClick(option.value as 'date' | 'views' | 'likes' | 'title')}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: currentSort === option.value ? "#F3F4F6" : "white",
                      color: "#374151",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s ease",
                      borderRadius: option.value === sortOptions[0].value ? "8px 8px 0 0" : 
                                    option.value === sortOptions[sortOptions.length - 1].value ? "0 0 8px 8px" : "0",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = currentSort === option.value ? "#F3F4F6" : "white")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstAidSearchBar;
