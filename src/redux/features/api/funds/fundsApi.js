import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const fundsApi = createApi({
  reducerPath: 'fundsApi',
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
  tagTypes: ['Funds'],
  endpoints: (builder) => ({
    // GET: Fetch all funds
    getFunds: builder.query({
      query: () => '/funds/',
      providesTags: ['Funds'],
    }),

    // GET: Fetch single fund by ID
    getFundByIds: builder.query({
      query: (id) => `/funds/${id}/`,
      providesTags: ['Funds'],
    }),

    // POST: Create a new fund
    createFunds: builder.mutation({
      query: (fundData) => ({
        url: '/funds/',
        method: 'POST',
        body: fundData,
      }),
      invalidatesTags: ['Funds'],
    }),

    // PUT: Update an existing fund
    updateFunds: builder.mutation({
      query: ({ id, ...fundData }) => ({
        url: `/funds/${id}/`,
        method: 'PUT',
        body: fundData,
      }),
      invalidatesTags: ['Funds'],
    }),

    // DELETE: Delete a fund
    deleteFunds: builder.mutation({
      query: (id) => ({
        url: `/funds/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Funds'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFundsQuery,
  useGetFundsByIdQuery,
  useCreateFundsMutation,
  useUpdateFundsMutation,
  useDeleteFundsMutation,
} = fundsApi;