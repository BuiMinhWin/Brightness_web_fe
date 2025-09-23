import React from "react";
import { UploadIcon } from "@radix-ui/react-icons";

const FirstAidHeader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: "40px",
        paddingBottom: "4px",
      }}
    >
      {/* Left side - Text content */}
      <div style={{ flex: 1, paddingRight: "32px" }}>
        <h1
          style={{
            color: "#05644C",
            fontWeight: "normal",
            marginBottom: "16px",
            lineHeight: "1.25",
            fontFamily: "Pacifico, cursive",
            fontSize: "42px",
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          Would you know what to do in an emergency?
        </h1>
        <p
          style={{
            color: "#1f2937",
            fontSize: "16px",
            lineHeight: "1.625",
            marginBottom: "10px",
            margin: 0,
          }}
        >
          Learn essential first aid techniques through our comprehensive video collection
        </p>
      </div>

      {/* Right side - Upload button */}
      <div style={{ flexShrink: 0 }}>
        <button
          style={{
            backgroundColor: "#05644C",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#044a3f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#05644C";
          }}
        >
          <UploadIcon width={20} height={20} />
          Upload Video
        </button>
      </div>
    </div>
  );
};

export default FirstAidHeader;
