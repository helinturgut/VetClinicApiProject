import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ownersReducer from './slices/ownersSlice';
import petsReducer from './slices/petsSlice';
import visitsReducer from './slices/visitsSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    owners: ownersReducer,
    pets: petsReducer,
    visits: visitsReducer,
    admin: adminReducer,
  },
});
