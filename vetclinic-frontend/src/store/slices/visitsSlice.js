import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import visitsService from '../../services/visitsService';

const extractMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.title) return err.response.data.title;
  if (typeof err.response?.data === 'string') return err.response.data;
  return err.message || 'An error occurred';
};

export const fetchVisits = createAsyncThunk('visits/fetchAll', async (_, thunkAPI) => {
  try {
    return await visitsService.getAll();
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchVisit = createAsyncThunk('visits/fetchOne', async (id, thunkAPI) => {
  try {
    return await visitsService.getById(id);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const createVisit = createAsyncThunk('visits/create', async (data, thunkAPI) => {
  try {
    return await visitsService.create(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const updateVisit = createAsyncThunk('visits/update', async ({ id, data }, thunkAPI) => {
  try {
    return await visitsService.update(id, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const deleteVisit = createAsyncThunk('visits/delete', async (id, thunkAPI) => {
  try {
    await visitsService.remove(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchDiagnoses = createAsyncThunk('visits/fetchDiagnoses', async (visitId, thunkAPI) => {
  try {
    return await visitsService.getDiagnoses(visitId);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const addDiagnosis = createAsyncThunk('visits/addDiagnosis', async ({ visitId, data }, thunkAPI) => {
  try {
    return await visitsService.addDiagnosis(visitId, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const fetchTreatments = createAsyncThunk('visits/fetchTreatments', async (visitId, thunkAPI) => {
  try {
    return await visitsService.getTreatments(visitId);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const addTreatment = createAsyncThunk('visits/addTreatment', async ({ visitId, data }, thunkAPI) => {
  try {
    return await visitsService.addTreatment(visitId, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const updateDiagnosis = createAsyncThunk('visits/updateDiagnosis', async ({ visitId, diagnosisId, data }, thunkAPI) => {
  try {
    return await visitsService.updateDiagnosis(visitId, diagnosisId, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const deleteDiagnosis = createAsyncThunk('visits/deleteDiagnosis', async ({ visitId, diagnosisId }, thunkAPI) => {
  try {
    await visitsService.deleteDiagnosis(visitId, diagnosisId);
    return diagnosisId;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const updateTreatment = createAsyncThunk('visits/updateTreatment', async ({ visitId, treatmentId, data }, thunkAPI) => {
  try {
    return await visitsService.updateTreatment(visitId, treatmentId, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(extractMessage(err));
  }
});

export const deleteTreatment = createAsyncThunk('visits/deleteTreatment', async ({ visitId, treatmentId }, thunkAPI) => {
  try {
    await visitsService.deleteTreatment(visitId, treatmentId);
    return treatmentId;
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

const visitsSlice = createSlice({
  name: 'visits',
  initialState: {
    list: [],
    selected: null,
    diagnoses: [],
    treatments: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.diagnoses = [];
      state.treatments = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, pending)
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchVisits.rejected, rejected)

      .addCase(fetchVisit.pending, pending)
      .addCase(fetchVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchVisit.rejected, rejected)

      .addCase(createVisit.pending, pending)
      .addCase(createVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createVisit.rejected, rejected)

      .addCase(updateVisit.pending, pending)
      .addCase(updateVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
        const idx = state.list.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateVisit.rejected, rejected)

      .addCase(deleteVisit.pending, pending)
      .addCase(deleteVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((v) => v.id !== action.payload);
        state.selected = null;
      })
      .addCase(deleteVisit.rejected, rejected)

      .addCase(fetchDiagnoses.pending, pending)
      .addCase(fetchDiagnoses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.diagnoses = action.payload;
      })
      .addCase(fetchDiagnoses.rejected, rejected)

      .addCase(addDiagnosis.pending, pending)
      .addCase(addDiagnosis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.diagnoses.push(action.payload);
      })
      .addCase(addDiagnosis.rejected, rejected)

      .addCase(fetchTreatments.pending, pending)
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treatments = action.payload;
      })
      .addCase(fetchTreatments.rejected, rejected)

      .addCase(addTreatment.pending, pending)
      .addCase(addTreatment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treatments.push(action.payload);
      })
      .addCase(addTreatment.rejected, rejected)

      .addCase(updateDiagnosis.pending, pending)
      .addCase(updateDiagnosis.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.diagnoses.findIndex((d) => d.diagnosisId === action.payload.diagnosisId);
        if (idx !== -1) state.diagnoses[idx] = action.payload;
      })
      .addCase(updateDiagnosis.rejected, rejected)

      .addCase(deleteDiagnosis.pending, pending)
      .addCase(deleteDiagnosis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.diagnoses = state.diagnoses.filter((d) => d.diagnosisId !== action.payload);
      })
      .addCase(deleteDiagnosis.rejected, rejected)

      .addCase(updateTreatment.pending, pending)
      .addCase(updateTreatment.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.treatments.findIndex((t) => t.treatmentId === action.payload.treatmentId);
        if (idx !== -1) state.treatments[idx] = action.payload;
      })
      .addCase(updateTreatment.rejected, rejected)

      .addCase(deleteTreatment.pending, pending)
      .addCase(deleteTreatment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treatments = state.treatments.filter((t) => t.treatmentId !== action.payload);
      })
      .addCase(deleteTreatment.rejected, rejected);
  },
});

export const { clearSelected, clearError } = visitsSlice.actions;
export default visitsSlice.reducer;
