import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const storedUser = localStorage.getItem('vetclinic_user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('vetclinic_token'),
  refreshToken: localStorage.getItem('vetclinic_refresh_token'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    return await authService.login(email, password);
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Login failed. Please check your credentials.';
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try {
    return await authService.register(data);
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Registration failed. Please try again.';
    return thunkAPI.rejectWithValue(message);
  }
});

function persistAuth(token, refreshToken, user) {
  localStorage.setItem('vetclinic_token', token);
  localStorage.setItem('vetclinic_refresh_token', refreshToken);
  localStorage.setItem('vetclinic_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('vetclinic_token');
  localStorage.removeItem('vetclinic_refresh_token');
  localStorage.removeItem('vetclinic_user');
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      clearAuth();
    },
    setCredentials(state, action) {
      const { token, refreshToken, email, fullName, role } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = { email, fullName, role };
      persistAuth(token, refreshToken, { email, fullName, role });
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        const { token, refreshToken, email, fullName, role } = action.payload;
        state.token = token;
        state.refreshToken = refreshToken;
        state.user = { email, fullName, role };
        persistAuth(token, refreshToken, { email, fullName, role });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
