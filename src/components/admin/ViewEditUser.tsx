import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Paper,
  Avatar,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ViewEditUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "Kevin",
    lastName: "Fleming",
    email: "jaskolski.brent@yahoo.com",
    phoneNumber: "546-933-2772",
    dateOfBirth: "11-08-1995",
    gender: "Female",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Navigate back to user list
    navigate("/admin/user-controls");
  };

  const handleBack = () => {
    navigate("/admin/user-controls");
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #E2F043 0%, #05644C 100%)",
        minHeight: "100vh",
        padding: "24px",
        color: "#076553",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "600",
            color: "#076553",
            marginBottom: "8px",
          }}
        >
          View / Edit
        </Typography>
      </div>

      {/* Form Card */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: "99%",
          margin: "0 auto",
          padding: "20px",
          borderRadius: "16px",
          backgroundColor: "white",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Back Button */}
        <IconButton
          onClick={handleBack}
          sx={{
            marginBottom: "16px",
            color: "#000",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Profile Photo Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Avatar
            sx={{
              width: "100px",
              height: "100px",
              backgroundColor: "#F5F5F5",
              border: "2px solid #E0E0E0",
              marginBottom: "8px",
            }}
          >
            {/* This would be replaced with actual user profile image */}
            <Typography sx={{ fontSize: "24px", color: "#666" }}>KF</Typography>
          </Avatar>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* First Name */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              First Name
            </Typography>
            <TextField
              fullWidth
              label="Enter your first name"
              variant="outlined"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            />
          </Box>

          {/* Last Name */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Last Name
            </Typography>
            <TextField
              fullWidth
              label="Enter your last name"
              variant="outlined"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              label="Enter your email"
              variant="outlined"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            />
          </Box>

          {/* Phone Number */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Phone Number
            </Typography>
            <TextField
              fullWidth
              label="Enter your phone number"
              variant="outlined"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            />
          </Box>

          {/* Date of Birth */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Date of Birth
            </Typography>
            <TextField
              fullWidth
              label="Enter your birthdate"
              variant="outlined"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            />
          </Box>

          {/* Gender */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Gender
            </Typography>
            <FormControl
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "#E0E0E0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#076553",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#076553",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  "&.Mui-focused": {
                    color: "#076553",
                  },
                },
              }}
            >
              <InputLabel>Select gender</InputLabel>
              <Select
                label="Select gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                sx={{
                  "& .MuiSelect-select": {
                    color: formData.gender ? "#333" : "#999",
                  },
                }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#05644C",
              color: "white",
              borderRadius: "12px",
              padding: "12px 48px",
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#076553",
              },
            }}
          >
            Lock Account
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default ViewEditUser;
