import { createSlice } from '@reduxjs/toolkit';

// loadState for user info etc (excluding token)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (!serializedState) {
      return { user: null, role: null, profile: null };
    }
    return JSON.parse(serializedState);
  } catch {
    return { user: null, role: null, profile: null };
  }
};

// load token separately
const loadToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? token : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...loadState(),
    token: loadToken(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, role, profile, token } = action.payload;

      state.user = user;
      state.role = role;
      state.profile = profile;
      state.token = token;

      // Save user info in one key
      localStorage.setItem(
        'authState',
        JSON.stringify({ user, role, profile })
      );

      // Save token separately
      localStorage.setItem('token', token);
    },

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.profile = null;
      state.token = null;

      // Remove all keys separately
      localStorage.removeItem('authState');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
