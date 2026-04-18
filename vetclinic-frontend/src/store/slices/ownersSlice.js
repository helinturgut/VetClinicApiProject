import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ownersService from '../../services/ownersService';

const extractMessage = (err) =>
  err.response?.data?.message || err.response?.data || err.message || 'An error occurred';

export const fetchOwners = createAsyncThunk('owners/fetchAll', async (_, thunkAPI) => {
  try {
    return await ownersService.getAll();
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchOwner = createAsyncThunk('owners/fetchOne', async (id, thunkAPI) => {
  try {
    return await ownersService.getById(id);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const createOwner = createAsyncThunk('owners/create', async (data, thunkAPI) => {
  try {
    return await ownersService.create(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const updateOwner = createAsyncThunk('owners/update', async ({ id, data }, thunkAPI) => {
  try {
    return await ownersService.update(id, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

const pending = (state) => {
  state.isLoading = true;
  state.error = null;
};

const rejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const ownersSlice = createSlice({
  name: 'owners',
  initialState: {
    list: [],
    selected: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwners.pending, pending)
      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchOwners.rejected, rejected)

      .addCase(fetchOwner.pending, pending)
      .addCase(fetchOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchOwner.rejected, rejected)

      .addCase(createOwner.pending, pending)
      .addCase(createOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createOwner.rejected, rejected)

      .addCase(updateOwner.pending, pending)
      .addCase(updateOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
        const idx = state.list.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateOwner.rejected, rejected);
  },
});

export const { clearSelected, clearError } = ownersSlice.actions;
export default ownersSlice.reducer;
