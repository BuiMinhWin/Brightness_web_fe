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
  CircularProgress,
} from "@mui/material";
import { ArrowBack, CameraAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createUser,
  selectIsCreatingUser,
  selectUserOperationError,
  fetchUsers,
} from "../../store/slices/adminSlice";

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux State
  const loading = useAppSelector(selectIsCreatingUser);
  const error = useAppSelector(selectUserOperationError);
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    role: "user",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.userName || !formData.password) {
      return;
    }

    // Create user via Redux action
    const userData = {
      email: formData.email,
      userName: formData.userName,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      role: formData.role,
      status: "active", // Default status for new users
    };

    try {
      await dispatch(createUser(userData)).unwrap();

      // Refresh the users list and navigate back
      dispatch(fetchUsers());
      navigate("/admin/user-controls");
    } catch (err) {
      console.error("Error creating user:", err);
      // Error is handled by Redux state
    }
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
          Add New User
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
          maxHeight: "auto",
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
              width: "80px",
              height: "80px",
              backgroundColor: "#F5F5F5",
              border: "2px solid #E0E0E0",
              marginBottom: "8px",
            }}
          >
            <CameraAlt sx={{ fontSize: "32px", color: "#666" }} />
          </Avatar>
          <Typography
            sx={{
              color: "#1976D2",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Upload Photo
          </Typography>
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
              Email *
            </Typography>
            <TextField
              fullWidth
              type="email"
              label="Enter email address"
              variant="outlined"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
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

          {/* Username */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Username *
            </Typography>
            <TextField
              fullWidth
              label="Enter username"
              variant="outlined"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              required
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

          {/* Password */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Password *
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Enter password"
              variant="outlined"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
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

          {/* Full Name */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Full Name
            </Typography>
            <TextField
              fullWidth
              label="Enter full name"
              variant="outlined"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
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
              label="Enter phone number"
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
              type="date"
              label="Select date of birth"
              variant="outlined"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
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

          {/* Role */}
          <Box>
            <Typography
              sx={{
                marginBottom: "8px",
                fontWeight: 700,
                color: "#333",
                fontSize: "18px",
              }}
            >
              Role *
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
              <InputLabel>Select role</InputLabel>
              <Select
                label="Select role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                sx={{
                  "& .MuiSelect-select": {
                    color: formData.role ? "#333" : "#999",
                  },
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="trainer">Trainer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "#ffebee", borderRadius: "8px" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Submit Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
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
              "&:disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Create User"}
          </Button>

          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={loading}
            sx={{
              borderColor: "#05644C",
              color: "#05644C",
              borderRadius: "12px",
              padding: "12px 48px",
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#076553",
                backgroundColor: "rgba(5, 100, 76, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
        </Box>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} sx={{ color: "white" }} />
          </Box>
        )}
      </Paper>
    </div>
  );
};

export default AddUser;
