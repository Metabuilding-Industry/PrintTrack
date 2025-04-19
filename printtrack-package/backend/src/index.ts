import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import bonsFabricationReducer from './slices/bonsFabricationSlice';
import clientsReducer from './slices/clientsSlice';
import machinesReducer from './slices/machinesSlice';
import parametresTechniquesReducer from './slices/parametresTechniquesSlice';
import controleQualiteReducer from './slices/controleQualiteSlice';
import incidentsReducer from './slices/incidentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    bonsFabrication: bonsFabricationReducer,
    clients: clientsReducer,
    machines: machinesReducer,
    parametresTechniques: parametresTechniquesReducer,
    controleQualite: controleQualiteReducer,
    incidents: incidentsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
