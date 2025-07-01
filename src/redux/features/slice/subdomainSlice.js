
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subdomain: null,
};

const subdomainSlice = createSlice({
  name: "subdomain",
  initialState,
  reducers: {
    setSubdomain: (state, action) => {
      state.subdomain = action.payload;
    },
  },
});

export const { setSubdomain } = subdomainSlice.actions;
export default subdomainSlice.reducer;
