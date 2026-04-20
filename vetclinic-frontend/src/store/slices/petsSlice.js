import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import petsService from '../../services/petsService';

const extractMessage = (err) =>
  err.response?.data?.message || err.response?.data || err.message || 'An error occurred';

export const fetchPets = createAsyncThunk('pets/fetchAll', async (_, thunkAPI) => {
  try {
    return await petsService.getAll();
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchPet = createAsyncThunk('pets/fetchOne', async (id, thunkAPI) => {
  try {
    return await petsService.getById(id);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const createPet = createAsyncThunk('pets/create', async (data, thunkAPI) => {
  try {
    return await petsService.create(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const updatePet = createAsyncThunk('pets/update', async ({ id, data }, thunkAPI) => {
  try {
    return await petsService.update(id, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const deletePet = createAsyncThunk('pets/delete', async (id, thunkAPI) => {
  try {
    await petsService.remove(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchPetHistory = createAsyncThunk('pets/fetchHistory', async (id, thunkAPI) => {
  try {
    return await petsService.getHistory(id);
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

const petsSlice = createSlice({
  name: 'pets',
  initialState: {
    list: [],
    selected: null,
    history: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.history = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.pending, pending)
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchPets.rejected, rejected)

      .addCase(fetchPet.pending, pending)
      .addCase(fetchPet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPet.rejected, rejected)

      .addCase(createPet.pending, pending)
      .addCase(createPet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createPet.rejected, rejected)

      .addCase(updatePet.pending, pending)
      .addCase(updatePet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updatePet.rejected, rejected)

      .addCase(deletePet.pending, pending)
      .addCase(deletePet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((p) => p.id !== action.payload);
        state.selected = null;
      })
      .addCase(deletePet.rejected, rejected)

      .addCase(fetchPetHistory.pending, pending)
      .addCase(fetchPetHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchPetHistory.rejected, rejected);
  },
});

export const { clearSelected, clearError } = petsSlice.actions;
export default petsSlice.reducer;
