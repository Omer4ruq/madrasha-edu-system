import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const subfundsApi = createApi({
  reducerPath: 'subfundsApi',
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
  tagTypes: ['Subfunds'],
  endpoints: (builder) => ({
    // GET: Fetch all subfunds
    getSubfunds: builder.query({
      query: () => '/subfunds/',
      providesTags: ['Subfunds'],
    }),

    // GET: Fetch single subfund by ID
    getSubfundById: builder.query({
      query: (id) => `/subfunds/${id}/`,
      providesTags: ['Subfunds'],
    }),

    // POST: Create a new subfund
    createSubfund: builder.mutation({
      query: (subfundData) => ({
        url: '/subfunds/',
        method: 'POST',
        body: subfundData,
      }),
      invalidatesTags: ['Subfunds'],
    }),

    // PUT: Update an existing subfund
    updateSubfund: builder.mutation({
      query: ({ id, ...subfundData }) => ({
        url: `/subfunds/${id}/`,
        method: 'PUT',
        body: subfundData,
      }),
      invalidatesTags: ['Subfunds'],
    }),

    // DELETE: Delete a subfund
    deleteSubfund: builder.mutation({
      query: (id) => ({
        url: `/subfunds/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subfunds'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSubfundsQuery,
  useGetSubfundByIdQuery,
  useCreateSubfundMutation,
  useUpdateSubfundMutation,
  useDeleteSubfundMutation,
} = subfundsApi;