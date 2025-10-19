// src/store/slices/authSlice.ts
// --- KEY UPDATE: Added the `setAuthSession` reducer for the initializer.

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
  signIn, 
  getCurrentUser, 
  fetchUserAttributes, 
  fetchAuthSession,
  signOut 
} from "@aws-amplify/auth";

// --- Types ---
interface AuthState {
  user: any | null;
  userAttributes: any | null;
  roles: string[];
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  userAttributes: null,
  roles: [],
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// --- Async Thunk for Login ---
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: any, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login for user:', username);
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (!isSignedIn) {
        return rejectWithValue(`Sign-in requires next step: ${nextStep.signInStep}`);
      }
      
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;
      
      let roles: string[] = [];
      if (accessToken?.payload) {
        roles = (accessToken.payload['cognito:groups'] as string[]) || [];
      }
      if (roles.length === 0 && attributes['custom:role']) {
         roles.push(attributes['custom:role']);
      }

      console.log('✅ Login successful:', {
        username: currentUser.username,
        userId: currentUser.userId,
        roles: roles,
        attributes: attributes
      });

      return { user: currentUser, userAttributes: attributes, roles: roles };
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      return rejectWithValue(error.message || 'An unknown error occurred.');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    await signOut();
    dispatch(logout());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userAttributes = null;
      state.roles = [];
      state.status = 'idle';
      state.error = null;
    },
    // --- NEW REDUCER TO HANDLE SESSION RESTORATION ---
    setAuthSession: (state, action: PayloadAction<{ user: any; userAttributes: any; roles: string[] }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.userAttributes = action.payload.userAttributes;
      state.roles = action.payload.roles;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: any; userAttributes: any; roles: string[] }>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userAttributes = action.payload.userAttributes;
        state.roles = action.payload.roles;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setAuthSession } = authSlice.actions;
export default authSlice.reducer;