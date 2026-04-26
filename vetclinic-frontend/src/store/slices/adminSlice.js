import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

const extractMessage = (err) =>
  err.response?.data?.message || err.response?.data || err.message || 'An error occurred';

export const fetchPendingVets = createAsyncThunk('admin/fetchPendingVets', async (_, thunkAPI) => {
  try {
    return await adminService.getPendingVets();
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchApprovedVets = createAsyncThunk('admin/fetchApprovedVets', async (_, thunkAPI) => {
  try {
    return await adminService.getApprovedVets();
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const approveVet = createAsyncThunk('admin/approveVet', async (id, thunkAPI) => {
  try {
    return await adminService.approveVet(id);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const rejectVet = createAsyncThunk('admin/rejectVet', async (id, thunkAPI) => {
  try {
    await adminService.rejectVet(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const deleteVet = createAsyncThunk('admin/deleteVet', async (id, thunkAPI) => {
  try {
    await adminService.deleteVet(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    pendingVets: [],
    approvedVets: [],
    isLoading: false,
    isLoadingApproved: false,
    error: null,
    approving: [],
    rejecting: [],
    deleting: [],
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingVets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingVets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVets = action.payload;
      })
      .addCase(fetchPendingVets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchApprovedVets.pending, (state) => {
        state.isLoadingApproved = true;
        state.error = null;
      })
      .addCase(fetchApprovedVets.fulfilled, (state, action) => {
        state.isLoadingApproved = false;
        state.approvedVets = action.payload;
      })
      .addCase(fetchApprovedVets.rejected, (state, action) => {
        state.isLoadingApproved = false;
        state.error = action.payload;
      })

      .addCase(approveVet.pending, (state, action) => {
        state.approving.push(action.meta.arg);
        state.error = null;
      })
      .addCase(approveVet.fulfilled, (state, action) => {
        const { userId, email, fullName } = action.payload;
        state.approving = state.approving.filter((id) => id !== userId);
        state.pendingVets = state.pendingVets.filter((v) => v.userId !== userId);
        state.approvedVets.push({ userId, email, fullName });
      })
      .addCase(approveVet.rejected, (state, action) => {
        state.approving = state.approving.filter((id) => id !== action.meta.arg);
        state.error = action.payload;
      })

      .addCase(rejectVet.pending, (state, action) => {
        state.rejecting.push(action.meta.arg);
        state.error = null;
      })
      .addCase(rejectVet.fulfilled, (state, action) => {
        state.rejecting = state.rejecting.filter((id) => id !== action.payload);
        state.pendingVets = state.pendingVets.filter((v) => v.userId !== action.payload);
      })
      .addCase(rejectVet.rejected, (state, action) => {
        state.rejecting = state.rejecting.filter((id) => id !== action.meta.arg);
        state.error = action.payload;
      })

      .addCase(deleteVet.pending, (state, action) => {
        state.deleting.push(action.meta.arg);
        state.error = null;
      })
      .addCase(deleteVet.fulfilled, (state, action) => {
        state.deleting = state.deleting.filter((id) => id !== action.payload);
        state.approvedVets = state.approvedVets.filter((v) => v.userId !== action.payload);
      })
      .addCase(deleteVet.rejected, (state, action) => {
        state.deleting = state.deleting.filter((id) => id !== action.meta.arg);
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
