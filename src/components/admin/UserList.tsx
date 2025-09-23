import React, { useState } from "react";
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
  IconButton,
  Box,
  Typography,
  TextField,
  Menu,
  ListItemText,
} from "@mui/material";
import {
  Refresh,
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  Search,
  FilterListAlt,
  Clear,
  KeyboardArrowDown,
} from "@mui/icons-material";

import { Funnel } from "lucide-react";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [joinFilter, setJoinFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchFilterAnchor, setSearchFilterAnchor] = useState<null | HTMLElement>(null);

  // Sample user data
  const users = [
    {
      id: "00001",
      name: "Christine Brooks",
      joinDate: "04 Sep 2024",
      type: "User",
      status: "Active",
    },
    {
      id: "00002",
      name: "Rosie Pearson",
      joinDate: "28 May 2024",
      type: "Trainer",
      status: "Active",
    },
    {
      id: "00003",
      name: "John Smith",
      joinDate: "15 Jun 2024",
      type: "User",
      status: "Active",
    },
    {
      id: "00004",
      name: "Sarah Johnson",
      joinDate: "22 Jul 2024",
      type: "Trainer",
      status: "Inactive",
    },
    {
      id: "00005",
      name: "Mike Wilson",
      joinDate: "08 Aug 2024",
      type: "User",
      status: "Active",
    },
    {
      id: "00006",
      name: "Lisa Brown",
      joinDate: "12 Sep 2024",
      type: "User",
      status: "Inactive",
    },
    {
      id: "00007",
      name: "Maggie Sullivan",
      joinDate: "21 Dec 2024",
      type: "User",
      status: "Inactive",
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterBy("");
    setJoinFilter("");
    setClassFilter("");
    setStatusFilter("");
  };

  const handleAddUser = () => {
    navigate("/admin/user-controls/add-user");
  };

  const handleViewEditUser = () => {
    navigate("/admin/user-controls/view-edit-user");
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSearchFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSearchFilterAnchor(event.currentTarget);
  };

  const handleSearchFilterClose = () => {
    setSearchFilterAnchor(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Filter users based on search term and other filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterBy =
      filterBy === "" ||
      (filterBy === "name" && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filterBy === "type" && user.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filterBy === "status" && user.status.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesJoinFilter = joinFilter === "" || true; // Add join date filtering logic if needed
    const matchesClassFilter =
      classFilter === "" || user.type.toLowerCase() === classFilter.toLowerCase();
    const matchesStatusFilter =
      statusFilter === "" || user.status.toLowerCase() === statusFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesFilterBy &&
      matchesJoinFilter &&
      matchesClassFilter &&
      matchesStatusFilter
    );
  });

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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setFilterBy(e.target.value)}
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
                onChange={(e) => setJoinFilter(e.target.value)}
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
                onChange={(e) => setClassFilter(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value)}
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
                <TableCell sx={{ color: "#076553", fontWeight: 500 }}>{user.name}</TableCell>
                <TableCell sx={{ color: "#666" }}>{user.joinDate}</TableCell>
                <TableCell sx={{ color: "#666" }}>{user.type}</TableCell>
                <TableCell>{getStatusChip(user.status)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleViewEditUser}
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
