import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ownersReducer from './slices/ownersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    owners: ownersReducer,
  },
});
