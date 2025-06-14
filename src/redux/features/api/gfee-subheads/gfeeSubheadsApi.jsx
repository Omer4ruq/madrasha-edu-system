import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const gfeeSubheadsApi = createApi({
  reducerPath: 'gfeeSubheadsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['GfeeSubheads'],
  endpoints: (builder) => ({
    // GET: Fetch all gfee subheads
    getGfeeSubheads: builder.query({
      query: () => '/gfee-subheads/',
      providesTags: ['GfeeSubheads'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetGfeeSubheadsQuery,
} = gfeeSubheadsApi;