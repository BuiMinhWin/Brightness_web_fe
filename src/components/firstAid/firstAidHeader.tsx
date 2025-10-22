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
    </div>
  );
};

export default FirstAidHeader;
