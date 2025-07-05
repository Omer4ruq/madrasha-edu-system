import { createSlice } from '@reduxjs/toolkit';

// sessionStorage থেকে ডাটা লোড করা
const loadState = () => {
    try {
        const serializedState = sessionStorage.getItem('authState');
        if (serializedState === null) {
            return { user: null, role: null, token: null, profile: null };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return { user: null, role: null, token: null, profile: null };
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState: loadState(),
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.profile = action.payload.profile;
            state.role = action.payload.role;
            state.token = action.payload.token;
            // sessionStorage-এ ডাটা সেভ করা
            sessionStorage.setItem('authState', JSON.stringify({
                user: state.user,
                profile: state.profile,
                role: state.role,
                token: state.token,
            }));
        },
        logout: (state) => {
            state.user = null;
            state.profile = null;
            state.role = null;
            state.token = null;
            // sessionStorage ক্লিয়ার করা
            sessionStorage.removeItem('authState');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;