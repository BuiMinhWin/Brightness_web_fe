import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { UserModel } from "../../models";

interface AdminState {
  // User Management
  users: UserModel[];
  selectedUser: UserModel | null;
  isLoadingUsers: boolean;
  isUpdatingUser: boolean;
  isCreatingUser: boolean;
  isDeletingUser: boolean;

  // Error states
  usersError: string | null;
  userOperationError: string | null;

  // Filter states
  searchTerm: string;
  filterBy: string;
  joinFilter: string;
  classFilter: string;
  statusFilter: string;
}

const initialState: AdminState = {
  users: [],
  selectedUser: null,
  isLoadingUsers: false,
  isUpdatingUser: false,
  isCreatingUser: false,
  isDeletingUser: false,
  usersError: null,
  userOperationError: null,
  searchTerm: "",
  filterBy: "",
  joinFilter: "",
  classFilter: "",
  statusFilter: "",
};

// Async thunks
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const users = await authService.getUsers();
    return users;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch users");
  }
});

export const createUser = createAsyncThunk(
  "admin/createUser",
  async (userData: any, { rejectWithValue }) => {
    try {
      const newUser = await authService.register(userData);
      return newUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ userId, userData }: { userId: string; userData: any }, { rejectWithValue }) => {
    try {
      const updatedUser = await authService.updateUser(userId, userData);
      return { userId, userData: updatedUser };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await authService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete user");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Selected User Management
    setSelectedUser: (state, action: PayloadAction<UserModel | null>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    // Filter Management
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilterBy: (state, action: PayloadAction<string>) => {
      state.filterBy = action.payload;
    },
    setJoinFilter: (state, action: PayloadAction<string>) => {
      state.joinFilter = action.payload;
    },
    setClassFilter: (state, action: PayloadAction<string>) => {
      state.classFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    resetFilters: (state) => {
      state.searchTerm = "";
      state.filterBy = "";
      state.joinFilter = "";
      state.classFilter = "";
      state.statusFilter = "";
    },

    // Error Management
    clearErrors: (state) => {
      state.usersError = null;
      state.userOperationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.users = action.payload;
        state.usersError = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.usersError = action.payload as string;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.isCreatingUser = true;
        state.userOperationError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreatingUser = false;
        // Add new user to the list (if the API returns user data)
        // For now, we'll refetch the users list
        state.userOperationError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreatingUser = false;
        state.userOperationError = action.payload as string;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isUpdatingUser = true;
        state.userOperationError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdatingUser = false;
        const { userId } = action.payload;
        // Update the user in the users array
        const userIndex = state.users.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          // Update with new data from API response if available
          // For now, we'll refetch the users list
        }
        // Clear selected user after successful update
        state.selectedUser = null;
        state.userOperationError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdatingUser = false;
        state.userOperationError = action.payload as string;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isDeletingUser = true;
        state.userOperationError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeletingUser = false;
        // Remove user from the list
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.userOperationError = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeletingUser = false;
        state.userOperationError = action.payload as string;
      });
  },
});

export const {
  setSelectedUser,
  clearSelectedUser,
  setSearchTerm,
  setFilterBy,
  setJoinFilter,
  setClassFilter,
  setStatusFilter,
  resetFilters,
  clearErrors,
} = adminSlice.actions;

// Selectors
export const selectAdminUsers = (state: { admin: AdminState }) => state.admin.users;
export const selectSelectedUser = (state: { admin: AdminState }) => state.admin.selectedUser;
export const selectIsLoadingUsers = (state: { admin: AdminState }) => state.admin.isLoadingUsers;
export const selectIsUpdatingUser = (state: { admin: AdminState }) => state.admin.isUpdatingUser;
export const selectIsCreatingUser = (state: { admin: AdminState }) => state.admin.isCreatingUser;
export const selectIsDeletingUser = (state: { admin: AdminState }) => state.admin.isDeletingUser;
export const selectUsersError = (state: { admin: AdminState }) => state.admin.usersError;
export const selectUserOperationError = (state: { admin: AdminState }) =>
  state.admin.userOperationError;

// Filter selectors
export const selectSearchTerm = (state: { admin: AdminState }) => state.admin.searchTerm;
export const selectFilterBy = (state: { admin: AdminState }) => state.admin.filterBy;
export const selectJoinFilter = (state: { admin: AdminState }) => state.admin.joinFilter;
export const selectClassFilter = (state: { admin: AdminState }) => state.admin.classFilter;
export const selectStatusFilter = (state: { admin: AdminState }) => state.admin.statusFilter;

// Complex selectors
export const selectFilteredUsers = (state: { admin: AdminState }) => {
  const { users, searchTerm, filterBy, joinFilter, classFilter, statusFilter } = state.admin;

  return users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterBy =
      filterBy === "" ||
      (filterBy === "name" && user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filterBy === "type" && user.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filterBy === "status" && user.status.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesJoinFilter =
      joinFilter === "" ||
      (joinFilter === "this-month" &&
        user.createdAt &&
        new Date(user.createdAt).getMonth() === new Date().getMonth());

    const matchesClassFilter =
      classFilter === "" || user.role.toLowerCase() === classFilter.toLowerCase();

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
};

export default adminSlice.reducer;
