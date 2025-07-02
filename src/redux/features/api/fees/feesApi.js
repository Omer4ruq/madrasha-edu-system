import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const feesApi = createApi({
  reducerPath: 'feesApi',
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
  tagTypes: ['Fees'],
  endpoints: (builder) => ({
    // GET: Fetch all fees
    getFees: builder.query({
      query: () => '/fees/',
      providesTags: ['Fees'],
    }),

    // GET: Fetch single fee by ID
    getFeeById: builder.query({
      query: (id) => `/fees/${id}/`,
      providesTags: ['Fees'],
    }),

    // POST: Create a new fee
    createFee: builder.mutation({
      query: (feeData) => ({
        url: '/fees/',
        method: 'POST',
        body: feeData,
      }),
      invalidatesTags: ['Fees'],
    }),

    // PUT: Update an existing fee
    updateFee: builder.mutation({
      query: ({ id, ...feeData }) => ({
        url: `/fees/${id}/`,
        method: 'PUT',
        body: feeData,
      }),
      invalidatesTags: ['Fees'],
    }),

    // DELETE: Delete a fee
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `/fees/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Fees'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFeesQuery,
  useGetFeeByIdQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feesApi;