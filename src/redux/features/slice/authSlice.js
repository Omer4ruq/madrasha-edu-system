import { createSlice } from '@reduxjs/toolkit';

// loadState for user info etc (excluding token)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (!serializedState) {
      return { user: null, role: null, profile: null, token: null, refresh_token: null, group_id: null, group_name: null, role_id: null, username: null };
    }
    return JSON.parse(serializedState);
  } catch {
    return { user: null, role: null, profile: null, token: null, refresh_token: null, group_id: null, group_name: null, role_id: null, username: null };
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
      const { user, role, profile, token, refresh_token, group_id, group_name, role_id, username } = action.payload;

      state.user = user;
      state.role = role;
      state.profile = profile;
      state.token = token;
      state.refresh_token = refresh_token;
      state.group_id = group_id;
      state.group_name = group_name;
      state.role_id = role_id;
      state.username = username;

      // Save user info in one key
      localStorage.setItem(
        'authState',
        JSON.stringify({ user, role, profile, token, refresh_token, group_id, group_name, role_id, username })
      );

      // Save token separately
      localStorage.setItem('token', token);
    },

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.profile = null;
      state.token = null;
      state.refresh_token = null;
      state.group_id = null;
      state.group_name = null;
      state.role_id = null;
      state.username = null;

      // Remove all keys separately
      localStorage.removeItem('authState');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
