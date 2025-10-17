import React from "react";

const BlogHeader: React.FC = () => {
  return (
    <div
      style={{
        width: "60%",
        background: "transparent",
        padding: "60px 20px",
        marginBottom: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fox Illustration */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          bottom: "15px",
          zIndex: 1,
        }}
      >
        <img
          src="/assets/foxHead_closedEye_tiltLeft.svg"
          alt="Fox"
          style={{
            width: "80%",
            height: "80%",
          }}
        />
      </div>

      {/* Text Content - Centered */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          marginLeft: "15px", // Space for the fox
        }}
      >
        <h1
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: "2.5rem",
            fontWeight: "500",
            color: "#076553",
            margin: 0,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          See what they are talking about
        </h1>
      </div>

      {/* Decorative Line */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "3px",
          background: "rgba(32, 124, 91, 1)",
          borderRadius: "0 0 20px 20px",
        }}
      />
    </div>
  );
};

export default BlogHeader;
