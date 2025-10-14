import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  TextField,
  Menu,
} from "@mui/material";
import {
  Refresh,
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  Search,
  FilterListAlt,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchUsers,
  setSelectedUser,
  setSearchTerm,
  setFilterBy,
  setJoinFilter,
  setClassFilter,
  setStatusFilter,
  resetFilters,
  selectFilteredUsers,
  selectIsLoadingUsers,
  selectUsersError,
  selectSearchTerm,
  selectFilterBy,
  selectJoinFilter,
  selectClassFilter,
  selectStatusFilter,
} from "../../store/slices/adminSlice";
import { UserModel } from "../../models";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux State
  const filteredUsers = useAppSelector(selectFilteredUsers);
  const loading = useAppSelector(selectIsLoadingUsers);
  const error = useAppSelector(selectUsersError);
  const searchTerm = useAppSelector(selectSearchTerm);
  const filterBy = useAppSelector(selectFilterBy);
  const joinFilter = useAppSelector(selectJoinFilter);
  const classFilter = useAppSelector(selectClassFilter);
  const statusFilter = useAppSelector(selectStatusFilter);

  // Local UI State
  const [searchFilterAnchor, setSearchFilterAnchor] = useState<null | HTMLElement>(null);

  // Load users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Refresh data when user returns to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchUsers());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dispatch]);

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handleAddUser = () => {
    navigate("/admin/user-controls/add-user");
  };

  const handleEditUser = (user: UserModel) => {
    // Store selected user in Redux state
    dispatch(setSelectedUser(user));
    navigate("/admin/user-controls/view-edit-user");
  };

  const handleSearchFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSearchFilterAnchor(event.currentTarget);
  };

  const handleSearchFilterClose = () => {
    setSearchFilterAnchor(null);
  };

  // Filtered users are already computed in Redux selector

  const getStatusChip = (status: string) => {
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: status === "Active" ? "#E8F5E8" : "#FFE8E8",
          color: status === "Active" ? "#2E7D32" : "#D32F2F",
          fontWeight: 500,
          borderRadius: "4px",
        }}
      />
    );
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
          User List
        </Typography>
      </div>

      {/* Split Layout Search + Filter + Action Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search ..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          slotProps={{
            input: {
              startAdornment: <Search sx={{ color: "#666", mr: 1 }} />,
            },
          }}
          sx={{
            minWidth: 250,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
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
          }}
        />

        {/* Filter Dropdown Button */}
        <Button
          variant="outlined"
          startIcon={<FilterListAlt />}
          endIcon={<KeyboardArrowDown />}
          onClick={handleSearchFilterOpen}
          sx={{
            borderColor: "#E0E0E0",
            color: "#666",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              borderColor: "#076553",
              backgroundColor: "rgba(7, 101, 83, 0.04)",
            },
          }}
        >
          Filter
        </Button>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Add User Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
          sx={{
            backgroundColor: "#05644C",
            color: "white",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#076553",
            },
          }}
        >
          Add user
        </Button>

        {/* Search + Filter Menu */}
        <Menu
          anchorEl={searchFilterAnchor}
          open={Boolean(searchFilterAnchor)}
          onClose={handleSearchFilterClose}
          PaperProps={{
            sx: {
              minWidth: 250,
              mt: 1,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#076553" }}>
              Search & Filter Options
            </Typography>

            {/* Filter By */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterBy}
                onChange={(e) => dispatch(setFilterBy(e.target.value))}
                label="Filter By"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* Join Filter */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Join</InputLabel>
              <Select
                value={joinFilter}
                onChange={(e) => dispatch(setJoinFilter(e.target.value))}
                label="Join"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="recent">Recent</MenuItem>
                <MenuItem value="last-month">Last Month</MenuItem>
                <MenuItem value="last-year">Last Year</MenuItem>
              </Select>
            </FormControl>

            {/* Class Filter */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                onChange={(e) => dispatch(setClassFilter(e.target.value))}
                label="Class"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="trainer">Trainer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Filter Button */}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleResetFilters}
              fullWidth
              sx={{
                borderColor: "#076553",
                color: "#076553",
                "&:hover": {
                  borderColor: "#05644C",
                  backgroundColor: "rgba(5, 100, 76, 0.04)",
                },
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Menu>
      </Box>

      {/* User Data Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: "600", color: "#076553" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#076553" }}>NAME</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#076553" }}>JOIN</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#076553" }}>TYPE</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#076553" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#076553", textAlign: "center" }}>
                USER CONTROL
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ color: "#076553", fontWeight: 500 }}>{user.id}</TableCell>
                <TableCell sx={{ color: "#076553", fontWeight: 500 }}>
                  {user.fullName || user.userName}
                </TableCell>
                <TableCell sx={{ color: "#666" }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell sx={{ color: "#666" }}>{user.role}</TableCell>
                <TableCell>{getStatusChip(user.status)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => handleEditUser(user)}
                    sx={{
                      backgroundColor: "#05644C",
                      color: "white",
                      textTransform: "none",
                      borderRadius: "100px",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#076553",
                      },
                    }}
                  >
                    View / Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "24px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #E0E0E0",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Previous Page Section */}
          <Box
            sx={{
              width: "45px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              cursor: "pointer",
              borderRight: "1px solid #E0E0E0",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            <ArrowBackIos sx={{ color: "#9E9E9E", fontSize: "20px" }} />
          </Box>

          {/* Next Page Section */}
          <Box
            sx={{
              width: "45px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            <ArrowForwardIos sx={{ color: "#424242", fontSize: "20px" }} />
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default UserList;
