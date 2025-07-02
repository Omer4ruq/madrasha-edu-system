import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';

const getToken = () => {
  return localStorage.getItem('token');
};

export const incomeHeadsApi = createApi({
  reducerPath: 'incomeHeadsApi',
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
  tagTypes: ['IncomeHeads'],
  endpoints: (builder) => ({
    // GET: Fetch all income heads
    getIncomeHeads: builder.query({
      query: () => '/income-heads/',
      providesTags: ['IncomeHeads'],
    }),

    // GET: Fetch single income head by ID
    getIncomeHeadById: builder.query({
      query: (id) => `/income-heads/${id}/`,
      providesTags: ['IncomeHeads'],
    }),

    // POST: Create a new income head
    createIncomeHead: builder.mutation({
      query: (incomeHeadData) => ({
        url: '/income-heads/',
        method: 'POST',
        body: incomeHeadData,
      }),
      invalidatesTags: ['IncomeHeads'],
    }),

    // PUT: Update an existing income head
    updateIncomeHead: builder.mutation({
      query: ({ id, ...incomeHeadData }) => ({
        url: `/income-heads/${id}/`,
        method: 'PUT',
        body: incomeHeadData,
      }),
      invalidatesTags: ['IncomeHeads'],
    }),

    // DELETE: Delete an income head
    deleteIncomeHead: builder.mutation({
      query: (id) => ({
        url: `/income-heads/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IncomeHeads'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetIncomeHeadsQuery,
  useGetIncomeHeadByIdQuery,
  useCreateIncomeHeadMutation,
  useUpdateIncomeHeadMutation,
  useDeleteIncomeHeadMutation,
} = incomeHeadsApi;