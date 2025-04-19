import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { BonFabrication, BonFabricationInput } from '../../types/bonFabrication';
import { bonsFabricationService } from '../../services/bonsFabricationService';

// Types
export interface BonsFabricationState {
  bons: BonFabrication[];
  currentBon: BonFabrication | null;
  loading: boolean;
  error: string | null;
  filter: {
    status: string | null;
    client: string | null;
    machine: string | null;
    dateDebut: string | null;
    dateFin: string | null;
  };
}

// Thunks
export const fetchBonsFabrication = createAsyncThunk(
  'bonsFabrication/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await bonsFabricationService.getAllBons();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBonById = createAsyncThunk(
  'bonsFabrication/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await bonsFabricationService.getBonById(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBon = createAsyncThunk(
  'bonsFabrication/create',
  async (bonData: BonFabricationInput, { rejectWithValue }) => {
    try {
      return await bonsFabricationService.createBon(bonData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBon = createAsyncThunk(
  'bonsFabrication/update',
  async ({ id, bonData }: { id: string; bonData: Partial<BonFabricationInput> }, { rejectWithValue }) => {
    try {
      return await bonsFabricationService.updateBon(id, bonData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBon = createAsyncThunk(
  'bonsFabrication/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await bonsFabricationService.deleteBon(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// État initial
const initialState: BonsFabricationState = {
  bons: [],
  currentBon: null,
  loading: false,
  error: null,
  filter: {
    status: null,
    client: null,
    machine: null,
    dateDebut: null,
    dateFin: null
  }
};

// Slice
const bonsFabricationSlice = createSlice({
  name: 'bonsFabrication',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<BonsFabricationState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = initialState.filter;
    },
    clearCurrentBon: (state) => {
      state.currentBon = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBonsFabrication
      .addCase(fetchBonsFabrication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBonsFabrication.fulfilled, (state, action: PayloadAction<BonFabrication[]>) => {
        state.bons = action.payload;
        state.loading = false;
      })
      .addCase(fetchBonsFabrication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchBonById
      .addCase(fetchBonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBonById.fulfilled, (state, action: PayloadAction<BonFabrication>) => {
        state.currentBon = action.payload;
        state.loading = false;
      })
      .addCase(fetchBonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createBon
      .addCase(createBon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBon.fulfilled, (state, action: PayloadAction<BonFabrication>) => {
        state.bons.push(action.payload);
        state.currentBon = action.payload;
        state.loading = false;
      })
      .addCase(createBon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateBon
      .addCase(updateBon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBon.fulfilled, (state, action: PayloadAction<BonFabrication>) => {
        const index = state.bons.findIndex(bon => bon._id === action.payload._id);
        if (index !== -1) {
          state.bons[index] = action.payload;
        }
        state.currentBon = action.payload;
        state.loading = false;
      })
      .addCase(updateBon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // deleteBon
      .addCase(deleteBon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBon.fulfilled, (state, action: PayloadAction<string>) => {
        state.bons = state.bons.filter(bon => bon._id !== action.payload);
        if (state.currentBon && state.currentBon._id === action.payload) {
          state.currentBon = null;
        }
        state.loading = false;
      })
      .addCase(deleteBon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const { setFilter, clearFilter, clearCurrentBon, clearError } = bonsFabricationSlice.actions;

// Selectors
export const selectBonsFabrication = (state: RootState) => state.bonsFabrication.bons;
export const selectCurrentBon = (state: RootState) => state.bonsFabrication.currentBon;
export const selectBonsLoading = (state: RootState) => state.bonsFabrication.loading;
export const selectBonsError = (state: RootState) => state.bonsFabrication.error;
export const selectBonsFilter = (state: RootState) => state.bonsFabrication.filter;

export default bonsFabricationSlice.reducer;
