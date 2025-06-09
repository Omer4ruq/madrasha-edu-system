import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage or your preferred storage
const getToken = () => {
  return localStorage.getItem('token'); // Adjust based on your token storage method
};

export const feeHeadsApi = createApi({
  reducerPath: 'feeHeadsApi',
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
  tagTypes: ['FeeHeads'],
  endpoints: (builder) => ({
    // GET: Fetch all fee heads
    getFeeHeads: builder.query({
      query: () => '/fee-heads/',
      providesTags: ['FeeHeads'],
    }),

    // GET: Fetch single fee head by ID
    getFeeHeadById: builder.query({
      query: (id) => `/fee-heads/${id}/`,
      providesTags: ['FeeHeads'],
    }),

    // POST: Create a new fee head
    createFeeHead: builder.mutation({
      query: (feeHeadData) => ({
        url: '/fee-heads/',
        method: 'POST',
        body: feeHeadData,
      }),
      invalidatesTags: ['FeeHeads'],
    }),

    // PUT: Update an existing fee head
    updateFeeHead: builder.mutation({
      query: ({ id, ...feeHeadData }) => ({
        url: `/fee-heads/${id}/`,
        method: 'PUT',
        body: feeHeadData,
      }),
      invalidatesTags: ['FeeHeads'],
    }),

    // DELETE: Delete a fee head
    deleteFeeHead: builder.mutation({
      query: (id) => ({
        url: `/fee-heads/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeHeads'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFeeHeadsQuery,
  useGetFeeHeadByIdQuery,
  useCreateFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useDeleteFeeHeadMutation,
} = feeHeadsApi;