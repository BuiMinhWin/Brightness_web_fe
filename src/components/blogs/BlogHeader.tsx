import React from "react";
import { Button } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

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
          marginLeft: "100px", // Space for the fox
          marginRight: "120px", // Space for the sort button
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

      {/* Sort By Button - Far Right Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 3,
        }}
      >
        <Button
          variant="contained"
          endIcon={<KeyboardArrowDown />}
          sx={{
            backgroundColor: "rgba(32, 124, 91, 0.6)",
            color: "white",
            borderRadius: "25px",
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "500",
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              backgroundColor: "rgba(32, 124, 91, 1)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Sort by
        </Button>
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
