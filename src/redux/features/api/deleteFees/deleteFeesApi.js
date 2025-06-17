import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://demo.easydr.xyz/api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const deleteFeesApi = createApi({
  reducerPath: 'deleteFeesApi',
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
  tagTypes: ['DeleteFees'],
  endpoints: (builder) => ({
    // GET: Fetch all fees (if needed for verification)
    getDeleteFees: builder.query({
      query: () => '/delete-fees/',
      providesTags: ['DeleteFees'],
    }),

    // GET: Fetch single fee by ID before deletion
    getDeleteFeeById: builder.query({
      query: (id) => `/delete-fees/${id}/`,
      providesTags: ['DeleteFees'],
    }),

    // POST: Create a fee entry (if needed before deletion)
    createDeleteFee: builder.mutation({
      query: (feeData) => ({
        url: '/delete-fees/',
        method: 'POST',
        body: feeData,
      }),
      invalidatesTags: ['DeleteFees'],
    }),

    // PUT: Update a fee before deletion (optional use case)
    updateDeleteFee: builder.mutation({
      query: ({ id, ...feeData }) => ({
        url: `/delete-fees/${id}/`,
        method: 'PUT',
        body: feeData,
      }),
      invalidatesTags: ['DeleteFees'],
    }),

    // PATCH: Modify a fee before deletion
    patchDeleteFee: builder.mutation({
      query: ({ id, ...feeData }) => ({
        url: `/delete-fees/${id}/`,
        method: 'PATCH',
        body: feeData,
      }),
      invalidatesTags: ['DeleteFees'],
    }),

    // DELETE: Remove a fee by ID
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `/delete-fees/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DeleteFees'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetDeleteFeesQuery,
  useGetDeleteFeeByIdQuery,
  useCreateDeleteFeeMutation,
  useUpdateDeleteFeeMutation,
  usePatchDeleteFeeMutation,
  useDeleteFeeMutation,
} = deleteFeesApi;