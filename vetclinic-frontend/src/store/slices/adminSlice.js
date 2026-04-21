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

export const approveVet = createAsyncThunk('admin/approveVet', async (id, thunkAPI) => {
  try {
    await adminService.approveVet(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    pendingVets: [],
    isLoading: false,
    error: null,
    approving: [],
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

      .addCase(approveVet.pending, (state, action) => {
        state.approving.push(action.meta.arg);
        state.error = null;
      })
      .addCase(approveVet.fulfilled, (state, action) => {
        state.approving = state.approving.filter((id) => id !== action.payload);
        state.pendingVets = state.pendingVets.filter((v) => v.userId !== action.payload);
      })
      .addCase(approveVet.rejected, (state, action) => {
        state.approving = state.approving.filter((id) => id !== action.meta.arg);
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
